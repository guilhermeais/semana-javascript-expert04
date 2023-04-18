import { constants } from '../util/constants.js'
import BaseController from './base-controller.js'

export default class LobbyController extends BaseController {
  constructor({ activeRooms, roomsListener }) {
    super()
    this.activeRooms = activeRooms
    this.roomsListener = roomsListener
  }

  onNewConnection(socket) {
    const { id } = socket
    console.log('[Lobby] connection stablished with', id)

    this.#updateLobbyRooms(socket, [...this.activeRooms.values()])
    this.#activateEventProxy(socket)
  }

  #updateLobbyRooms(socket, activeRooms) {
    socket.emit(constants.event.LOBBY_UPDATED, activeRooms)
  }

  #activateEventProxy(socket) {
    this.roomsListener.on(constants.event.LOBBY_UPDATED, rooms => {
      this.#updateLobbyRooms(socket, rooms)
    })
  }
}
