import http from 'http'
import { Server } from 'socket.io'
import { constants } from './constants.js'
export default class SocketServer {
  #io
  constructor({ port } = {}) {
    this.port = port
    this.namespaces = {}
  }

  attachEvents({ routeConfig }) {
    for (const routes of routeConfig) {
      for (const [namespace, { events, eventEmitter }] of Object.entries(
        routes
      )) {
        const route = (this.namespaces[namespace] = this.#io.of(`/${namespace}`))

        route.on('connection', socket => {
          for (const [fnName, fn] of events) {
            socket.on(fnName, (...args) => fn(socket, ...args))
          }
          
          eventEmitter.emit(constants.event.USER_CONNECTED, socket)
        })
      }
    }
  }

  async start() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      })
      res.end('I am connected!')
    })

    this.#io = new Server(server, {
      cors: {
        origin: '*',
        credentials: false,
      },
    })

    return new Promise((resolve, reject) => {
      server.on('error', reject)
      server.listen(this.port, () => resolve(server))
    })
  }

  async stop() {
    if (!this.#io) {
      return
    }

    await new Promise(resolve => this.#io.close(resolve))
    this.#io = null
  }
}
