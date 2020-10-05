'use strict'

module.exports = function makeSessionManager(makeSession, maxSessions = 10) {
  const sessions = []

  function removeByProperty(propName, propValue) {
    const session = sessions.find(u => u[propName] === propValue)
    if (!session) {
      throw new Error(`Cannot remove session with ${propName}: ${propValue}, does not exist`)
    }
    sessions.splice(sessions.indexOf(session), 1)
  }

  function sendToAll(message) {
    message = JSON.stringify(message)
    const connections = sessions.getConnections()
    for (const c of connections) {
      c.send(message)
    }
  }

  function sendUserUpdate() {
    for (const session of sessions) {
      const message = {
        type: 'updateUsers',
        data: sessions.map(s => s.user).map(u => ({
          ...u,
          me: u.id === session.id
        }))
      }
      session.sendObj(message)
    }
  }

  return Object.freeze({
    getByHandle: handle => sessions.find(s => s.handle === handle),
    getById: id => sessions.find(s => s.id === id),
    getConnected: () => sessions.filter(s => s.isConnected()),
    get length() {
      return sessions.length
    },
    add: (handle, wsConn) => {
      if (sessions.length >= maxSessions) {
        wsConn.send(JSON.stringify({
          type: 'error',
          message: 'Max sessions'
        }))
        wsConn.close()
      }
      // TODO: retry
      if (sessions.find(s => s.handle === handle)) {
        throw new Error(`Handle '${handle}' is not available`)
      }
      const newSession = makeSession(handle, wsConn)
      wsConn.on('close', () => {
        removeByProperty('id', newSession.id)
        sendUserUpdate()
      })
      sessions.push(newSession)
      sendUserUpdate()
      return newSession
    },
    sendUserUpdate,
    sendToAll,
    removeByHandle: handle => {
      removeByProperty('handle', handle)
    },
    removeById: id => {
      removeByProperty('id', id)
    },
  })
}