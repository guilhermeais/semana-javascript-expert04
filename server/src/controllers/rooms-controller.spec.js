import { describe, expect, test, vitest } from 'vitest'
import RoomsController from './rooms-controller.js'
import Attendee from '../entities/attendee.js'
import { randomUUID } from 'crypto'
import Event from 'events'

describe('RoomsController', () => {
  function makeSut() {
    const roomsPubSub = new Event()
    const sut = new RoomsController({
      roomsPubSub
    })

    return {
      sut,
      roomsPubSub
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
      to: vitest.fn().mockReturnThis(),
    }
  }
  describe('joinRoom()', () => {
    test('should create an room if the provided room does not exists', async () => {
      const { sut } = makeSut()
      const attendee = makeAttendee()
      const socket = makeSocket()
      const roomId = randomUUID()

      sut.joinRoom(socket, {
        user: attendee,
        room: { id: roomId, topic: 'any_topic' },
      })

      expect(socket.to).toHaveBeenCalledWith(roomId)
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

  describe('disconnect()', () => {
    describe('given a room with only the owner', () => {
      test('should disconnect the user and remove the room', async () => {
        const { sut } = makeSut()
        const attendee = makeAttendee()
        const socket = makeSocket()
        const roomId = randomUUID()
  
        sut.joinRoom(socket, {
          user: attendee,
          room: { id: roomId, topic: 'any_topic' },
        })
  
        const roomBeforeDisconnect = sut.rooms.get(roomId)
        expect(roomBeforeDisconnect).toBeTruthy()
        expect(roomBeforeDisconnect.owner.id).toEqual(attendee.id)
        expect(roomBeforeDisconnect.users.size).toEqual(1)
        sut.disconnect(socket)
  
        const roomAfterDisconnect = sut.rooms.get(roomId)
        expect(roomAfterDisconnect).toBeFalsy()
      });
    });

    describe.skip('given a room that has other speakers', () => {
      test('should disconnect the user and promote the last speaker to owner', async () => {
        const { sut } = makeSut()
        const attendee = makeAttendee()
        const socket = makeSocket()
        const roomId = randomUUID()
  
        sut.joinRoom(socket, {
          user: attendee,
          room: { id: roomId, topic: 'any_topic' },
        })
  
        const newSpeaker = makeAttendee()
        sut.joinRoom(socket, {
          user: newSpeaker,
          room: { id: roomId, topic: 'any_topic' },
        })
  
        const roomAfterNewSpeaker = sut.rooms.get(roomId)
        expect(roomAfterNewSpeaker).toBeTruthy()
        expect(roomAfterNewSpeaker.owner.id).toEqual(attendee.id)
        expect(roomAfterNewSpeaker.users.size).toEqual(2)
        expect(roomAfterNewSpeaker.speakersCount).toEqual(2)
        expect(roomAfterNewSpeaker.attendeesCount).toEqual(2)
  
        sut.disconnect(socket)
  
        const roomAfterDisconnect = sut.rooms.get(roomId)
        expect(roomAfterDisconnect).toBeTruthy()
        expect(roomAfterDisconnect.owner.id).toEqual(newSpeaker.id)
        expect(roomAfterDisconnect.users.size).toEqual(1)
        expect(roomAfterDisconnect.speakersCount).toEqual(1)
        expect(roomAfterDisconnect.attendeesCount).toEqual(1)
      });
    });

    describe('given a room tha has only attendees', () => {
      test('should disconnect the user and set a new owner to the room', async () => {
        const { sut } = makeSut()
        const attendee = makeAttendee()
        const socket = makeSocket()
        const roomId = randomUUID()
  
        sut.joinRoom(socket, {
          user: attendee,
          room: { id: roomId, topic: 'any_topic' },
        })
  
        const newAttendee = makeAttendee()
        const newSocket = makeSocket()

        sut.joinRoom(newSocket, {
          user: newAttendee,
          room: { id: roomId, topic: 'any_topic' },
        })
  
        const roomAfterNewAttendee = sut.rooms.get(roomId)
        expect(roomAfterNewAttendee).toBeTruthy()
        expect(roomAfterNewAttendee.owner.id).toEqual(attendee.id)
        expect(roomAfterNewAttendee.users.size).toEqual(2)
        expect(roomAfterNewAttendee.speakersCount).toEqual(1)
        expect(roomAfterNewAttendee.attendeesCount).toEqual(2)
  
        sut.disconnect(socket)
  
        const roomAfterDisconnect = sut.rooms.get(roomId)
        expect(roomAfterDisconnect).toBeTruthy()
        expect(roomAfterDisconnect.owner.id).toEqual(newAttendee.id)
        expect(roomAfterDisconnect.users.size).toEqual(1)
        expect(roomAfterDisconnect.speakersCount).toEqual(1)
        expect(roomAfterDisconnect.attendeesCount).toEqual(1)

        expect(socket.to).toHaveBeenCalledWith(roomId)
      });
    });
  })

  describe('roomsPubSub', () => {
    test('should emit LOBBY_UPDATED event on set property of rooms (CustomMap)', () => {
      const { sut, roomsPubSub } = makeSut()
      const roomId = randomUUID()

      sut.rooms.set(roomId, { value: 'test' })
      roomsPubSub.on('LOBBY_UPDATED', (rooms) => {
        expect(rooms).toBeTruthy()
        expect(rooms.size).toEqual(1)
        expect(rooms.get(roomId)).toBeTruthy()
      })
    });

     test('should emit LOBBY_UPDATED event on delete property of rooms (CustomMap)', () => {
      const { sut, roomsPubSub } = makeSut()
      const roomId = randomUUID()

      sut.rooms.delete(roomId)
      roomsPubSub.on('LOBBY_UPDATED', (rooms) => {
        expect(rooms).toBeTruthy()
        expect(rooms.size).toEqual(1)
        expect(rooms.get(roomId)).toBeTruthy()
      })
    });
  })
})
