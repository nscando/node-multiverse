'use strict'

/* eslint prefer-const: [0, {"destructuring": "all"}] */

const debug = require('debug')('multiverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const minimist = require('minimist')
const db = require('./')

const args = minimist(process.argv)
const prompt = inquirer.createPromptModule()

async function setup () {
  if (!args.yes) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])

    if (!answer.setup) {
      return console.log('Nothing happened :)')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'multiverse',
    username: process.env.DB_USER || 'nico',
    password: process.env.DB_PASS || 'nico',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (s) => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)

  console.log('Success!')

  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
