import { constants } from './constants.js'

export default class SocketBuilder {
  constructor({ socketUrl, namespace }) {
    this.socketUrl = `${socketUrl}/${namespace}`
    this.onUserConnected = () => {}
    this.onUserDisconnected = () => {}
    this.onUserProfileUpgrade = () => {}
  }

  build() {
    const socket = globalThis.io.connect(this.socketUrl, {
      withCredentials: false,
    })

    socket.on('connect', () => console.log('connected!'))

    socket.on(constants.events.USER_CONNECTED, this.onUserConnected)
    socket.on(constants.events.USER_DISCONNECTED, this.onUserDisconnected)
    socket.on(
      constants.events.UPGRADE_USER_PERMISSION,
      this.onUserProfileUpgrade
    )

    return socket
  }

  setOnUserConnected(fn) {
    this.onUserConnected = fn

    return this
  }

  setOnUserProfileUpgrade(fn) {
    this.onUserProfileUpgrade = fn

    return this
  }

  setOnUserDisconnected(fn) {
    this.onUserDisconnected = fn

    return this
  }
}
