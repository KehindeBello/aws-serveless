const AWS = require("aws-sdk")
const connectionTable = process.env.CONNECTIONS_TABLE

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    console.log("Web Socket Connect", event)

    const connectionId = event.requestContext.connectionId
    const timestamp = new Date().toISOString();

    const item = {
        "id": connectionId,
        timestamp
    }

    await docClient.put({
        TableName: connectionTable,
        Item: item
    }).promise()

    return {
        statusCode: 200,
        body: ''
    }
}

