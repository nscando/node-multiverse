'use strict'

module.exports = {
  endpoint: process.env.API_ENDPOINT || 'http://localhost:3000',
  serverHost: process.env.SERVER_HOST || 'http://localhost:8080',
  apiToken:
    process.env.API_TOKEN ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5pY28iLCJhZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOlsibWV0cmljczpyZWFkIl0sImlhdCI6MTYxNTgxOTAwN30.xQg6uYixJ4a8swrMi5f-TdQ-UaEpzf3HBLiHbJuJRFY',
}
