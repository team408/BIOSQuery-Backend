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

async function fleetApiGetRequest(uri) {
    fleetUrl = `https://${process.env.FLEET_SERVER}:${process.env.FLEET_SERVER_PORT}`;
    response = await getRequest(fleetUrl + uri, headers = { "Authorization": `Bearer ${process.env.FLEET_API_TOKEN}` })
    return response
};

async function buildDashboard(){
    // get all endpoints in order to iterate their ids in getScriptByEndpoint
    endpoints = await listEndpoints();
    // sending the endpoints to the data
    data = getScriptByEndpoint(endpoints.hosts);
    return data;
};

async function getScriptByEndpoint(endpointList){
    // keeping al scripts in a var
    let allScripts = [];

    // iterating each endpoint
    for (const endpoint of endpointList) {

        // building the API url with the correct endpoint id each time
        let scriptUri = `/api/v1/fleet/hosts/${endpoint.id}/scripts`;
        try {
            // sending the request and listening for response
            const response = await fleetApiGetRequest(scriptUri);
            console.log(response);
            console.log(`Scripts for endpoint ${endpoint.id}:`, response.data); // Log the response to check its structure
            const scripts = response.data.scripts;
            if (scripts) {
                allScripts = allScripts.concat(scripts.map(script => ({
                    endpoint: endpoint.hostname,
                    script: script.name,
                    execution_time: script.last_execution.executed_at,
                    status: script.last_execution.status
                })));
            } else {
                console.warn(`No scripts found for endpoint ${endpoint.id}`);
            }
        } catch (error) {
            console.error(`Error fetching scripts for endpoint ${endpoint.id}:`, error);
        }
    }
    console.log(`allScripts ${allScripts}`);
    return allScripts;
};

//add running scripts on endpoint on demand
//POST /api/v1/fleet/scripts/run/sync

//add scripts through API
//POST /api/v1/fleet/scripts



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
module.exports = { fleetApiGetRequest, getRequest, listEndpoints, buildDashboard, getAgentEnrollCmd};