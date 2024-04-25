import TransitDepartures from '../lib/types/transit-departures.mjs'
import { expect } from 'chai'
import nock from 'nock'

describe('The TransitDepartures class', () => {
  describe('The generateQueryString function', () => {
    it('Should turn a dictionary of values into a query string', () => {
      let departures = new TransitDepartures()
      let queryString = departures.generateQueryString({
        direction: 0,
        gtfs: true,
        maxResults: 6
      })

      expect(queryString).to.equal('?direction_id=0&gtfs=true&max_results=6')
    })

    it('Should turn an array into a set of repeating key-value pairs', () => {
      let departures = new TransitDepartures()
      let queryString = departures.generateQueryString({
        platforms: [1, 2, 5],
        gtfs: true
      })

      expect(queryString).to.equal('?platform_numbers=1&platform_numbers=2&platform_numbers=5&gtfs=true')
    })
  })
})