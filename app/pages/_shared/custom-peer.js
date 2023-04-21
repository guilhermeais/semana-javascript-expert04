/**
 * Extende o PeerJS para adicionar um callback ao método call
 * Este callback é chamado quando o método call é chamado
 */
export default class PeerCustomModule extends globalThis.Peer {
  /**
   * 
   * @param {Object} config
   * @param {Function} config.onCall é chamado quando o método call é chamado 
   */
  constructor({config, onCall}) {
    super(config);

    this.onCall = onCall;
  }

  call(...args) {
    const originalCallResult = super.call(...args);

    this.onCall(originalCallResult);

    return originalCallResult;
  }
}