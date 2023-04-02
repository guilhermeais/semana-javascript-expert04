import { constants } from '../../../_shared/constants.js';
import SocketBuilder from '../../../_shared/socket-builder.js';

export default class RoomSocketBuilder extends SocketBuilder {
  constructor(params) {
    super(params);

    this.onRoomUpdated = () => {};
  }

  setOnRoomUpdated(fn) {
    this.onRoomUpdated = fn;

    return this;
  }

  build() {
    const socket = super.build()

    socket.on(constants.events.LOBBY_UPDATED, this.onRoomUpdated)

    return socket
  }
}