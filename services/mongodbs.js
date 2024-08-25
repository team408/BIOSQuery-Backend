const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI

// Create a MongoClient 
function getMongoClient(){
    return new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      })
}

/**
 * @param {String} collectionName 
 * @param {JSON} query dictionary
*/
async function queryCollection(collectionName, query) {
    // Connect the client to the server	(optional starting in v4.7)
    let client = getMongoClient();
    try {
        await client.connect();
        // Access the database and collection
        const database = client.db('biosqDB');
        const collection = database.collection(collectionName);

        // Query a document from the collection
        const cursor = await collection.find(query);
        
        let array = await cursor.toArray();
        return array
    } catch(err){
        console.error(err)
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

/**
 * @param {String} collectionName 
 * @param {JSON} document 
 * @return {ObjectId} objectId
*/
async function insertOneCollection(collectionName, document) {
    // Connect the client to the server	(optional starting in v4.7)
    let client = getMongoClient();
    try {
        await client.connect();
        // Access the database and collection
        const database = client.db('biosqDB');
        const collection = database.collection(collectionName);

        // Query a document from the collection
        const insertResult = await collection.insertOne(document);

        // Return the inserted _id as a response
        return insertResult.insertedId;
    } catch(err){
        console.error(err)
        return false;
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

/**
 * @param {String} collectionName 
 * @return {ObjectId} objectId
 * @param {JSON} setJson field and value to be modified for example: {read: false}3
 * @returns {boolean} true if success false else
*/
async function modifyOneInCollection(collectionName, objectId, setJson) {
    // Connect the client to the server	(optional starting in v4.7)
    let client = getMongoClient();
    try {
        await client.connect();
        // Access the database and collection
        const database = client.db('biosqDB');
        const collection = database.collection(collectionName);

        // Find the document to get the current read status
        const document = await collection.findOne({ _id: objectId });
        if (!document) {
            console.log("Document not found.");
            return false;
        }

        // Update the document with the new read status
        const updateResult = await collection.updateOne(
            { _id: objectId },
            { $set: setJson }
        );

        if (updateResult.modifiedCount === 1) {
            console.log(`Successfully updated document with id ${objectId}.`);
            return true
        } else {
            console.log("No document updated.");
            return false
        }
    } catch(err){
        console.error(err)
        return false
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

/**
 * @param {String} collectionName 
 * @param {JSON} query
 * @param {JSON} setJson field and value to be modified for example: {read: false}
*/
async function modifyAllInCollection(collectionName, query, setJson) {
    // Connect the client to the server	(optional starting in v4.7)
    let client = getMongoClient();
    try {
        await client.connect();
        // Access the database and collection
        const database = client.db('biosqDB');
        const collection = database.collection(collectionName);

        // Update all documents to set read: false
        const updateResult = await collection.updateMany(
            query,  // Empty filter matches all documents
            { $set: setJson }
        );

        console.log(`Matched ${updateResult.matchedCount} documents and updated ${updateResult.modifiedCount} documents.`);
        return updateResult.matchedCount
    } catch(err){
        console.error(err)
        return 0;
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

module.exports = {
    queryCollection,
    insertOneCollection,
    modifyOneInCollection,
    modifyAllInCollection
}