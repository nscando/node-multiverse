'use strict'

const jwt = require('jsonwebtoken')

function sign(payload, secret, cb) {
  jwt.sign(payload, secret, cb)
}

function verify(token, secret, cb) {
  jwt.verify(token, secret, cb)
}

module.exports = {
  sign,
  verify,
}
