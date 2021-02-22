'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

const config = {
  logging: function () {},
}
let MetricStub = {
  belongsTo: sinon.spy(),
}

let single = Object.assign({}, agentFixtures.single)
let id = 1
let AgentStub = null
let db = null
let sandbox = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy(),
  }

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub,
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.restore()
})

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist.')
})

test.serial('Setup', (t) => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed.')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Argument should be the MetricModel.'
  )
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Argument should be the AgentModel.'
  )

  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed.')
})

test.serial('Agent#findById', async (t) => {
  let agent = await db.Agent.findById(id)
  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})
