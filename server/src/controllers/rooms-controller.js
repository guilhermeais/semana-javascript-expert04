import Attendee from '../entities/attendee.js'
import BaseController from './base-controller.js'
import { constants } from '../util/constants.js'
import Room from '../entities/room.js'
import CustomMap from '../util/custom-map.js'

export default class RoomsController extends BaseController {
  #users = new Map()

  constructor({ roomsPubSub }) {
    super()

    this.roomsPubSub = roomsPubSub
    this.rooms = new CustomMap({
      observer: this.#roomObserver(),
    })
  }

  #roomObserver() {
    return {
      notify: rooms => this.notifyRoomSubscribers(rooms),
    }
  }

  notifyRoomSubscribers(rooms) {
    const event = constants.event.LOBBY_UPDATED
    this.roomsPubSub.emit(event, [...rooms.values()])
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

  disconnect(socket) {
    console.log('disconnected', socket.id)
    this.#logoutUser(socket)
  }

  #logoutUser(socket) {
    const { id: userId } = socket
    const user = this.#users.get(userId)

    if (!user) {
      return
    }

    this.#users.delete(userId)

    const { roomId } = user
    const room = this.rooms.get(roomId)

    if (!room) {
      return
    }

    const toBeRemoved = [...room.users].find(({ id }) => id === userId)
    room.users.delete(toBeRemoved) // o set precisa ser deletado assim, com o objeto unico

    const isRoomEmpty = room.users.size === 0

    if (isRoomEmpty) {
      this.rooms.delete(roomId)
      return
    }

    const disconnectedUserWasAnOwner = user.id === room.owner.id
    const onlyOneUserLeft = room.users.size === 1

    if (onlyOneUserLeft || disconnectedUserWasAnOwner) {
      room.owner = this.#getNewRoomOwner(room, socket)
    }

    const updatedRoom = this.#mapRoom(room)
    this.rooms.set(roomId, updatedRoom)

    socket.to(roomId).emit(constants.event.USER_DISCONNECTED, user)
  }

  #notifyUserProfileUpgrade(socket, roomId, user) {
    socket.to(roomId).emit(constants.event.UPGRADE_USER_PERMISSION, user)
  }

  #getNewRoomOwner(room, socket) {
    const users = [...room.users.values()]
    const activeSpeakers = users.find(user => user.isSpeaker)

    const [newOwner] = activeSpeakers ? [activeSpeakers] : users
    newOwner.isSpeaker = true

    const outdatedUser = this.#users.get(newOwner.id)
    const updatedUser = new Attendee({
      ...outdatedUser,
      ...newOwner,
    })

    this.#users.set(newOwner.id, updatedUser)

    this.#notifyUserProfileUpgrade(socket, room.id, updatedUser)

    return updatedUser
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
