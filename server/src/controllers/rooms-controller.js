import Attendee from '../entities/attendee.js'
import BaseController from './base-controller.js'
import { constants } from '../util/constants.js'
import Room from '../entities/room.js'

export default class RoomsController extends BaseController {
  #users = new Map()

  constructor() {
    super()

    this.rooms = new Map()
  }

  joinRoom(socket, { user, room }) {
    const userId = (user.id = socket.id)
    const roomId = room.id

    const updatedUserData = this.#updateGlobalUserData(userId, user, roomId)

    const updatedRoom = this.#joinUserRoom(socket, {
      user: updatedUserData,
      room,
    })

    this.#notifyUsersOnRoom(socket, roomId, updatedUserData)
    this.#replyWithActiveUsers(socket, [...updatedRoom.users.values()])
  }

  onNewConnection(socket) {
    const { id } = socket

    console.log('connection established with', id)

    this.#updateGlobalUserData(id)
  }

  #notifyUsersOnRoom(socket, roomId, user) {
    const eventName = constants.event.USER_CONNECTED

    socket.to(roomId).emit(eventName, user)
  }

  #replyWithActiveUsers(socket, users) {
    const eventName = constants.event.LOBBY_UPDATED

    socket.emit(eventName, users)
  }

  #joinUserRoom(socket, { room, user }) {
    const { id: roomId } = room
    const roomAlreadyExists = this.rooms.has(roomId)
    const currentRoom = roomAlreadyExists ? this.rooms.get(roomId) : {}
    const currentUser = new Attendee({
      ...user,
      roomId,
    })

    const [owner, users] = roomAlreadyExists
      ? [currentRoom.owner, currentRoom.users]
      : [currentUser, new Set()]

    const updatedRoom = this.#mapRoom({
      ...currentRoom,
      ...room,
      owner,
      users: new Set([...users, ...[currentUser]]),
    })

    this.rooms.set(roomId, updatedRoom)

    socket.join(roomId)

    return updatedRoom
  }

  #mapRoom(room) {
    const users = [...room.users.values()]

    const speakersCount = users.filter(user => user.isSpeaker).length
    const featuredAttendees = users.slice(0, 3)

    const mappedRoom = new Room({
      ...room,
      speakersCount,
      featuredAttendees,
      attendeesCount: room.users.size,
    })

    return mappedRoom
  }

  #updateGlobalUserData(userId, userData = {}, roomId = '') {
    const user = this.#users.get(userId) ?? {}
    const existingRoom = this.rooms.has(roomId)

    const updatedUserData = new Attendee({
      ...user,
      ...userData,
      roomId,
      isSpeaker: !existingRoom,
    })

    this.#users.set(userId, updatedUserData)

    return updatedUserData
  }
}
