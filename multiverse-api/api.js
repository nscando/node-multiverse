'use strict'

const debug = require('debug')('multiverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const db = require('multiverse-db')
const config = require('./config')

const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to DB')
    try {
      services = await db(config.db)
    } catch (e) {
      return next(e)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', auth(config.auth), async (req, res, next) => {
  debug('A request has come to /agents')

  const { user } = req

  if (!user || !user.username) {
    return next(new Error('Unauthorized'))
  }

  let agents = []

  try {
    if (user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (error) {
    return next(error)
  }

  res.send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /agent/${uuid}`)

  let agent = []

  try {
    agent = await Agent.findByUuid(uuid)
  } catch (error) {
    return next(error)
  }

  if (!agent) {
    return next(new Error(`Agent not found with uuid ${uuid}`))
  }
  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`request to /metrics/${uuid}`)

  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (error) {
    return next(error)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metrics not found for agent with uuid ${uuid}`))
  }
  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`request to /metrics/${uuid}/${type}`)

  let metrics = []
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (error) {
    return next(error)
  }
  if (!metrics || metrics.length === 0) {
    return next(
      new Error(`Metrics (${type}) not found for agent with uuid: ${uuid}.`)
    )
  }

  res.send(metrics)
})

module.exports = api
