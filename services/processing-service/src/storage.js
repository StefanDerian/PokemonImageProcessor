const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const config = require('./config')

const s3 = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  forcePathStyle: true,
})

async function getFile(key) {
  const result = await s3.send(new GetObjectCommand({
    Bucket: config.s3.rawBucket,
    Key: key,
  }))
  const chunks = []
  for await (const chunk of result.Body) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function putFile(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: config.s3.annotatedBucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
  return key
}

module.exports = { getFile, putFile }
