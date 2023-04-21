import Attendee from './entities/attendee.js'
import getTemplate from './templates/attendee-templates.js'

const imgUser = document.getElementById('imgUser')
const roomTopic = document.getElementById('pTopic')
const gridAttendees = document.getElementById('gridAttendees')
const gridSpeakers = document.getElementById('gridSpeakers')
const btnClap = document.getElementById('btnClap')
const btnClipBoard = document.getElementById('btnClipBoard')
const btnMicrophone = document.getElementById('btnMicrophone')

export default class View {
  static updateUserImage({ img, username }) {
    imgUser.src = img
    imgUser.alt = username
  }

  static updateRoomTopic({ topic }) {
    roomTopic.innerText = topic
  }

  static addAttendeeOnGrid(item) {
    const attendee = new Attendee(item)

    const attendeeHtml = getTemplate(attendee)
    const grid = attendee.isSpeaker ? gridSpeakers : gridAttendees

    grid.innerHTML += attendeeHtml
  }

  /**
   *
   * @param {Attendee[]} users
   */
  static updateAttendeesOnGrid(users) {
    users.forEach(View.addAttendeeOnGrid)
  }

  static updateAttendeeOnGrid(item) {
    const attendee = new Attendee(item)

    if (!attendee.isSpeaker) {
      return
    }

    View.removeItemFromGrid(attendee.id)
    View.addAttendeeOnGrid(attendee)
  }

  static removeItemFromGrid(id) {
    const item = View._getExistingItemOnGrid({ id })
    item?.remove()
  }

  static _getExistingItemOnGrid({ id, baseElement = document }) {
    const existingItem = baseElement.querySelector(`[id="${id}"]`)

    return existingItem
  }

  static _createAudioElement({ muted = true, srcObject }) {
    const audio = document.createElement('audio')
    audio.muted = muted
    audio.srcObject = srcObject

    audio.addEventListener('loadedmetadata', async () => {
      try {
        await audio.play()
      } catch (error) {
        console.error(error)
      }
    })

    return audio
  }

  static _appendToHTMLTree(userId, audio) {
    const div = document.createElement('div')
    div.id = userId
    div.append(audio)
  }

  static renderAudioElement({ callerId, stream, isCurrentId }) {
    const audio = View._createAudioElement({
      muted: isCurrentId,
      srcObject: stream,
    })

    View._appendToHTMLTree(callerId, audio)
  }

  static showUserFeatures(isSpeaker) {
    if (!isSpeaker) {
      btnClap.classList.remove('hidden')
      btnMicrophone.classList.add('hidden')
      btnClipBoard.classList.add('hidden')

      return
    }

    btnMicrophone.classList.remove('hidden')
    btnClipBoard.classList.remove('hidden')
    btnClap.classList.add('hidden')
  }
}
