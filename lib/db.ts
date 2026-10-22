import postgres from 'postgres'

// Create PostgreSQL connection with local storage
const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'foresight',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
})

// Initialize once before database-backed routes run.
let initialization: Promise<void> | undefined

export function initializeDatabase() {
  if (!initialization) {
    initialization = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS persons (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          date_of_birth TEXT,
          notes TEXT,
          photo_base64 TEXT,
          face_descriptor TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS recognition_logs (
          id SERIAL PRIMARY KEY,
          person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
          confidence REAL,
          recognized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `

      await sql`
        CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(name);
      `

      await sql`
        CREATE INDEX IF NOT EXISTS idx_recognition_logs_person_id ON recognition_logs(person_id);
      `

    console.log('Database initialized successfully')
    })().catch((error) => {
      initialization = undefined
      console.error('Database initialization error:', error)
      throw error
    })
  }

  return initialization
}

export { sql }
export default sql
