import {db} from '../../db.js'

const resolvers = {
  Query: {
    notes: async () => {
      console.log('Fetching notes...')
      return await db('notes').select('*')
    },
    note: async (_, { id }) => {
      console.log(`Fetching note with id: ${id}`)
      return await db('notes').where({ id }).first()
    }
  },
  Mutation: {
    addNote: async (_, { title, content, labels }) => {
      const [id] = await db('notes').insert({ title, content, labels })
      return await db('notes').where({ id }).first()
    }
  }
}

export default resolvers
