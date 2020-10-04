'use strict'

module.exports = function makeMessageHandler(user, users) {
  function sendError(message) {
    user.connection.send(JSON.stringify({ action: 'error', message }))
  }

  function sendTo(recipient, message) {
    recipient.connection.send(JSON.stringify(message))
  }

  function sendResponse(message) {
    user.connection.send(JSON.stringify(message))
  }

  function validateRecipient (message) {
    if (!message.recipient) {
      return sendError(`offer message must include a 'recipient'.`)
    }
    if (message.recipient === user.name) {
      return sendError(`Can't send offer to yourself`)
    }
    const recipient = users.getByName(message.recipient)
    if (!recipient) {
      return sendError(`Cannot send offer, user ${recipient} does not exist.`)
    }
    return recipient
  }

  function sendToAll(message) {
    message = JSON.stringify(message)
    const connections = users.getConnections()
    for (const c of connections) {
      c.send(message)
    }
  }

  function sendUserUpdate () {
    const connected = users.getConnected()
    for (const recipient of connected) {
      const update = {
        mutation: 'updateUsers',
        users: users.getConnectedPublic().map(u => ({ ...u, me: u.name === recipient.name}))
      }
      recipient.connection.send(JSON.stringify(update))
    }
  }

  const handlers = Object.freeze({
    changeName: message => {
      if (!message.name) {
        return sendError('Name change message must include a name')
      }
      if (users.getByName(message.name)) {
        return sendError(`Name '${message.name}' already exists`)
      }
      try {
        user.name = message.name
      } catch (err) {
        return sendError(err.message)
      }
      sendUserUpdate()
    },
    offer: message => {
      const recipient = validateRecipient(message)
      if (recipient) {
        const offer = {
          action: 'offer',
          sender: user.name,
          offer: message.offer
        }
        sendTo(recipient, offer)
      }
    },
    answer: message => {
      const recipient = validateRecipient(message)
      const answer = {
        mutation: 'answer',
        sender: user.name,
        answer: message.answer
      }
      sendTo(recipient, answer)
    },
    candidate: message => {
      const recipient = validateRecipient(message)
      const candidate = {
        mutation: 'candidate',
        sender: user.name,
        candidate: message.candidate
      }
      sendTo(recipient, candidate)
    }
  })

  return function messageHandler(rawMessage) {
    console.log(rawMessage)
    let data
    try {
      data = JSON.parse(rawMessage)
    } catch (err) {
      return sendError('Invalid JSON')
    }

    const message = data
    const handler = handlers[message.action]
    if (!handler) {
      console.log('Invalid message action')
      user.connection.send(JSON.stringify({type: 'error', message: `Invalid message type ${message.action}`}))
    } else {
      handler(message)
    }
  }
}