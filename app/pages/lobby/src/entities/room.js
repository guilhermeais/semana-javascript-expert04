class Attendee {
  constructor({ img, username, id }) {
    this.img = img
    this.username = username
    this.id = id
  }
}

export default class Room {
  constructor({
    id,
    topic,
    subTopic,
    roomLink,
    attendeesCount,
    speakersCount,
    featuredAttendees,
    owner,
  }) {
    this.id = id
    this.topic = topic
    this.attendeesCount = attendeesCount
    this.speakersCount = speakersCount
    this.featuredAttendees = featuredAttendees?.map(
      attendee => new Attendee(attendee)
    )
    this.owner = new Attendee(owner)
    this.subTopic = subTopic || 'Semana JS Expert 4.0'
    this.roomLink = roomLink
  }
}
