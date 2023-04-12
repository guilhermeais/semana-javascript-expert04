import { constants } from '../../_shared/constants.js'
import Attendee from './entities/attendee.js'

export default class RoomController {
  constructor({ socketBuilder, roomInfo, view }) {
    /**
     * @type {import('./util/roomSocket').default}
     */
    this.socketBuilder = socketBuilder
    this.roomInfo = roomInfo
    this.socket = {}
    this.view = view
  }

  static initialize(deps) {
    return new RoomController(deps)._initialize()
  }

  async _initialize() {
    this._setupViewEvents()

    this.socket = await this._setupSocket()
    this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo)
  }

  _setupViewEvents() {
    this.view.updateUserImage(this.roomInfo.user)
    this.view.updateRoomTopic(this.roomInfo.room)
  }

  _setupSocket() {
    return this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onDisconnected())
      .setOnRoomUpdated(this.onRoomUpdated())
      .setOnUserProfileUpgrade(this.onUserProfileUpgrade())
      .build()
  }

  onRoomUpdated() {
    return room => {
      console.log('room list!', room)
      this.view.updateAttendeesOnGrid(room)
    }
  }

  onDisconnected() {
    return data => {
      const attendee = new Attendee(data)
      console.log(`${attendee.username} has disconnected!`)

      this.view.removeItemFromGrid(attendee.id)
    }
  }

  onUserConnected() {
    return data => {
      const attendee = new Attendee(data)
      console.log('user connected!', attendee)
      this.view.addAttendeeOnGrid(attendee)
    }
  }

  onUserProfileUpgrade() {
    return data => {
      const attendee = new Attendee(data)
      console.log('user profile upgrade!', attendee)
      this.view.updateAttendeeOnGrid(attendee)
    }
  }
}
