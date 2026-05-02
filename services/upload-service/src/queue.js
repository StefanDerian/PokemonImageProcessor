const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')
const config = require('./config')

const sqs = new SQSClient({
  endpoint: config.sqs.endpoint,
  region: config.sqs.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
})

async function enqueue(jobId, imageKey) {
  await sqs.send(new SendMessageCommand({
    QueueUrl: config.sqs.queueUrl,
    MessageBody: JSON.stringify({ job_id: jobId, image_key: imageKey }),
  }))
}

module.exports = { enqueue }
