'use strict'
/* eslint prefer-const: [0, {"destructuring": "all"}] */

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

const config = {
  logging: function () {}
}
const MetricStub = {
  belongsTo: sinon.spy()
}

const id = 1
const uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null

const single = Object.assign({}, agentFixtures.single)

let usernameArgs = { where: { username: 'nico', connected: true } }
let connectedArgs = { where: { connected: true } }
let uuidArgs = {
  where: {
    uuid
  }
}
let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(
    Promise.resolve({
      toJSON () {
        return newAgent
      }
    })
  )

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)))

  // Model findAll Stubs
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.nico))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
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

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(
    AgentStub.findById.calledWith(id),
    'findById should be called with specified id'
  )

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#findByUuid', async (t) => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    'findOne should be called with uuid args'
  )

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
})

test.serial('Agent#findAll', async (t) => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(
    AgentStub.findAll.calledWith(),
    'findAll should be called without args'
  )

  t.is(
    agents.length,
    agentFixtures.all.length,
    'agents should be the same amount'
  )
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('Agent#findConnected', async (t) => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(
    AgentStub.findAll.calledWith(connectedArgs),
    'findAll should be called with connected args'
  )

  t.is(
    agents.length,
    agentFixtures.connected.length,
    'agents should be the same amount'
  )
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('Agent#findByUsername', async (t) => {
  let agents = await db.Agent.findByUsername('nico')

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(
    AgentStub.findAll.calledWith(usernameArgs),
    'findAll should be called with username args'
  )

  t.is(
    agents.length,
    agentFixtures.nico.length,
    'agents should be the same amount'
  )
  t.deepEqual(agents, agentFixtures.nico, 'agents should be the same')
})

test.serial('Agent#createOrUpdate - exists', async (t) => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    'findOne should be called with uuid args'
  )
  t.true(AgentStub.update.called, 'agent.update called on model')
  t.true(AgentStub.update.calledOnce, 'agent.update should be called once')
  t.true(
    AgentStub.update.calledWith(single),
    'agent.update should be called with specified args'
  )

  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async (t) => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(
    AgentStub.findOne.calledWith({
      where: { uuid: newAgent.uuid }
    }),
    'findOne should be called with uuid args'
  )
  t.true(AgentStub.create.called, 'create should be called on model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(
    AgentStub.create.calledWith(newAgent),
    'create should be called with specified args'
  )

  t.deepEqual(agent, newAgent, 'agent should be the same')
})