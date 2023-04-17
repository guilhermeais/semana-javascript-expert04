import { constants } from '../../_shared/constants.js'
import LobbyController from './controller.js'
import LobbySocketBuilder from './util/lobby-socket-builder.js'
import View from './view.js'

const socketBuilder = new LobbySocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.lobby,
})

const user = {
  img: 'https://avatars.githubusercontent.com/u/73388069?s=96&v=4',
  username: 'Guilherme' + Date.now(),
}

await LobbyController.initialize({ socketBuilder, user, view: View })
