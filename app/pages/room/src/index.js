import { constants } from '../../_shared/constants.js'
import Media from '../../_shared/media.js'
import PeerBuilder from '../../_shared/peer-builder.js'
import RoomController from './controller.js'
import RoomService from './service.js'
import RoomSocketBuilder from './util/roomSocket.js'
import View from './view.js'

const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get('id')
const topic = urlParams.get('topic')

const room = {
  id,
  topic,
}

const user = {
  img: 'https://avatars.githubusercontent.com/u/73388069?s=96&v=4',
  username: 'Guilherme' + Date.now(),
}

const peerBuilder = new PeerBuilder({
  peerConfig: constants.peerConfig,
})

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room,
})
const roomService = new RoomService({
  media: Media,
});

await RoomController.initialize({
  socketBuilder,
  roomInfo: {
    room,
    user,
  },
  view: View,
  peerBuilder,
  roomService,
})
