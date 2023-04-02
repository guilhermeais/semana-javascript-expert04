export default class BaseController {
  getEvents() {
    const functions = Reflect.ownKeys(this.constructor.prototype)
      .filter(fn => fn !== 'constructor')
      .map(name => [name, this[name].bind(this)])

    return new Map(functions)
  }
}
