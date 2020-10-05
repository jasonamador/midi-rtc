'use strict'

return function makeOutgoing ({ type, sender, recipient, data }) {
  if (!type) {
    throw new Error('Missing type')
  }
}