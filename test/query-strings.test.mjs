import { expect } from 'chai'
import generateQueryString from '../lib/types/query-strings.mjs'
import { parseISOTime } from '../lib/date-utils.mjs'

describe('The generateQueryString function', () => {
  it('Should turn a dictionary of values into a query string', () => {
    let queryString = generateQueryString({
      direction: 0,
      gtfs: true,
      maxResults: 6
    })

    expect(queryString).to.equal('?direction_id=0&gtfs=true&max_results=6')
  })

  it('Should turn an array into a set of repeating key-value pairs', () => {
    let queryString = generateQueryString({
      platforms: [1, 2, 5],
      gtfs: true
    })

    expect(queryString).to.equal('?platform_numbers=1&platform_numbers=2&platform_numbers=5&gtfs=true')
  })

  it('Should accept Date objects', () => {
    let queryString = generateQueryString({
      date: new Date('2024-07-12T20:29:00.000Z')
    })

    expect(queryString).to.equal('?date_utc=2024-07-12T20:29:00.000Z')
  })

  it('Should accept DateTime objects', () => {
    let queryString = generateQueryString({
      date: parseISOTime('2024-07-12T20:29:00.000Z')
    })

    expect(queryString).to.equal('?date_utc=2024-07-12T20:29:00.000Z')
  })

  it('Should turn a dictionary of values into a query string', () => {
    let queryString = generateQueryString({
      date: new Date('2024-06-27T07:08:14.150Z'),
      expand: ['VehiclePosition', 'VehicleDescriptor']
    })

    expect(queryString).to.equal('?date_utc=2024-06-27T07:08:14.150Z&expand=VehiclePosition&expand=VehicleDescriptor')
  })
})