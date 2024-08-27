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

async function fleetApiDeleteRequest(uri){
    fleetUrl = `https://${process.env.FLEET_SERVER}:${process.env.FLEET_SERVER_PORT}`;
    let headers = {"Authorization": `Bearer ${process.env.FLEET_API_TOKEN}`};
    response = await axios.delete(fleetUrl + uri, { headers: headers })
    return response;
}

async function buildStatistics(){
    // get all endpoints in order to iterate their ids in getScriptsByEndpoint
    endpoints = await listEndpoints();
    // sending the endpoints to the data
    data = getScriptsByEndpointList(endpoints.hosts);
    return data;
};

async function getScriptsBySingleEndpoint(endpoint) {
    // keeping all scripts in a variable
    let allScripts = [];
    
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
    return allScripts;
}

async function getScriptsByEndpointList(endpointList) {
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
async function getEndpoint(hostID) {
    let endpointsUri = '/api/v1/fleet/hosts/' + hostID
    let endpoint = await fleetApiGetRequest(endpointsUri);
    
    // No endpoints found
    if (!endpoint.hasOwnProperty("host")){
        return null;
    }

    return endpoint.host;
}


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
    const secret = enrollSecret.spec.secrets[0].secret
    if (!secret){
        console.error("[!] Error fetching new enroll secret from fleet via API.");
        throw new Error("[!] Error fetching new enroll secret from fleet via API.");
    }
    const cmd = "fleetctl package --type=" +osType+" --insecure --enable-scripts --fleet-url="+fleetUrl+" --enroll-secret="+ secret +";";
    return cmd;
}
async function getScriptIdByName(scriptName){
    const scripts = await listScripts();
        const script = scripts.find(script => script.name === scriptName);
        if (!script){
            return null
        }
        return script.id
}

async function runScriptByName(hostId, scriptName){
    const scriptId = await getScriptIdByName(scriptName);
    return await runScriptById(hostId, scriptId);
}

async function runScriptById(hostId, scriptId){
    let module_data=`{"host_id": ${hostId}, "script_id": ${scriptId}}`;
    const response = await fleetApiPostRequest("/api/latest/fleet/scripts/run", data=module_data)
    // check if script has been ran correctly?
    if (response.status != 409){
        console.error("[!] Script is already in queue to host.")
        return null
    }
    // check if script has been ran correctly?
    if (response.status != 202){
        console.error("[!] Error running script")
        return null
    }
    return response.data.execution_id;
}
async function removeHostFromFleetById(hostId) {

    // Remove the host from Fleet
    const response = await fleetApiDeleteRequest(`/api/v1/fleet/hosts/${hostId}`)
    console.log(`Response status: ${response.status}`);
    if (response.status !== 200) {
        return response.data;
    }
    return true;
}

async function getScriptsByHost(hostId) {
    try {
        // Construct the URI to fetch scripts for the specific host
        const scriptUri = `/api/v1/fleet/hosts/${hostId}/scripts`;
        
        // Fetch the scripts using the existing fleetApiGetRequest function
        const response = await fleetApiGetRequest(scriptUri);
        
        // If the response contains scripts, return them; otherwise, return an empty array
        return await response.scripts || [];
    } catch (error) {
        console.error(`Error fetching scripts for host ${hostId}:`, error);
        throw error;
    }
}


module.exports = {
    listEndpoints, 
    getEndpoint,
    buildStatistics,
    getAgentEnrollCmd,
    getScriptsByEndpointList,
    getScriptsBySingleEndpoint,
    mergeEndpointAndScripts, 
    fleetApiGetRequest,
    fleetApiPostRequest, 
    fleetApiDeleteRequest,
    listScripts,
    getScriptIdByName,
    runScriptByName,
    removeHostFromFleetById,
    getScriptsByHost,
    removeHostFromFleetById
   };