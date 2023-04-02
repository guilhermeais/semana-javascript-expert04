import RoomsController from './controllers/rooms-controller.js'
import { constants } from './util/constants.js'
import SocketServer from './util/socket.js'
import Event from 'events'

const port = process.env.port || 3000
const socketServer = new SocketServer({
  port,
})
const server = await socketServer.start()

const roomsController = new RoomsController()

const namespaces = {
  room: {
    controller: roomsController,
    eventEmitter: new Event(),
  },
}

const routerConfig = Object.entries(namespaces).map(
  ([namespace, { controller, eventEmitter }]) => {
    const controllerEvents = controller.getEvents()
    eventEmitter.on(
      constants.event.USER_CONNECTED,
      controller.onNewConnection.bind(controller)
    )

    for (const [fnName, controllerFn] of controllerEvents) {
      eventEmitter.on(fnName, controllerFn)
    }

    return {
      [namespace]: {
        eventEmitter,
        events: controllerEvents,
      },
    }
  }
)

socketServer.attachEvents({ routeConfig: routerConfig })

console.log(`Server started on port ${port}`)
