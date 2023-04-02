import { constants } from '../../_shared/constants.js'
import SocketBuilder from '../../_shared/socket-builder.js'

const socket = new SocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
})
  .setOnUserConnected(user => console.log('user connected!', user))
  .setOnUserDisconnected(user => console.log('user disconnected!', user))
  .build()

const room = {
  id: Date.now(),
  topic: 'JS Expert',
}

const user = {
  img: '',
  username: 'Guilherme',
}

socket.emit(constants.events.JOIN_ROOM, { user, room })
