const { removeHostById } = require('../services/fleet');

exports.removeHost = async (req, res) => {
    try {
        const hostId = req.params.id;
        const hostInfo = req.body; // Ensure the client sends the necessary host info in the request body
        console.log(`Received request to remove host with ID: ${hostId}`);
        const result = await removeHostById(hostId, hostInfo);
        res.status(200).json({ message: 'Host removed successfully', data: result });
    } catch (error) {
        console.error(`Error in removeHost controller: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
