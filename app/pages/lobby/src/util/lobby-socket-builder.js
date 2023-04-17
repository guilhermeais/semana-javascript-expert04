import { constants } from '../../../_shared/constants.js'
import SocketBuilder from '../../../_shared/socket-builder.js'

export default class LobbySocketBuilder extends SocketBuilder {
  constructor(params) {
    super(params)

    this.onLobbyUpdated = () => {}
  }

  setOnRoomUpdated(fn) {
    this.onLobbyUpdated = fn

    return this
  }

  setOnLobbyUpdated(fn) {
    this.onLobbyUpdated = fn

    return this
  }

  build() {
    const socket = super.build()

    socket.on(constants.events.LOBBY_UPDATED, this.onLobbyUpdated)

    return socket
  }
}
