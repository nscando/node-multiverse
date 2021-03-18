'use strict'
const chalk = require('chalk')
const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'multiverse',
    username: process.env.DB_USER || 'nico',
    password: process.env.DB_PASS || 'nico',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'jjj',
    name: 'nico',
    username: 'nico',
    hostname: 'nico',
    pid: 3,
    connected: true
  }).catch(handleFatalError)

  console.log('--agent--')
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log('--agents--')
  console.log(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(
    handleFatalError
  )
  console.log('--metrics--')
  console.log(metrics)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  console.log('--metrics--')
  console.log(metric)

  const metricsType = await Metric.findByTypeAgentUuid(
    'memory',
    agent.uuid
  ).catch(handleFatalError)

  console.log('--metrics--')
  console.log(metricsType)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

run()
