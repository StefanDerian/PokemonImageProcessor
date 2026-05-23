const Redis = require('ioredis')
const config = require('./config')

const redis = new Redis(config.redis.url)

async function publish(jobId, payload) {
  await redis.publish(`job:${jobId}`, JSON.stringify(payload))
}

module.exports = { publish }
