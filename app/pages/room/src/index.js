import { constants } from '../../_shared/constants.js'
import RoomController from './controller.js'
import RoomSocketBuilder from './util/roomSocket.js'
import View from './view.js'

const room = {
  id: '001',
  topic: 'JS Expert',
}

const user = {
  img: 'https://avatars.githubusercontent.com/u/73388069?s=96&v=4',
  username: 'Guilherme' + Date.now(),
}

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
})

await RoomController.initialize({
  socketBuilder,
  roomInfo: {
    room,
    user,
  },
  view: View,
})
