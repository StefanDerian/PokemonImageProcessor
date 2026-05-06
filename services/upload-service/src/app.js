const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
// const db = require('./db')
const { uploadFile } = require('./storage')
const { enqueue } = require('./queue')

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

app.get('/health', (_, res) => res.json({ ok: true }))

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' })

  const jobId = uuidv4()
  const ext = req.file.originalname.split('.').pop()
  const imageKey = `originals/${jobId}.${ext}`

  try {
    await uploadFile(imageKey, req.file.buffer, req.file.mimetype)

    // await db.query(
    //   `INSERT INTO jobs (id, status, image_key, created_at) VALUES ($1, $2, $3, NOW())`,
    //   [jobId, 'pending', imageKey]
    // )

    await enqueue(jobId, imageKey)

    res.json({ job_id: jobId })
  } catch (err) {
    console.error('upload error', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

module.exports = app
