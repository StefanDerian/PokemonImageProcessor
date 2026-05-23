// const db = require('./db')
const { getFile, putFile } = require('./storage')
const { pulish } = require('./redis')

async function processJob({ job_id, image_key }) {
  
}

module.exports = { processJob }
