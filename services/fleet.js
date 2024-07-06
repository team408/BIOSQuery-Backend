process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
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

async function listEndpoints() {
    let endpointsUri = '/api/v1/fleet/hosts'
    let endpoints = await fleetApiGetRequest(endpointsUri);
    
    // No endpoints found
    if (endpoints.hosts==0){
        return endpoints;
    }

    const endpointsWithChipsec = await endpointsChipsecStatus();

    newData = { "chipsec": 1 };
    endpoints.hosts = endpoints.hosts.map(host => {
        if (endpointsWithChipsec.includes(host.hostname)) {
            return { ...host, ...newData };
        } else {
            return host;
        }
    });
    return endpoints;
}

async function endpointsChipsecStatus() {
    const allQueries = await listQueries();
    const lsmodQueryID = allQueries.queries.find(query => query.name === "lsmod-chipsec").id;
    queryResults = await getQueryResults(lsmodQueryID);
    endpointsWithChipsec = queryResults.results.map(item => item.host_name);
    return endpointsWithChipsec
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
async function getAgentEnrollCmd(osType = deb){
    // API call to get enrollment cli accordig to given OS Type
    getSecretUri = "/api/v1/fleet/spec/enroll_secret";
    enrollSecret = await fleetApiGetRequest(getSecretUri);
    cmd = "fleetctl package --type=" +osType+" --enable-scripts --fleet-url="+fleetUrl+" --enroll-secret="+enrollSecret.spec.secrets[0].secret +";";
    return cmd;
}

module.exports = { fleetApiGetRequest, getRequest, listEndpoints , getAgentEnrollCmd};