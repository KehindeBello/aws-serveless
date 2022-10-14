const AWS =require("aws-sdk");
const Responses = require("./Responses");

const docClient = new AWS.DynamoDB.DocumentClient();
const groupTable = process.env.GROUP_TABLE

exports.handler = async(event) => {
    console.log("Processing ", event);

    const result = await docClient.scan({ // Call parameters
        TableName: groupTable,
        Limit: 20
    }).promise()

    const items = result.Items
    
    return Responses._200(items);
}