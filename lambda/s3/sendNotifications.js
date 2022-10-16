exports.handler = async(event) => {
    for (const record of event.Records) {
        const key = record.s3.object.key
        console.log(`Processing S3 Item with key ${key}`)
    }
}