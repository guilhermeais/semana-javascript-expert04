import CustomMap from './custom-map'
import { describe, test, expect, vitest } from 'vitest'

describe('CustomMap', () => {
  function makeSut({ customMapper = value => value } = {}) {
    const observer = {
      notify: vitest.fn(),
    }
    const sut = new CustomMap({ observer, customMapper })
    return { sut, observer, customMapper }
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

  test('should map the values according to the provided customMapper', () => {
    const { sut } = makeSut({
      customMapper: value => ({ name: value.n }),
    })

    sut.set('key', {
      n: 'any_name',
    })

    sut.set('value', {
      n: 'other_name',
    })

    const values = [...sut.values()]

    expect(values).toEqual([
      {
        name: 'any_name',
      },
      {
        name: 'other_name',
      }
    ])
  })
})
