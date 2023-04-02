import { constants } from '../../_shared/constants.js'
import RoomSocketBuilder from './util/roomSocket.js'

const socket = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
})
  .setOnUserConnected(user => console.log('user connected!', user))
  .setOnUserDisconnected(user => console.log('user disconnected!', user))
  .setOnRoomUpdated(room => console.log('room list!', room))
  .build()

const room = {
  id: '001',
  topic: 'JS Expert',
}

const user = {
  img: '',
  username: 'Guilherme' + Date.now(),
}

socket.emit(constants.events.JOIN_ROOM, { user, room })
