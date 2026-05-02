const { Pool } = require('pg')
const config = require('./config')

const pool = new Pool({ connectionString: config.postgres.connectionString })

module.exports = pool
