export default class CustomMap extends Map {
  #observer
  constructor({ args = [], observer }) {
    super(...args)

    this.#observer = observer
  }

  set(...args) {
    const result = super.set(...args)

    this.#observer.notify(this)

    return result
  }

  delete(...args) {
    const result = super.delete(...args)

    this.#observer.notify(this)

    return result
  }
}
