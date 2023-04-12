import Attendee from '../entities/attendee.js'
const speakerIcon =
  '<img src="./../../assets/icons/asterisk.svg" alt="File icon" class="icon" />'

export default function getTemplate(attendee = new Attendee()) {
  return `
  <div class="room-card__user">
  <div class="room-card__user__img">
    <img src="${attendee.img}" alt="${attendee.username}" />
  </div>
  <p class="room-card__user__name">
    ${attendee.isSpeaker ? speakerIcon : ''}
    ${attendee.firstName}
  </p>
</div>
  `
}
