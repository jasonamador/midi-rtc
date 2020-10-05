module.exports = function buildMakeSession (makeId) {
    return function makeSession(handle, wsConn) {
      if (!handle) {
        throw new Error('handle is required')
      }
      if (!wsConn) {
        throw new Error('wsConn is required')
      }

      const session = {
        id: makeId(),
        connectedAt: new Date(),
        handle,
        wsConn,
      }

      return Object.freeze({
        get handle() {
          return session.handle
        },
        get id() {
          return session.id
        },
        sendObj(obj) {
          console.log('Sending to:', session.handle)
          console.log(obj)
          return session.wsConn.send(JSON.stringify(obj))
        },
        set handle(handle) {
          if (typeof handle !== 'string') {
            throw new Error('Handle must be a string')
          }
          if (handle.length < 1) {
            throw new Error('Handle must be at least one character')
          }
          session.handle = handle
        },
        isConnected: () => session.wsConn.OPEN,
        get user () {
          return {
            handle: session.handle,
            id: session.id
          }
        }
      })
    }
  }