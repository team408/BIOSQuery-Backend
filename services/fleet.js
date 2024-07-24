// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //Only in dev mode!
const axios = require('axios').default;

fleetUrl = `https://${process.env.FLEET_SERVER}:${process.env.FLEET_SERVER_PORT}`

async function getRequest(url, headers = null) {
    try {
        if (headers) {
            response = (await axios.get(url, { headers: headers }));
            return response.data;
        } else {
            response = (await axios.get(url));
            return response.data;
        }
    } catch (error) {
        console.error(error);
    }
}

async function listScripts(){
    try{
        scriptsUri = "/api/v1/fleet/scripts";
        scripts = await fleetApiGetRequest(scriptsUri);
        return scripts.scripts;
    } catch (error) {
        console.error(error);
    }

}

async function fleetApiGetRequest(uri) {
    fleetUrl = `https://${process.env.FLEET_SERVER}:${process.env.FLEET_SERVER_PORT}`;
    response = await getRequest(fleetUrl + uri, headers = { "Authorization": `Bearer ${process.env.FLEET_API_TOKEN}` })
    return response
};

async function fleetApiPostRequest(uri,data){
    fleetUrl = `https://${process.env.FLEET_SERVER}:${process.env.FLEET_SERVER_PORT}`;
    let headers = {
        "Authorization": `Bearer ${process.env.FLEET_API_TOKEN}`,
        'Content-Type': 'text/plain',
        "Accept": "application/json"
    };
    response = await axios.post(fleetUrl + uri, data, { headers: headers })
    return response;

}

async function buildDashboard(){
    // get all endpoints in order to iterate their ids in getScriptByEndpoint
    endpoints = await listEndpoints();
    // sending the endpoints to the data
    data = getScriptByEndpoint(endpoints.hosts);
    return data;
};

async function getScriptByEndpoint(endpointList) {
    // keeping all scripts in a variable
    let allScripts = [];

    // iterating each endpoint
    for (const endpoint of endpointList) {
        // building the API url with the correct endpoint id each time
        let scriptUri = `/api/v1/fleet/hosts/${endpoint.id}/scripts`;
        try {
            // sending the request and listening for response
            const response = await fleetApiGetRequest(scriptUri);
            const scripts = response.scripts;
            if (scripts) {
                
                allScripts = allScripts.concat(scripts.map(script => ({
                    endpoint: endpoint.hostname,
                    script: script.name,
                    execution_time: script.last_execution ? script.last_execution.executed_at : 'N/A',
                    status: script.last_execution ? script.last_execution.status : 'N/A'
                })));
            } else {
                console.warn(`No scripts found for endpoint ${endpoint.id}`);
            }
        } catch (error) {
            console.error(`Error fetching scripts for endpoint ${endpoint.id}:`, error);
        }
    }
    return allScripts;
}

const mergeEndpointAndScripts = (endpoints, scriptsData) => {
    // Ensure endpoints is an array
    if (!Array.isArray(endpoints)) {
        throw new TypeError('Expected endpoints to be an array');
    }

    return endpoints.map(endpoint => {
        // Fetch scripts for the current endpoint
        const scripts = scriptsData.filter(script => script.endpoint === endpoint.hostname);

        // Find the latest script whose name starts with 'chipsec'
        const chipsecScripts = scripts.filter(script => script.script.startsWith('chipsec'));
        const latestChipsecScript = chipsecScripts.reduce((latest, current) => {
            return new Date(current.execution_time) > new Date(latest.execution_time) ? current : latest;
        }, { execution_time: '1970-01-01T00:00:00Z' });

        // Format the scripts
        const formattedScripts = scripts.map(script => ({
            script: script.script,
            execution_time: script.execution_time,
            status: script.status
        }));

        // Return merged data with last_scan
        return {
            ...endpoint,
            scripts: formattedScripts,
            last_scan: latestChipsecScript.execution_time || 'N/A'
        };
    });
};

async function listEndpoints() {
    let endpointsUri = '/api/v1/fleet/hosts'
    let endpoints = await fleetApiGetRequest(endpointsUri);
    
    // No endpoints found
    if (endpoints.hosts==0){
        return endpoints;
    }

    const endpointsWithChipsec = await endpointsChipsecStatus();
    
    if (!endpointsWithChipsec){
        return endpoints;
    }
    
    newData = { "chipsec": 1 };
    endpoints.hosts = endpoints.hosts.map(host => {
        if (endpointsWithChipsec.includes(host.computer_name)) {
            return { ...host, ...newData };
        } else {
            return host;
        }
    });
    return endpoints;
}

async function endpointsChipsecStatus() {
    const allQueries = await listQueries();
    if (!allQueries){
        console.error("No queries found")
        return null;
    }
    const lsmodQueryID = allQueries.queries.find(query => query.name === "lsmod-chipsec").id;
    if (!lsmodQueryID){
        console.error("No lsmod-chipsec query found");
        return null;
    }
    queryResults = await getQueryResults(lsmodQueryID);
    if (!queryResults){
        console.error("No results found for lsmod-chipsec query");
        return null;
    }
    endpointsWithChipsec = queryResults.results.map(item => item.host_name);
    return endpointsWithChipsec;
}

