const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();

const connectionsTable = process.env.CONNECTIONS_TABLE
const apiId = process.env.API_ID
const stage = process.env.STAGE

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

exports.handler = async(event) => {
    for (const record of event.Records) {
        const key = record.s3.object.key
        console.log(`Processing S3 Item with key ${key}`)

        //get a list of connections from out table
        const connections = await docClient.scan({
            TableName: connectionsTable
        }).promise()

        //create a payload to send to our client
        const payload = {
            imageId: key
        }

        //iterate over items in the connection, get an id of ecah connection
        //send a message toeach specific connection Id providing the payload
        for (const connection of connections.Items) {
            const connectionId = connection.id
            await sendMessageToClient(connectionId, payload)
        }


    }

}

async function sendMessageToClient(connectionId, payload) {

    try {
        console.log(`Sending message to a connection, ${connectionId}`)
        //use postToConnection method of the apiGateway to send message
        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise()

    } catch (e) {
        console.log(`Failed to send message, ${JSON.stringify(e)}`)
        //if we get an exception for a statuscode of 410 (stale connection)
        //delete the ID from connectionsTable
        if (e.statusCode === 410) {
            console.log('Stale connection')

            await docClient.delete({
                TableName: connectionsTable,
                Key: {
                    id: connectionId
                }
            }).promise()
        }

    }
}