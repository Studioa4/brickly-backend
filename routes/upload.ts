import { Router } from 'express'
import multer from 'multer'
import pkg from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

const { S3 } = pkg

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ errore: 'File mancante' })

  const key = `brickly/${uuidv4()}_${file.originalname}`

  try {
    const result = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
      })
      .promise()

    res.json({
      successo: true,
      fileUrl: result.Location,
      chiave: result.Key,
    })
  } catch (err) {
    console.error('Errore upload S3:', err)
    res.status(500).json({ errore: 'Errore durante l’upload' })
  }
})

export default router
