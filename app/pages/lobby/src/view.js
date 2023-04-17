import Room from './entities/room.js'
import getTemplate from './util/templates/lobby-item.js'

const roomGrid = document.getElementById('roomGrid')
const imgUser = document.getElementById('imgUser')
const btnCreateRoomWithoutTopic = document.getElementById(
  'btnCreateRoomWithoutTopic'
)
const btnCreateRoomWithTopic = document.getElementById('btnCreateRoomWithTopic')
const txtTopic = document.getElementById('txtTopic')

export default class View {
  static clearRoomList() {
    roomGrid.innerHTML = ''
  }

  static generateRoomLink(id, topic) {
    return `../room/index.html?id=${id}&topic=${topic}`
  }

  static updateUserImage({ img, username }) {
    imgUser.src = img
    imgUser.alt = username
  }

  static updateRoomList(rooms) {
    View.clearRoomList()

    const roomListHtml = rooms.map(room => {
      const mappedRoom = new Room({
        ...room,
        roomLink: View.generateRoomLink(room.id, room.topic),
      })

      return getTemplate(mappedRoom)
    })

    roomGrid.innerHTML += roomListHtml.join('\n')
  }

  static redirectToRoom(topic = '') {
    const uniqueId =
      Date.now().toString(36) + Math.random().toString(36).substr(2)

    window.location.href = View.generateRoomLink(uniqueId, topic)
  }

  static configureCreateRoomButtons() {
    btnCreateRoomWithTopic.addEventListener('click', () => {
      const topic = txtTopic.value

      if (topic) {
        View.redirectToRoom(topic)
      } else {
        alert('Digite um tópico para a sala!')
      }
    })

    btnCreateRoomWithoutTopic.addEventListener('click', () => {
      View.redirectToRoom()
    })
  }
}
