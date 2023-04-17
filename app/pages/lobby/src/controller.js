export default class LobbyController {
  constructor({ socketBuilder, user, view }) {
    this.socketBuilder = socketBuilder
    this.user = user
    this.view = view

    this.socket = {}
  }

  static initialize(deps) {
    return new LobbyController(deps)._initialize()
  }

  async _initialize() {
    this.socket = this.socketBuilder
      .setOnLobbyUpdated(this.onLobbyUpdated())
      .build()

    this._setupViewEvents()
  }

  _setupViewEvents() {
    this.view.updateUserImage(this.user)
    this.view.configureCreateRoomButtons()
  }

  onLobbyUpdated() {
    return rooms => {
      console.log('lobby updated!', rooms)
      this.view.updateRoomList(rooms)
    }
  }
}
