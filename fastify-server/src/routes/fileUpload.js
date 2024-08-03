// src/routes/fileUploadRoutes.js
import fs, {createWriteStream} from 'fs'
import {unlink} from 'fs/promises'
import {pipeline} from 'stream/promises'
import path from 'path'
import fastifyMultipart from '@fastify/multipart'

async function routes (fastify, options) {
  // multipart 플러그인 등록
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024 // 2GB 제한
    }
  })

  fastify.post('/upload', async (request, reply) => {
    const data = await request.file()
    const filename = data.filename

    const dt = new Date()
    const uploadDir = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`
    const uploadPath = `${options.UPLOAD_DIR}/${uploadDir}/`

    // 지정된 경로에 디렉토리가 없다면 생성
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    const savePath = path.join(uploadPath, filename)

    // 파일 저장
    await pipeline(data.file, createWriteStream(savePath))

    reply.send({ success: true, message: `File uploaded to ${savePath}`, filename })
  })

  fastify.post('/delete', async (request, reply) => {
    const defaultDir = options.UPLOAD_DIR
    try {
      const { filename } = request.body
      const dt = new Date()
      const uploadDir = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`
      const filePath = path.join(`${defaultDir}/${uploadDir}/`, filename)
      await unlink(filePath)
      reply.send({ message: 'File successfully deleted.' })
    } catch (err) {
      reply.status(500).send({ message: 'Failed to delete the file.', error: err.toString() })
    }
  })
}

export default routes
