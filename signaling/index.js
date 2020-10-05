'use strict'

// external dependencies
require('dotenv').config()
const WebSocket = require('ws')
const http = require('http')
const express = require('express')
const randomName = require('./lib/random-name')
const makeId = require('uuid').v4

// factories
const buildMakeSession = require('./lib/entities/sessions')
const makeSessionManager = require('./lib/controllers/make-session-manager')
const makeMessageHandler = require('./lib/controllers/make-message-handler')

// bootstrap server
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({
  server
})

// build handlers
const makeSession = buildMakeSession(makeId)
const sessionManager = makeSessionManager(makeSession)

wss.on('connection', connection => {
  console.log('connection')
  try {
    const session = sessionManager.add(randomName(), connection)
    const handleMessage = makeMessageHandler(session, sessionManager)
    connection.on('message', handleMessage)
  } catch (e) {
    console.error(e)
  }
})

const port = process.env.PORT || 9000

server.listen(port, () => {
  console.log(`Listening on ${port}`)
})