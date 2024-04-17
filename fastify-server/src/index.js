// src/index.js
import fastify from 'fastify'
import dotenv from 'dotenv'
import routesFileUpload from './routes/fileUpload.js'
import path from 'path'
import Swagger from '@fastify/swagger'
import SwaggerUi from '@fastify/swagger-ui'

// 환경 변수 로드
dotenv.config()

const app = fastify({ logger: { level: 'debug' } })

// 환경 변수에서 업로드 디렉토리 및 포트 설정
const port = process.env.PORT

await app.register(Swagger)
await app.register(SwaggerUi, {
  exposeRoute: true,
  routePrefix: '/docs'
})

// 파일 업로드 라우트 등록
let uploadDir = process.env.UPLOAD_DIR_LOCAL
if (process.env.NODE_ENV.toLowerCase().trim() === 'production') {
  uploadDir = process.env.UPLOAD_DIR_SERVER
}
console.log(uploadDir)
app.register(routesFileUpload, { prefix: '/fast', UPLOAD_DIR: path.resolve(uploadDir) })
app.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const start = async () => {
  try {
    // 서버 리스너 설정
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server listening on ${app.server.address().port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
