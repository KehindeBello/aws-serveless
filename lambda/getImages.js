const AWS = require("aws-sdk")


const docClient = new AWS.DynamoDB.DocumentClient();
const groupTable = process.env.GROUP_TABLE
const imageTable = process.env.IMAGE_TABLE

exports.handler = async (event) => {
    console.log("Processing ", event);

    const groupId = event.pathParameters.groupId;
    const isvalidGroupId = groupExists(groupId);

    if(!isvalidGroupId){
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: `Group with id ${groupId} does not exist`
            })
        }
    }
    const images = await getImagesperGroup(groupId);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            items: images
        })
    }
}

async function groupExists(groupId) {
    const result = await docClient.get({
        TableName: groupTable,
        Key:{
            id: groupId
        }
    }).promise()

    console.log('Group', result);
    return !!result.Item
}

async function getImagesperGroup(groupId) {
    const result = await docClient.query({
        TableName : imageTable,
        KeyConditionExpression: 'groupid = :groupId',
        ExpressionAttributeValues: {
            ':groupId' : groupId
        },
        ScanIndexForward: false
    }).promise()
    return result.Items
}