'use strict'

const debug = require('debug')('multiverse:agent')
const mqtt = require('mqtt')
const defaults = require('default')
const uuid = require('uuid')
const EventEmitter = require('events')

const { parsePayload } = require('multiverse-utils')

const options = {
  name: 'untitled',
  username: 'nico',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost',
  },
}

class MultiverseAgent extends EventEmitter {
  constructor(opts) {
    super()

    this._options = defaults(opts, options)
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
  }

  connect() {
    if (!this._started) {
      const opts = this._options
      this._client = mqtt.connect(opts.mqtt.host)
      this._started = true

      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this._agentId = uuid.v4()

        this.emit('connected', this._agentId)

        this._timer = setInterval(() => {
          this.emit('agent/message', 'this is the message')
        }, opts.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)
        let brodcast = false

        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            brodcast =
              payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }

        if (brodcast) {
          this.emit(topic, payload)
        }
      })

      this._client.on('error', () => {
        this.disconnect()
      })
    }
  }

  disconnect() {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected')
    }
  }
}

module.exports = MultiverseAgent
