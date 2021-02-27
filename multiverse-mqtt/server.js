'use strict'

const debug = require('debug')('multiverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true,
}

const settings = {
  port: 1883,
  backend,
}

const server = new mosca.Server(settings)

server.on('ready', () => {
  console.log(`${chalk.green('[multiverse-mqtt]')} server is running`)
})
