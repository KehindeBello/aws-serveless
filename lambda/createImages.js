const AWS = require('aws-sdk')
const uuid =  require('uuid')

const docClient = new AWS.DynamoDB.DocumentClient()
const S3 = new AWS.S3({
    signatureVersion: 'v4'
  })


const groupsTable = process.env.GROUP_TABLE
const imagesTable = process.env.IMAGE_TABLE
const bucketName = process.env.IMAGE_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

exports.handler = async (event) => {
  console.log('Caller event', event)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  const parsedBody = JSON.parse(event.body);
  const imageId = uuid.v4();
  

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  const uploadUrl = getUploadUrl(imageId)
  console.log(uploadUrl);

  const newImage = {
    groupid: groupId,
    timestamp: new Date().toISOString(),
    imageId: imageId,
    ...parsedBody,
    imageurl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  }

  await docClient.put({
    TableName: imagesTable,
    Item: newImage
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        newImage: newImage,
        uploadUrl: uploadUrl
    })
  }
}

async function groupExists(groupId) {
  const result = await docClient
    .get({
      TableName: groupsTable,
      Key: {
        id: groupId
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}

function getUploadUrl(imageId) {
    return S3.getSignedUrl('putObject',{
        Bucket: bucketName,
        Key: imageId,
        Expires: Number(urlExpiration)
    })
}
