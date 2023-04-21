import UserStream from './entities/user-stream.js'

export default class RoomService {
  constructor({ media }) {
    this.media = media

    this.currentPeer = {}
    this.currentUser = {}
    this.currentStream = {}

    this.peers = new Map()
  }

  async init() {
    this.currentStream = new UserStream({
      stream: await this.media.getUserAudio(),
      isFake: false,
    })
  }

  setCurrentPeer(peer) {
    this.currentPeer = peer
  }

  upgradeUserPermission(user) {
    if (!user.isSpeaker) return

    const isCurrentUser = user.id === this.currentUser?.id
    if (!isCurrentUser) return

    this.currentUser = user
  }

  updateCurrentUserProfile(users) {
    this.currentUser = users.find(
      ({ peerId }) => peerId === this.currentPeer.id
    )
  }

  getCurrentUser() {
    return this.currentUser
  }

  async getCurrentStream() {
    const { isSpeaker } = this.currentUser

    if (isSpeaker) {
      return this.currentStream
    }

    return this.media.createFakeMediaStream()
  }

  addReceivedPeer(call) {
    const callerId = call.peer

    this.peers.set(callerId, { call })

    const isCurrentId = callerId === this.currentPeer.id
    return { isCurrentId }
  }

  async callNewUser(user) {
    const { isSpeaker } = this.currentUser

    if (!isSpeaker) return

    const stream = await this.getCurrentStream()
    this.currentPeer.call(user.peerId, stream.stream)
  }

  disconnectPeer({ peerId }) {
    if (!this.peers.has(peerId)) {
      return
    }

    this.peers.get(peerId).call.close()
    this.peers.delete(peerId)
  }
}
