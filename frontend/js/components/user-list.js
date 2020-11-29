import { html, render } from 'https://unpkg.com/lit-html?module'

customElements.define('user-list', class UserList extends HTMLElement {
  constructor (users) {
    super()
    this.users = users || ['a', 'b', 'c'].map(u => ({ handle: u }))

    this.template = users => html`
      <style>
      ul {
        list-style: none;
      }
      </style>
      <div id="user-list-wrapper">
        <ul>
          ${users.map(user => html`<li><a @click=${this.clicked(user)}>${user.handle}</a></li>`)}
        </ul>
      </div>
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
