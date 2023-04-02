import { constants } from './constants.js'

export default class SocketBuilder {
  constructor({ socketUrl, namespace }) {
    this.socketUrl = `${socketUrl}/${namespace}`
    this.onUserConnected = () => {}
    this.onUserDisconnected = () => {}
  }

  build() {
    const socket = globalThis.io.connect(this.socketUrl, {
      withCredentials: false,
    })

    socket.on('connection', () => console.log('connected!'))

    socket.on(constants.events.USER_CONNECTED, this.onUserConnected)
    socket.on(constants.events.USER_DISCONNECTED, this.onUserDisconnected)

    return socket
  }

  setOnUserConnected(fn) {
    this.onUserConnected = fn

    return this
  }

  setOnUserDisconnected(fn) {
    this.onUserDisconnected = fn

    return this
  }
}
