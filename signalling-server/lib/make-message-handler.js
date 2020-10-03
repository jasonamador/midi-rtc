'use strict'

module.exports = function makeMessageHandler(user, users) {
  function sendError(message) {
    user.connection.send(JSON.stringify({ type: 'error', message }))
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
    return message.recipient
  }

  function sendToAll(message) {
    message = JSON.stringify(message)
    const connections = users.getConnections()
    for (const c of connections) {
      c.send(message)
    }
  }

  const handlers = Object.freeze({
    nameChange: message => {
      if (!message.name) {
        return sendError('Name change message must include a name')
      }
      if (users.getByName(message.name)) {
        return sendError(`'${message.name} already exists`)
      }
      try {
        user.name = message.name
      } catch (err) {
        return sendError(err.message)
      }
      const nameUpdate = {
        type: 'userUpdate',
        users: users.getConnected()
      }
      sendToAll(nameUpdate)
    },
    offer: message => {
      const recipient = validateRecipient(message)
      const offer = {
        type: 'offer',
        sender: user.name,
        offer: message.offer
      }
      sendTo(recipient, offer)
    },
    answer: message => {
      const recipient = validateRecipient(message)
      const answer = {
        type: 'answer',
        sender: user.name,
        answer: message.answer
      }
      sendTo(recipient, answer)
    },
    candidate: message => {
      const recipient = validateRecipient(message)
      const candidate = {
        type: 'candidate',
        sender: user.name,
        candidate: message.candidate
      }
      sendTo(recipient, candidate)
    }
  })

  return function messageHandler(rawMessage) {
    let data
    try {
      data = JSON.parse(rawMessage)
    } catch (err) {
      return sendError('Invalid JSON')
    }

    const message = data
    const handler = handlers[message.type]
    if (!handler) {
      connection.send(JSON.stringify({type: 'error', message: `Invalid message type ${message.type}`}))
    } else {
      handler(message)
    }
  }
}