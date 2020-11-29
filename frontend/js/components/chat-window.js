import { html, render } from 'https://unpkg.com/lit-html?module'

customElements.define('chat-window', class ChatWindow extends HTMLElement {
  constructor () {
    super()
    this.peer = null
    this.me = null
    this.messages = []
    const chatContainer = (peer, messages, me) => {
      return html`
      <div id="container">
        <h2>${peer ? `${peer.handle}` : 'No peer'}</h2>
        <div id="messages">
          <ul>
          ${messages.map(entry => html`
            <li class="message ${entry.sender.id === me.id ? 'fromMe' : 'fromPeer'}">
              <p class="handle">${entry.sender.handle}</p>
              <p>${entry.text}</p>
            </li>`
          )}
          </ul>
        </div>
        <div id="input-container">
          <input id="message-input"></input>
          <button id="send" @click=${e => this.sendMessage()}>SEND</button>
        </div>
      </div>`
    }

    const style = html`
      <style>
      #container {
        padding: 1em;
        border: 1px solid black;
      }

      ul {
        padding: 0;
        list-style: none;
      }
      .fromMe {
        text-align: right;
      }

      .fromMe .handle {
        color: red;
      }

      .fromPeer {
        text-align: left;
      }

      .fromPeer .handle {
        color: lightblue;
      }

      </style>
      `

    this.template = (peer, messages, me) => html`
      ${chatContainer(peer, messages, me)}
      ${style}
    `
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  render () {
    render(this.template(this.peer, this.messages, this.me), this.shadowRoot)
    this.input = this.shadowRoot.getElementById('message-input')
  }

  loadConversation ({ peer, me, messages }) {
    this.messages = messages
    this.me = me
    this.peer = peer
    this.render()
  }

  sendMessage() {
    const message = {
      sender: this.me,
      recipient: this.peer,
      text: this.input.value
    }
    this.dispatchEvent(new CustomEvent('sendMessage', { detail: message }))
    this.input.value = ''
  }

  connectedCallback () {
  }
})
