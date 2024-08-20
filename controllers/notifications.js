const notificationsService = require('../services/notifications');

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
        if (!notificationID) {
            return res.status(400).send({ error: 'id parameter is required' });
        }
        let result
        if(notificationID === "all")
            result = await notificationsService.markReadAllNotification(true);    
        else
            result = await notificationsService.markReadNotification(true, notificationID);
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function unreadNotifcation(req, res) {
    try {
        //check from req the read vaule
        const notificationID = req.params.id;
        if (!notificationID) {
            return res.status(400).send({ error: 'id parameter is required' });
        }
        let result
        if(notificationID === "all")
            result = await notificationsService.markReadAllNotification(false);    
        else
            result = await notificationsService.markReadNotification(false, notificationID);
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {getAllNotifications, getNotificationsLastDay, readNotifcation, unreadNotifcation}