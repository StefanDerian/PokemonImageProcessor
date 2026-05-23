module.exports = {
  postgres: {
    connectionString: process.env.POSTGRES_DSN,
  },
  sqs: {
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    queueUrl: process.env.SQS_QUEUE_URL,
    dlqUrl: process.env.SQS_DLQ_URL,
  },
  s3: {
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    rawBucket: 'raw',
    annotatedBucket: 'annotated',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
}
