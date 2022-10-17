const AWS = require("aws-sdk");

const connectionTable = process.env.CONNECTIONS_TABLE
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log("Websocket disconnect", event)
    
    const connectionId = event.requestContext.connectionId
    const timestamp = new Date().toISOString();

    //key to delete
    const item = {
        id: connectionId,
    }

    await docClient.delete({
        TableName: connectionTable,
        Key: item
    }).promise()

    return {
        statusCode: 200,
        body: ""
    }
}