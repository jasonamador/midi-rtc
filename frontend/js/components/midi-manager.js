import { html, render } from 'https://unpkg.com/lit-html?module'

customElements.define('midi-manager', class MidiManager extends HTMLElement {
  constructor () {
    super()
    this.midi = null
    this.inputs = []
    this.outputs = []
    this.peers = []

    const style = html`
      <style>
      #container {
        padding: 1em;
        border: 1px solid black;
        display: grid;
        grid-template-areas: "inputs outputs"
      }
      #inputs-container {
        grid-area: inputs
      }
      #outputs-container {
        grid-area: outputs
      }
      table {
        width: 100%;
      }
      </style>
      `

    const deviceTable = (devices, peers, peerSelectHandler) => html`
    <table>
      <tr>
        <th>Name</th>
        <th>Manufacturer</th>
        <th>State</th>
        <th>Connection</th>
        <th>Peer</th>
      </tr>
      ${devices.map(device => html`
      <tr>
        <td>${device.name}</td>
        <td>${device.manufacturer}</td>
        <td>${device.state}</td>
        <td>${device.connection}</td>
        <td>
          <select id="input-peers" @change=${peerSelectHandler(device)}>
            ${peers.map(peer => html`
            <option value=${peer.handle}>${peer.handle}</option>`
            )}
            <option value="">none</option>
          </select>
        </td>
      </tr>
        `
      )}
    </table>
    `

    this.template = (inputs, outputs, peers) => html`
    <div id="container">
      <div id="inputs-container">
        <h3>Inputs</h3>
        ${deviceTable(inputs, peers, e => this.connectInputToPeer(e))}
      </div>
      <div id="outputs-container">
        <h3>Outputs</h3>
        ${deviceTable(outputs, peers, e => this.connectPeerToOutput(e))}
      </div>
    </div>
    ${style}
    `

    this.attachShadow({ mode: 'open' })
    this.discoverMidi()
  }

  connectInputToPeer (input) {
    return event => {
      const peer = this.peers.find(p => p.handle === event.currentTarget.value)
      this.dispatchEvent(new CustomEvent('connect:input', { detail: { input, peer } }))
    }
  }

  connectPeerToOutput (output) {
    return function (event) {
      this.dispatchEvent(new CustomEvent('connect:output', { detail: output }))
    }
  }

  render () {
    render(this.template(this.inputs, this.outputs, this.peers), this.shadowRoot)
  }

  async discoverMidi () {
    navigator.requestMIDIAccess().then(midi => {
      midi.onstatechange = () => this.updateMidi()
      this.midi = midi
      this.updateMidi()
    })
  }

  updateMidi () {
    this.inputs = []
    this.outputs = []

    this.midi.inputs.forEach(input => {
      this.inputs.push(input)
    })
    this.midi.outputs.forEach(output => {
      this.outputs.push(output)
    })
    this.render()
  }

  updatePeers (peers) {
    this.peers = peers
    this.render()
  }
})
