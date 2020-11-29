import { html, render } from 'https://unpkg.com/lit-html?module'

customElements.define('user-list', class UserList extends HTMLElement {
  constructor (users) {
    super()
    this.users = []

    const style = html`
      <style>
      #container {
        padding: 1em;
        border: 1px solid black;
      }

      ul {
        list-style: none;
        padding: 0;
      }
      </style>`

    this.template = users => html`
      <div id="container">
        <h2>Users</h2>
        <ul>
          ${users.map(user => html`<li><a @click=${this.clicked(user)}>${user.handle}</a></li>`)}
        </ul>
      </div>
      ${style}
    `
    this.attachShadow({ mode: 'open' })
    render(this.template(this.users), this.shadowRoot)
  }

  clicked (user) {
    if (!user.me) {
      return event => this.dispatchEvent(new CustomEvent('clickUser', { detail: { user } }))
    }
  }

  update (users) {
    this.users = users
    render(this.template(this.users), this.shadowRoot)
  }

  connectedCallback () {
  }
})
