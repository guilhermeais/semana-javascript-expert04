import { describe, beforeAll, afterAll, test, expect, vitest } from 'vitest'
import { createServer } from 'http'
import Client from 'socket.io-client'
import SocketServer from './socket.js'

describe('SocketServer - Integration', () => {
  let serverSocket, clientSocket

  beforeAll(async () => {
    const port = await new Promise(resolve => {
      const server = createServer()
      server.listen(0, () => {
        const { port } = server.address()
        server.close(() => resolve(port))
      })
    })
    serverSocket = new SocketServer({
      port,
    })
    await serverSocket.start()

    clientSocket = new Client(`http://localhost:${serverSocket.port}`)
    await new Promise(resolve => clientSocket.on('connect', resolve))
  })

  afterAll(() => {
    serverSocket.stop()
  })

  function makeRouteConfig() {
    return [
      {
        room: {
          events: [
            [
              'join-room',
              vitest.fn(socket => {
                socket.emit('join-room')
              }),
            ],
          ],
          eventEmitter: {
            emit: () => {},
          },
        },
      },
    ]
  }

  test('should call the correct route event when socket receive an event on correct namespace', async () => {
    const routeConfig = makeRouteConfig()
    serverSocket.attachEvents({ routeConfig })
    const namespace = 'room'
    const eventName = 'join-room'

    clientSocket = new Client(
      `http://localhost:${serverSocket.port}/${namespace}`
    )
    await new Promise(resolve => clientSocket.on('connect', resolve))

    clientSocket.emit(eventName, 'some data')
    const handler = routeConfig[0][namespace].events[0][1]

    await new Promise(resolve => clientSocket.on(eventName, resolve))
    expect(
      handler
    ).toHaveBeenCalled()
  })


})
