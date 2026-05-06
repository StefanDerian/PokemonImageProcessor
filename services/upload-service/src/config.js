module.exports = {
  port: process.env.PORT || 8080,
  postgres: {
    connectionString: process.env.POSTGRES_DSN,
  },
  sqs: {
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    queueUrl: process.env.SQS_QUEUE_URL,
  },
  s3: {
    endpoint: process.env.S3_USE_SSL === 'false'
      ? `http://${process.env.S3_ENDPOINT}`
      : `https://${process.env.S3_ENDPOINT}`,
    region: 'us-east-1',
    bucket: 'raw',
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
}
