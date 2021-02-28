'use strict'

const debug = require('debug')('multiverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('multiverse-db')
const { parsePayload } = require('./utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true,
}

const settings = {
  port: 1883,
  backend,
}

const config = {
  database: process.env.DB_NAME || 'multiverse',
  username: process.env.DB_USER || 'nico',
  password: process.env.DB_PASS || 'nico',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: (s) => debug(s),
}

const server = new mosca.Server(settings)

const clients = new Map()

let Agent, Metric

server.on('clientConnected', (client) => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', (client) => {
  debug(`Client Disconnected: ${client.id}`)
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic} `)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      {
        debug(`Payload: ${packet.payload}`)

        const payload = parsePayload(packet.payload)

        if (payload) {
          payload.agent.connected = true

          let agent

          try {
            agent = await Agent.createOrUpdate(payload.agent)
          } catch (error) {
            return handleError(error)
          }
          debug(`Agent ${agent.uuid} saved `)

          // Notify Agent is Connected
          if (!clients.get(client.id)) {
            clients.set(client.id, agent)
            server.publish({
              topic: 'agent/connected',
              payload: JSON.stringify({
                agent: {
                  uuid: agent.uuid,
                  name: agent.name,
                  hostname: agent.hostname,
                  pid: agent.pid,
                  connected: agent.connected,
                },
              }),
            })
          }
        }
        //Store Metrics

        for (let metric of payload.metrics) {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (error) {
            return handleError(e)
          }
          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
})

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[multiverse-mqtt]')} server is running`)
})

server.on('error', handleFatalError)

function handleFatalError(error) {
  console.error(`${chalk.red('[fatal error]')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

function handleError(error) {
  console.error(`${chalk.red('[ error]')} ${error.message}`)
  console.error(error.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