async function getQueryResults(queryId) {
    getQueryResultsUri = `/api/v1/fleet/queries/${queryId}/report`;
    results = await fleetApiGetRequest(getQueryResultsUri);
    return results;
}

async function listQueries() {
    listQueriesUri = "/api/v1/fleet/queries";
    queries = await fleetApiGetRequest(listQueriesUri);
    return queries;
}

/**
 * @param {string} osType OS of host to be enrolled
 */
async function getAgentEnrollCmd(osType = "deb"){
    // API call to get enrollment cli accordig to given OS Type
    getSecretUri = "/api/v1/fleet/spec/enroll_secret";
    enrollSecret = await fleetApiGetRequest(getSecretUri);
    secret = enrollSecret.spec.secrets[0].secret
    if (!secret){
        console.error("[!] Error fetching new enroll secret from fleet via API.");
        throw new Error("[!] Error fetching new enroll secret from fleet via API.");
    }
    cmd = "fleetctl package --type=" +osType+" --insecure --enable-scripts --fleet-url="+fleetUrl+" --enroll-secret="+ secret +";";
    return cmd;
}

//methods for fetching risks and generating reports

async function getAllHostsRisks() {
    const endpoints = await listEndpoints();
    const risks = endpoints.hosts.map(host => {
        return {
            host: host.hostname,
            risk: calculateRisk(host),
            ip: host.primary_ip,
            mac: host.primary_mac,
            os: host.platform,
            details: " ",
            vulnerabilities: host.vulnerabilities || [], // Placeholder for actual vulnerability data
            softwareVersion: host.softwareVersion || '1.0.0', // Placeholder for actual software version
            securityFeatures: host.securityFeatures || ['Secure Boot'] // Placeholder for actual security features
        };
    });
    return risks;
}


async function getMitigationAdvices() {
    const advices = [
        { risk: 'Risk 1', advice: 'Update BIOS to the latest version available from the vendor.' },
        { risk: 'Risk 2', advice: 'Ensure Secure Boot is enabled in the BIOS settings.' },
        { risk: 'Risk 3', advice: 'Run a full system scan with updated antivirus software.' },
        { risk: 'Risk 4', advice: 'Check and disable unused hardware interfaces in BIOS.' },
        // Add more advices as needed
    ];
    return advices;
}

async function generateCSVReport(risks) {
    let csvContent = "Host,Risk,IP,MAC,OS,Details\n";
    risks.forEach(risk => {
        csvContent += `${risk.host},${risk.risk},${risk.ip},${risk.mac},${risk.os},${risk.details}\n`;
    });
    return csvContent;
}

function calculateRisk(host) {
    let riskScore = 0;

    // Example criteria (these are placeholders, replace with actual data points)
    const vulnerabilities = host.vulnerabilities || []; // Assume this is an array of vulnerabilities
    const criticalVulnerabilities = vulnerabilities.filter(vuln => vuln.severity === 'critical').length;
    const outdatedSoftware = isOutdatedSoftware(host.softwareVersion); // Assume a function to check if software is outdated
    const missingSecurityFeatures = countMissingSecurityFeatures(host); // Assume a function to count missing security features

    // Example weight for each criterion
    const weightVulnerabilities = 1;
    const weightCriticalVulnerabilities = 3;
    const weightOutdatedSoftware = 2;
    const weightMissingSecurityFeatures = 2;

    // Calculate risk score
    riskScore += vulnerabilities.length * weightVulnerabilities;
    riskScore += criticalVulnerabilities * weightCriticalVulnerabilities;
    riskScore += outdatedSoftware * weightOutdatedSoftware;
    riskScore += missingSecurityFeatures * weightMissingSecurityFeatures;

    // Determine risk level based on risk score
    let riskLevel;
    if (riskScore >= 10) {
        riskLevel = 'High';
    } else if (riskScore >= 5) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'Low';
    }

    return riskLevel;
}

function isOutdatedSoftware(softwareVersion) {
    // Example logic to determine if the software is outdated
    const latestVersion = '1.0.0'; // Replace with actual logic to get the latest version
    return softwareVersion < latestVersion;
}

function countMissingSecurityFeatures(host) {
    // Example logic to count missing security features
    const requiredFeatures = ['Secure Boot', 'TPM'];
    const hostFeatures = host.securityFeatures || [];
    const missingFeatures = requiredFeatures.filter(feature => !hostFeatures.includes(feature));
    return missingFeatures.length;
}

module.exports = { mergeEndpointAndScripts, fleetApiGetRequest, getRequest, listEndpoints, buildDashboard, getAgentEnrollCmd, getAllHostsRisks, getMitigationAdvices, generateCSVReport, listEndpoints, buildDashboard, getAgentEnrollCmd, calculateRisk, getScriptByEndpoint};