const { ObjectId, MongoOIDCError } = require('mongodb');
const mongodbs = require('../services/mongodbs');
const notificaitonsCollectionName = "notifications"

/**
 * 
 * @param {string} category 
 * @param {string} title 
 * @param {string} desc 
 * @returns {JSON} notification document
 */
function genNewNotification(category, title, desc){
    return doc = {
        timestamp: new Date(),
        category: category,
        title: title,
        desc: desc,
        read: false
    }
}

/**
 * @param {boolean} read status of notification if read or nay
 * @param {string} id notification id to update read status
 * @returns {ObjectId} notificationID
 */
async function newNotification(category, title, desc){
    let doc = genNewNotification(category, title, desc);
    return await mongodbs.insertOneCollection(notificaitonsCollectionName, doc)
}

/**
 * @param {boolean} readBool status of notification if read or nay
 * @param {ObjectId} id notification id to update read status
 */
async function markReadNotification(readBool, id){
    return await mongodbs.modifyOneInCollection(notificaitonsCollectionName, id, {read: readBool})
}

/**
 * @param {boolean} readBool status of notification if read or nay
 */
async function markReadAllNotification(readBool){
    return await mongodbs.modifyAllInCollection(notificaitonsCollectionName, {}, {read: readBool})
}

/**
 * @param {boolean} read status of notification if read or nay
 * @param {string} id notification id to update read status
 * @return {JSON} notification json array
 */
async function getAllNotifications(){
    return await mongodbs.queryCollection(notificaitonsCollectionName, {});
}

/**
 * @param {Date} startDate to read from
 * @param {Date} endDate to read to 
 */
async function getNotificationsByDate(startDate, endDate){
    query = {
        timestamp: {
            $gt: new Date(startDate),  // Greater than startTimestamp
            $lt: new Date(endDate)     // Less than endTimestamp
        }
    }
    return await mongodbs.queryCollection(notificaitonsCollectionName, query)
}

module.exports = {
    newNotification, 
    markReadNotification,
    markReadAllNotification,
    getAllNotifications
};