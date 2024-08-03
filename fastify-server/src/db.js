import knex from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const db = knex({
  client: 'mysql2',
  connection: {
    host: '192.168.50.50',
    user: 'accountDB',
    password: 'akdlfhem',
    database: 'note',
    port: 3306,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
})

export { db }
