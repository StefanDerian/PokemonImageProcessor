const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, SendMessageCommand } = require('@aws-sdk/client-sqs')
const config = require('./config')

const sqs = createSqsClient(config.sqs.endpoint, config.sqs.region)
const dlq = createSqsClient(config.sqs.dlqUrl, config.sqs.region)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function createSqsClient(endpoint, region) {
  return new SQSClient({
    endpoint: endpoint,
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    },
  })
}

function sendToDlq(message) {
  return dlq.send(new SendMessageCommand({
    QueueUrl: config.sqs.dlqUrl,
    MessageBody: message.Body,
  }))
}

async function consume(handler) {
  console.log('processing-service consuming from SQS...')
  const receiveParams = {
    QueueUrl: config.sqs.queueUrl,
    MaxNumberOfMessages: 2,
    WaitTimeSeconds: 20,
    VisibilityTimeout: 30,
  }
  let jobId = 0;

  while (true) {
    try {
      await sleep(5000)
      const { Messages } = await sqs.send(new ReceiveMessageCommand(receiveParams));

      if (!Messages || Messages.length === 0) {
        console.log('No messages to process.')
      } else {
        for (const message of Messages) {
          console.log('Processing message:', message.Body)
          jobId = message.job_id || 0;

          // TODO: process the job here using the handler function

          await sqs.send(new DeleteMessageCommand({
            QueueUrl: config.sqs.queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          }))

          console.log('Message deleted successfully.')

          // send notification 
          fetch(`http://frontend:3000/api/notify/${jobId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { ...message.Body , status: 'completed' }
          }).then(() => {
            console.log('Completed Notification sent successfully.')
          }).catch(err => console.error('Error sending notification:', err));

        }
      }
    } catch (error) {
       // send notification 
      fetch(`http://frontend:3000/api/notify/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { status: 'failed' }
      }).then(() => {
        console.log('Failed Notification sent successfully.')
      }).catch(err => console.error('Error sending notification:', err));
      console.error('Error consuming messages:', error)
    }
  }
}

module.exports = { consume }
