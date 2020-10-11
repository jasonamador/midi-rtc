'use strict'

module.exports = function makeMessageHandler(session, sessionManager) {
  function sendError(message) {
    session.sendObj ({ action: 'error', message })
  }

  function validateRecipient(message) {
    if (message.recipient.id === session.id) {
      return sendError(`Cannot send message to yourself.`)
    }
    const recipient = sessionManager.getById(message.recipient.id)
    if (!recipient) {
      return sendError(`Cannot send message, session ${recipient.id} does not exist.`)
    }
    return recipient
  }

  function validateMessage(message) {
    message = JSON.parse(message)
    const missing = []
    const required = ['type', 'recipient', 'data']
    required.forEach(prop => {
      if (!Object.keys(message).includes(prop)) {
        missing.push(prop)
      }
    })
    if (missing.length > 0) {
      throw new Error(`Message is missing required properties: ${missing}`)
    }
    return message
  }

  const handlers = Object.freeze({
    changeHandle: message => {
      if (sessionManager.getByHandle(message.data)) {
        return sendError(`Handle '${message.data}' is taken`)
      }
      try {
        session.handle = message.data
      } catch (err) {
        return sendError(err.message)
      }
      sessionManager.sendUserUpdate()
    },
    generic: message => {
      const recipient = validateRecipient(message)
      if (recipient) {
        recipient.sendObj({
          type: message.type,
          sender: session.user,
          data: message.data
        })
      }
    },
  })

  return function messageHandler(rawMessage) {
    let message
    try {
      message = validateMessage(rawMessage)
    } catch (err) {
      console.error(err)
      return sendError(err.message)
    }
    console.log('Received:', message)
    const handler = handlers[message.type] || handlers.generic
    if (!handler) {
      console.log('Invalid message type')
      sendError(`Invalid message type ${message.type}`)
    } else {
      handler(message)
    }
  }
}