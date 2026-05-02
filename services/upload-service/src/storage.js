const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const config = require('./config')

const s3 = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: true,
})

async function uploadFile(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
  return key
}

module.exports = { uploadFile }
