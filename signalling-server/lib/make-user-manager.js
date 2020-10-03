'use strict'

module.exports = function makeUserManager (makeId) {
  function makeUser(name, connection) {
    const user = { name, connection, id: makeId() }
    return Object.freeze({
      get name () { return user.name },
      get id () { return user.id },
      get connection () { return user.connection },
      set name(name) { user.name = name },
      isConnected: () => user.connection.OPEN,
      get public () { return { name: user.name, id: user.id } }
    })
  }

  const users = []

  function removeByProperty (propName, propValue) {
    const user = users.find(u => u.getProp(propName)=== propValue)
    if (!user) {
      throw new Error(`Cannot remove user with ${propName}: ${propValue}, does not exist`)
    }
    users.splice(users.indexOf(user), 1)
  }

  return Object.freeze({
    getByName: name => users.find(u => u.name === name),
    getById: id => users.find(u => u.id === id),
    getConnected: () => users.filter(u => u.isConnected()).map(u => u.public),
    getConnections: () => users.filter(u => u.isConnected()).map(u => u.connection),
    get length () { return users.length },
    add: (username, connection) => {
      if (users[username]) {
        throw new Error(`Username '${username}' is not available`)
      }
      const newUser = makeUser(username, connection)
      users.push(newUser)
      return newUser
    },
    removeByUsername: username => {
      removeByProperty('username', username)
    }, 
    removeById: id => {
      removeByProperty('id', id)
    }, 
    removeByConnection: conn => {
      removeByProperty('connection', conn)
    }
  })
}