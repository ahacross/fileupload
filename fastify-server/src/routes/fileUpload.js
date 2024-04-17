// src/routes/fileUploadRoutes.js
import fs, { createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import { pipeline } from 'stream/promises'
import path from 'path'
import fastifyMultipart from '@fastify/multipart'
import { randomUUID } from 'crypto'

async function routes (fastify, options) {
  // multipart 플러그인 등록
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 1 * 1024 * 1024 * 1024 // 10MB 제한
    }
  })

  fastify.post('/upload', async (request, reply) => {
    const data = await request.file()
    const filename = data.filename
    const uploadDir = options.UPLOAD_DIR

    // 지정된 경로에 디렉토리가 없다면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uniqueFilename = `${randomUUID()}-${filename}` // 중복 방지를 위한 고유 파일명
    const savePath = path.join(uploadDir, uniqueFilename)

    // 파일 저장
    await pipeline(data.file, createWriteStream(savePath))

    reply.send({ success: true, message: `File uploaded to ${savePath}`, filename: uniqueFilename })
  })

  fastify.post('/delete', async (request, reply) => {
    const uploadDir = options.UPLOAD_DIR
    try {
      const { filename } = request.body
      const filePath = path.join(uploadDir, filename)
      await unlink(filePath)
      reply.send({ message: 'File successfully deleted.' })
    } catch (err) {
      reply.status(500).send({ message: 'Failed to delete the file.', error: err.toString() })
    }
  })
}

export default routes
