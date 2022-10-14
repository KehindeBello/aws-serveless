const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient();

const imageTable = process.env.IMAGE_TABLE
const imageIndex = process.env.IMAGE_INDEX

exports.handler = async (event) => {
    console.log("Calling image by Id with ", event);

    const imageId = event.pathParameters.imageId;

    const result = await docClient.query({
        TableName: imageTable,
        IndexName: imageIndex,
        KeyConditionExpression: 'imageId = :imageId',
        ExpressionAttributeValues: {
            ':imageId' : imageId
        }
    }).promise()

    if (result.Count !== 0) {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify({
                image: result.Items[0]
            })
        }
    }
    return {
        statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify({
                error: "Image not found!"
            })
    }
}