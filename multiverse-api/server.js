'use stric'

const http = require('http')
const express = require('express')
const chalk = require('chalk')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

app.use('/api', api)

server.listen(port, () => {
  console.log(
    `${chalk.yellow(
      '[multiverse-api]'
    )} server listening on port http://localhost:${chalk.red(port)}`
  )
})
