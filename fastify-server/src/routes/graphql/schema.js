const schema = `
 type Note {
    id: Int
    title: String
    content: String
    labels: String
    created_at: String
    updated_at: String
  }

  type Query {
    notes: [Note]
    note(id: Int!): Note
  }

  type Mutation {
    addNote(title: String!, content: String!, labels: String): Note
  }
`

export default schema
