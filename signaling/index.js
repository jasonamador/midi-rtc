'use strict'

require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const makeId = require('uuid').v4
const users = require('./lib/make-user-manager')(makeId)
const makeMessageHandler = require('./lib/make-message-handler')
const randomName = require('./lib/random-name')

const WebSocket = require('ws')
const wss = new WebSocket.Server({server})

wss.on('connection', connection => {
  console.log('connection')
  if (users.length >= 10) {
    connection.send(JSON.stringify({type: 'error', message: 'Room is full'}))
    connection.close()
  }
  const user = users.add(randomName(), connection)
  const handleMessage = makeMessageHandler(user, users)

  const connected = users.getConnected()
  for (const recipient of connected) {
    const update = {
      mutation: 'updateUsers',
      users: users.getConnectedPublic().map(u => ({ ...u, me: u.name === recipient.name}))
    }
    recipient.connection.send(JSON.stringify(update))
  }

  connection.on('message', handleMessage)

  connection.on('close', () => {
    try {
      users.removeByConnection(connection)
    } catch (e) {
      console.error(e)
    }
  })

  connection.send(JSON.stringify({
    type: 'connect',
    message: 'You are connected!'
  }))
})

const port = process.env.WS_PORT || 9000

server.listen(port, () => {
  console.log(`Listening on ${port}`)
})

