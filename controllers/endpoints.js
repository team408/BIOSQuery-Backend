const axios = require('axios').default;

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

async function getEndpoints(req, res) {
    fleetUrl = `https://${process.env.FLEET_SERVER_IP}:${process.env.FLEET_SERVER_PORT}`;
    endpointsUri = '/api/v1/fleet/hosts?page=0&per_page=100'
    endpointsJson = await getRequest(fleetUrl + endpointsUri, headers = { "Authorization": `Bearer ${process.env.FLEET_API_TOKEN} ` })
    res.render("endpoints.ejs", { endpoints: endpointsJson.hosts });
};

module.exports = { getEndpoints };