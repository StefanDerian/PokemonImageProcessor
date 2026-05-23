const { consume } = require('./queue')
const { processJob } = require('./processor')

consume(processJob).catch((err) => {
  console.error('consumer crashed', err)
  process.exit(1)
})
