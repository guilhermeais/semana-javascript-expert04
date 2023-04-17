import { describe, expect, test, vitest } from 'vitest'
import LobbyController from './lobby-controller.js'
import Attendee from '../entities/attendee.js'
import { randomUUID } from 'crypto'
import Room from '../entities/room.js'
import { constants } from '../util/constants.js'
import Event from 'events'

describe('LobbyController', () => {
  function makeSut({ activeRooms = new Map(), roomsListener = new Event() }) {
    const sut = new LobbyController({
      activeRooms,
      roomsListener,
    })

    return {
      sut,
    }
  }

  function makeRoom() {
    const attendee = new Attendee({
      id: randomUUID(),
      name: 'any_name',
      img: 'any_img',
      isSpeaker: true,
      peerId: 'any_peer_id',
      roomId: 'any_room_id',
      username: 'any_username',
    })

    const room = new Room({
      id: randomUUID(),
      topic: 'any_topic',
      owner: attendee,
      featuredAttendees: [attendee],
      attendeesCount: 1,
      speakersCount: 1,
      users: [attendee],
    })

    attendee.roomId = room.id

    return room
  }

  function makeSocket() {
    return {
      id: randomUUID(),
      join: () => {},
      emit: vitest.fn(),
      to: vitest.fn().mockReturnThis(),
    }
  }

  describe('onNewConnection()', () => {
    test('should emit LOBBY_UPDATED with all active rooms', async () => {
      const mockedRoom = makeRoom()
      const activeRooms = new Map([[mockedRoom.id, mockedRoom]])
      const roomsListener = new Event()

      const { sut } = makeSut({ activeRooms, roomsListener })

      const socket = makeSocket()

      sut.onNewConnection(socket)

      const [firstParam, secondParam] = socket.emit.mock.calls[0]

      expect(firstParam).toBe(constants.event.LOBBY_UPDATED)
      expect(secondParam).toEqual([...activeRooms.values()])
    })
  })
})
