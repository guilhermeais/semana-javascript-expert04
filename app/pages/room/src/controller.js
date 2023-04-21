import { constants } from '../../_shared/constants.js'
import Attendee from './entities/attendee.js'

export default class RoomController {
  constructor({ socketBuilder, roomInfo, view, peerBuilder, roomService }) {
    /**
     * @type {import('./util/roomSocket').default}
     */
    this.socketBuilder = socketBuilder
    this.roomInfo = roomInfo
    this.socket = {}
    this.view = view
    this.peerBuilder = peerBuilder
    this.roomService = roomService
  }

  static initialize(deps) {
    return new RoomController(deps)._initialize()
  }

  async _initialize() {
    this._setupViewEvents()

    this.socket = await this._setupSocket()
    this.peer = await this._setupWebRTC()
    this.roomService.setCurrentPeer(this.peer)
    this.roomService.init()
  }

  _setupViewEvents() {
    this.view.updateUserImage(this.roomInfo.user)
    this.view.updateRoomTopic(this.roomInfo.room)
  }

  _setupWebRTC() {
    return this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpenned())
      .setOnCallReceived(this.onCallReceived())
      .setOnCallError(this.onCallError())
      .setOnCallClose(this.onCallClose())
      .setOnStreamReceived(this.onStreamReceived())
      .build()
  }

  onCallClose() {
    return call => {
      console.log('call closed!', call)
      const peerId = call.peer
      this.roomService.disconnectPeer({
        peerId,
      })
    }
  }

  onCallError() {
    return (call, error) => {
      console.log('call error!', error)
      const peerId = call.peer
      this.roomService.disconnectPeer({
        peerId,
      })
    }
  }

  onCallReceived() {
    return async call => {
      const stream = await this.roomService.getCurrentStream()
      console.log('answering call', call)

      call.answer(stream)
    }
  }

  onStreamReceived() {
    return (call, stream) => {
      console.log('stream received!', call, stream)
      const callerId = call.peer
      const { isCurrentId } = this.roomService.addReceivedPeer(call)
      this.view.renderAudioElement({
        callerId,
        stream,
        isCurrentId,
      })
    }
  }

  onPeerError() {
    return error => console.error('error on peer: ', error)
  }

  onPeerConnectionOpenned() {
    return peer => {
      console.log('peer connected: ', peer)
      this.roomInfo.user.peerId = peer.id
      this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo)
    }
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
    return data => {
      const users = data.map(user => new Attendee(user))
      console.log('room list!', users)
      this.view.updateAttendeesOnGrid(users)
      this.roomService.updateCurrentUserProfile(users)
      this.activateUserFeatures()
    }
  }

  onDisconnected() {
    return data => {
      const attendee = new Attendee(data)
      console.log(`${attendee.username} has disconnected!`)

      this.roomService.disconnectPeer({
        peerId: attendee.peerId,
      })
      this.view.removeItemFromGrid(attendee.id)
    }
  }

  onUserConnected() {
    return data => {
      const attendee = new Attendee(data)
      console.log('user connected!', attendee)
      this.view.addAttendeeOnGrid(attendee)
      this.roomService.callNewUser(attendee)
    }
  }

  onUserProfileUpgrade() {
    return data => {
      const attendee = new Attendee(data)
      console.log('user profile upgrade!', attendee)
      this.roomService.upgradeUserPermission(attendee)
      this.view.updateAttendeeOnGrid(attendee)
      this.activateUserFeatures()
    }
  }

  activateUserFeatures() {
    const currentUser = this.roomService.getCurrentUser()
    this.view.showUserFeatures(currentUser.isSpeaker)
  }
}
