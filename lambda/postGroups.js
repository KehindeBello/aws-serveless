const AWS = require("aws-sdk");
const uuid = require("uuid");

const docClient = new AWS.DynamoDB.DocumentClient();
const groupTable = process.env.GROUP_TABLE;

exports.handler = async (event) => {
    console.log("Processing ", event)
    const itemId = uuid.v4();

    const parsedBody = JSON.parse(event.body);

    const newItem = {
        id: itemId,
        ...parsedBody
    }

    await docClient.put({
        TableName: groupTable,
        Item: newItem
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Content-Type': "application/json",
            'Access-Control-Allow-Methods' : '*',
            'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify({
            newItem
        })
    }
}