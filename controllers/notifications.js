const notificationsService = require('../services/notifications');
const readStrToBool = {"read" : true, "unread" : false}

async function getAllNotifications(req, res) {
    try {
        const result = await notificationsService.getAllNotifications();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function getNotificationsLastDay(req, res) {
    try {
        const now = new Date();  // Get the current date and time
        let midnight = new Date();  // Create a new Date object based on the current date
        midnight.setHours(0,0,0,0)
        result = await notificationsService.getNotificationsByDate(midnight, now)
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function readNotifcation(req, res) {
    try {
        //check from req the read vaule
        const notificationID = req.params.id;
        const readBoolStr = req.params.readBoolStr;
        if (!notificationID) {
            return res.status(400).send({ error: 'id parameter is required' });
        }
        if (!readBoolStr) {
            return res.status(400).send({ error: 'readBoolStr parameter is required' });
        }
        const readBool = readStrToBool[readBoolStr];
        let result;
        if(notificationID === "all")
            result = await notificationsService.markReadAllNotification(readBool);    
        else
            result = await notificationsService.markReadNotification(readBool, notificationID);
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {getAllNotifications, getNotificationsLastDay, readNotifcation}