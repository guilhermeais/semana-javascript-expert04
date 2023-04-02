import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Client from 'socket.io-client'

describe('SocketServer', () => {
  let io, serverSocket, clientSocket

  beforeAll(async () => {
    const httpServer = createServer()
    io = new Server(httpServer)

    await new Promise(resolve =>
      httpServer.listen(() => {
        const { port } = httpServer.address()

        clientSocket = new Client(`http://localhost:${port}`)

        io.on('connection', socket => (serverSocket = socket))

        clientSocket.on('connect', resolve)
      })
    )
  })

  afterAll(() => {
    io.close()
    clientSocket.close()
  })

  test('client can connect', () => {
    expect(clientSocket.connected).toBe(true)
  })
  
  test('server should receive messages', async () => {
    const message = 'hello'
    const received = new Promise(resolve => serverSocket.once('message', resolve))

    clientSocket.emit('message', message)

    expect(await received).toBe(message)
  });

  test('client should receive messages', async () => {
    const message = 'hello'
    const received = new Promise(resolve => clientSocket.once('message', resolve))

    serverSocket.emit('message', message)

    expect(await received).toBe(message)
  })
})
