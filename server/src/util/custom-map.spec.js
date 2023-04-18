import CustomMap from './custom-map'
import { describe, test, expect, vitest } from 'vitest'

describe('CustomMap', () => {
  function makeSut() {
    const observer = {
      notify: vitest.fn(),
    }
    const sut = new CustomMap({ observer })
    return { sut, observer }
  }

  test('should notify when delete some data from map', () => {
    const { sut, observer } = makeSut()

    sut.delete('key')

    expect(observer.notify).toHaveBeenCalledWith(sut)
  })

  test('should notify when set some data to map', () => {
    const { sut, observer } = makeSut()

    sut.set('key', 'value')

    expect(observer.notify).toHaveBeenCalledWith(sut)
  })
})
