'use strict'

module.exports = function makeMessageHandler(session, sessionManager) {
  function sendError(message) {
    session.sendObj ({ action: 'error', message })
  }

  function validateRecipient(message) {
    if (!message.recipientId) {
      return sendError(`Message is missing 'recipientId'.`)
    }
    if (message.recipientId === session.id) {
      return sendError(`Cannot send message to yourself.`)
    }
    const recipient = sessionManager.getById(message.recipientId)
    if (!recipient) {
      return sendError(`Cannot send message, session ${recipientId} does not exist.`)
    }
    return recipient
  }

  function validateMessage(message) {
    message = JSON.parse(message)
    const missing = []
    const required = ['type', 'recipientId', 'data']
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
    offer: message => {
      const recipient = validateRecipient(message)
      if (recipient) {
        recipient.sendObj({
          type: 'offer',
          senderId: session.id,
          senderHandle: session.handle,
          data: message.data
        })
      }
    },
    answer: message => {
      const recipient = validateRecipient(message)
      if (recipient) {
        recipient.sendObj({
          type: 'answer',
          senderId: session.id,
          senderHandle: session.handle,
          data: message.data
        })
      }
    },
    candidate: message => {
      const recipient = validateRecipient(message)
      if (recipient) {
        recipient.sendObj({
          type: 'candidate',
          senderId: session.id,
          senderHandle: session.handle,
          data: message.data
        })
      }
    }
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
    const handler = handlers[message.type]
    if (!handler) {
      console.log('Invalid message type')
      sendError(`Invalid message type ${message.type}`)
    } else {
      handler(message)
    }
  }
}