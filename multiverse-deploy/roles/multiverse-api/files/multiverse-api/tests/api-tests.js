'use strict'
/* eslint prefer-const: [0, {"destructuring": "all"}] */

const test = require('ava')
const util = require('util')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')
const auth = require('../auth')
const config = require('../config')

const sign = util.promisify(auth.sign)

let sandbox = null
let server = null
let dbStub = null
let token = null
let AgentStub = {}
let MetricStub = {}
let uuid = 'yyy-yyy-yyy'
let wrongUuid = 'xxx-yyy-yyy'

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  dbStub = sandbox.stub()
  dbStub.returns(
    Promise.resolve({
      Agent: AgentStub,
      Metric: MetricStub
    })
  )

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  token = await sign({ admin: true, username: 'nico' }, config.auth.secret)

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid
    .withArgs(uuid)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.findByUuid.withArgs(wrongUuid).returns(Promise.resolve(null))

  const api = proxyquire('../api', {
    'multiverse-db': dbStub
  })
  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(async () => {
  sandbox && sinon.restore()
})

// const server = require('../server')

test.serial.cb('/api/agents', (t) => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expect')
      t.end()
    })
})

test.serial.cb('/api/agents - Unauthorized', (t) => {
  request(server)
    .get('/api/agents')
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = res.body
      t.regex(
        body.error,
        /No authorization/,
        'should have UNAUTHORIZED on error'
      )
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid', (t) => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid - not found', (t) => {
  request(server)
    .get(`/api/agent/${wrongUuid}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        console.log(err)
      }
      t.truthy(res.body.error, 'should return an error')
      t.regex(res.body.error, /not found/, 'Error should contains not found')
      t.end()
    })
})
