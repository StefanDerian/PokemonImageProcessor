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
    endpoint: process.env.MINIO_USE_SSL === 'false'
      ? `http://${process.env.MINIO_ENDPOINT}`
      : `https://${process.env.MINIO_ENDPOINT}`,
    region: 'us-east-1',
    bucket: process.env.MINIO_BUCKET || 'pokemon-cards',
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
}
