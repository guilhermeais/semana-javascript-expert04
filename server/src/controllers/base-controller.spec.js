import { describe, test, expect, vitest } from 'vitest'
import BaseController from './base-controller.js'

describe('BaseController', () => {
  describe('getEvents', () => {
    test('given a class that extends BaseController, the class should extends the method getEvents and return all methods in a map ', () => {
      class ControllerStub extends BaseController {
        constructor() {
          super()
        }
        method1() {}
      }

      const controllerStub = new ControllerStub()
      const expectedEvents = new Map([['method1', expect.any(Function)]])
      const events = controllerStub.getEvents()

      expect(events).toEqual(expectedEvents)
    })

    test('the methods returned at getEvents should work as expected', async () => {
      class ControllerStub extends BaseController {
        constructor() {
          super()
          this.returnValue = 'hello'
        }
        method1() {
          return this.returnValue
        }
      }

      const controllerStub = new ControllerStub()
      const events = controllerStub.getEvents()
      const event = events.get('method1')

      expect(event()).toEqual(controllerStub.returnValue)
    });
  })
})
