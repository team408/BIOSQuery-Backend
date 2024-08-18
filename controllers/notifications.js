const notificationsService = require('../services/notifications');

async function getAllNotifications(req, res) {
    console.log("Called it!")
    try {
        const result = await notificationsService.getAllNotifications();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {getAllNotifications}