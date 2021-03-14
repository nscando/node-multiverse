'use strict'

module.exports = {
  endpoint: process.env.API_ENDPOINT || 'http://localhost:3000',
  apiToken:
    process.env.API_TOKEN ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5pY28iLCJhZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOlsibWV0cmljczpyZWFkIl0sImlhdCI6MTYxNTczMzQyN30.bniMkLQBUg5F2Nr-DEfAtUiYRhWAJs4PeUD70OGCaW0',
}
