const fleetService = require('../services/fleet');

exports.removeHost = async (req, res) => {
    try {
        const hostId = req.params.hostId;
        await fleetService.removeHostById(hostId);
        res.status(200).send({ message: "Host removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to remove host" });
    }
};
