import Attendee from './entities/attendee.js'
import getTemplate from './templates/attendee-templates.js'

const imgUser = document.getElementById('imgUser')
const roomTopic = document.getElementById('pTopic')
const gridAttendees = document.getElementById('gridAttendees')
const gridSpeakers = document.getElementById('gridSpeakers')

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
}
