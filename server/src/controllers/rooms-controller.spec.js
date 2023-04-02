import { describe, expect, test } from 'vitest'
import RoomsController from './rooms-controller.js'
import Attendee from '../entities/attendee.js'
import { randomUUID } from 'crypto'

describe('RoomsController', () => {
  describe('joinRoom()', () => {
    function makeSut() {
      const sut = new RoomsController()

      return {
        sut,
      }
    }

    function makeAttendee() {
      return new Attendee({
        id: randomUUID(),
        img: 'any_img',
        roomId: randomUUID(),
        username: 'any_username',
      })
    }

    function makeSocket() {
      return {
        id: randomUUID(),
        join: () => {},
        emit: () => {},
        to: () => ({ emit: () => {} }),
      }
    }

    test('should create an room if the provided room does not exists', async () => {
      const { sut } = makeSut()
      const attendee = makeAttendee()
      const socket = makeSocket()
      const roomId = randomUUID()

      sut.joinRoom(socket, {
        user: attendee,
        room: { id: roomId, topic: 'any_topic' },
      })

      const createdRoom = sut.rooms.get(roomId)

      expect(createdRoom).toBeTruthy()
      expect(createdRoom.owner.id).toEqual(attendee.id)
      expect(createdRoom.users.size).toEqual(1)
      expect([...createdRoom.users.values()][0].id).toEqual(attendee.id)
      expect(createdRoom.speakersCount).toEqual(1)
      expect(createdRoom.attendeesCount).toEqual(1)
    })

    test('should join the room as attendee if room already exists', async () => {
      const { sut } = makeSut()
      const currentOwner = makeAttendee()
      const socket = makeSocket()
      const roomId = randomUUID()
      const actualRoom = {
        id: roomId,
        topic: 'any_topic',
        owner: { ...currentOwner, isSpeaker: true },
        users: new Set([currentOwner]),
      }
      sut.joinRoom(socket, { user: currentOwner, room: actualRoom })

      const newUser = makeAttendee()

      sut.joinRoom(socket, {
        user: newUser,
        room: actualRoom,
      })

      const room = sut.rooms.get(roomId)

      expect(room.users.size).toEqual(2)
      expect(room.speakersCount).toEqual(1)
      expect(room.attendeesCount).toEqual(2)
      expect(room.owner.id).toEqual(currentOwner.id)
    })
  })
})
