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

async function buildStatistics(){
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
                
                scriptsWithExecutionDetails = await fillScriptExecutionDetails(scripts);
                allScripts = allScripts.concat(scriptsWithExecutionDetails.map(script => (
                    {
                    endpoint_id: endpoint.id,
                    endpoint: endpoint.hostname,
                    script: script.name,
                    execution_time: script.last_execution ? script.last_execution.executed_at : 'N/A',
                    status: script.last_execution ? script.last_execution.status : 'N/A',
                    execution_id: script.execution_id,
                    message: script.message,
                    output: script.output ? Buffer.from(script.output).toString('base64') : null,
                    exit_code: script.exit_code,
                    script_contents: script.script_contents ? Buffer.from(script.script_contents).toString('base64') : null,
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

async function fillScriptExecutionDetails(scripts) {
    const scriptsWithExecutionDetailsPromises = scripts.map(async script => {
        if (!script.last_execution) {
            return script;  // Return the original script if there are no results
        }
        
        // Get the results of the script
        const scriptResultsUri = `/api/v1/fleet/scripts/results/${script.last_execution.execution_id}`;
        const scriptResults = await fleetApiGetRequest(scriptResultsUri);

        // If there are results, add the details to the script
        if (scriptResults) {
            return {
                ...script,
                execution_id: scriptResults.execution_id,
                message: scriptResults.message,
                output: scriptResults.output,
                exit_code: scriptResults.exit_code,
                script_contents: scriptResults.script_contents,
            };
        }
        return script;  // Return the original script if there are no results
    });

    const scriptsWithExecutionDetails = await Promise.all(scriptsWithExecutionDetailsPromises);
    return scriptsWithExecutionDetails;
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
async function getAllHostsRisks() {
    const endpoints = await listEndpoints();
    const risks = await Promise.all(
        endpoints.hosts.map(async (host) => {
            return {
                host: host.hostname,
                risk: await calculateRisk(host),
                ip: host.primary_ip,
                mac: host.primary_mac,
                os: host.platform,
                details: " ",
                vulnerabilities: host.vulnerabilities || [], // we need to replace it with actual vulnerability data
                softwareVersion: host.softwareVersion || '1.0.0', // we need to replace it with actual software version
                securityFeatures: host.securityFeatures || ['Secure Boot'] // we need to replace it with actual security features
            };
        })
    );
    return risks;
}


async function getMitigationAdvices() {
    const advices = [
        { risk: 'Risk 1', advice: 'Update BIOS to the latest version available from the vendor.' },
        { risk: 'Risk 2', advice: 'Ensure Secure Boot is enabled in the BIOS settings.' },
        { risk: 'Risk 3', advice: 'Run a full system scan with updated antivirus software.' },
        { risk: 'Risk 4', advice: 'Check and disable unused hardware interfaces in BIOS.' },
        // we need to add more advices and update to real risks
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

function getLatestChipsecExecutions(scriptsExecutionDetails, wantedScripts) {
    const scriptsExecutionDetailsWithoutNA = scriptsExecutionDetails.map(execution => {
        return {
            ...execution,
            execution_time: execution.execution_time === 'N/A' ? new Date('1970-01-01T00:00:00Z') : new Date(execution.execution_time),
            status: execution.status === 'N/A' ? 'error' : execution.status
        };})

    lastChipsecExecutions = {};
    for (const script of wantedScripts) {
        lastChipsecExecutions[script] = scriptsExecutionDetailsWithoutNA
            .filter(execution => execution.script === script)
            .sort((a, b) => b.execution_time - a.execution_time)
            [0];
    }
    return lastChipsecExecutions;
}

async function calculateRisk(host) {
    let succeededModules = 0;
    let executionScriptsDetails = await getScriptByEndpoint([host]);
    let wantedScripts = [
        'chipsec_common_bios_ts.sh',
        'chipsec_common_bios_wp.sh',
        'chipsec_common_smm.sh',
        'chipsec_common_smrr.sh',
        'chipsec_common_spi_desc.sh',
        'chipsec_common_spi_lock.sh',
        'chipsec_tools_smm_smm_ptr.sh',
    ]
    let lastScriptExecutions = getLatestChipsecExecutions(executionScriptsDetails, wantedScripts);
    // Calculate risk score: number of 'Ran' out of all scripts
    for (const script in lastScriptExecutions) {
        if (lastScriptExecutions[script].status === 'ran') {
            succeededModules += 1;
        }
    }

    let riskLevel;
    if (succeededModules <= 2) {
        riskLevel = 'High';
    } else if (succeededModules <= 4) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'Low';
    }
    return riskLevel;
}


async function removeHostById(hostId, hostInfo) {
    const headers = {
        "Authorization": `Bearer ${process.env.FLEET_API_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // Uninstall the Fleet agent from the host
        console.log(`Attempting to uninstall Fleet agent on host: ${hostInfo.hostname}`);
        const uninstallResponse = await remoteUninstallFleetAgent(hostInfo.hostname, hostInfo.username, hostInfo.password, hostInfo.privateKey);
        console.log(`Uninstall response: ${JSON.stringify(uninstallResponse)}`);

        // Remove the host from Fleet
        console.log(`Attempting to remove host with ID: ${hostId}`);
        const response = await axios.delete(`${fleetUrl}/api/v1/fleet/hosts/${hostId}`, { headers: headers });
        console.log(`Response status: ${response.status}`);
        if (response.status !== 200) {
            throw new Error(`Failed to remove host with status code: ${response.status}`);
        }
        return response.data;
    } catch (error) {
        console.error(`Error removing host: ${error.message}`);
        throw error;
    }
}


module.exports = { fleetApiGetRequest,
    getRequest, 
    listEndpoints, 
    buildStatistics,
    getAllHostsRisks,
    getMitigationAdvices,
    generateCSVReport,
    removeHostById,
    getAgentEnrollCmd, 
    getScriptByEndpoint, 
    mergeEndpointAndScripts, 
    fleetApiPostRequest, 
    listScripts
   };

