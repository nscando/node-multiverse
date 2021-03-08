'use strict'

const debug = require('debug')('multiverse:api:db')

module.exports = {
  db: {
    database: process.env.DB_NAME || 'multiverse',
    username: process.env.DB_USER || 'nico',
    password: process.env.DB_PASS || 'nico',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (s) => debug(s),
  },
  auth: {
    secret: process.env.SECRET || 'multiverse',
    algorithms: ['HS256'],
  },
}
