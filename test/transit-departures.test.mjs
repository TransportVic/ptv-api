import TransitDepartures from '../lib/types/transit-departures.mjs'
import { expect } from 'chai'
import nock from 'nock'
import { StubAPI } from './stub-api.mjs'
import stubDepartureData from './metro-mock-data/metro-departures.json' assert { type: 'json' }
import { parseISOTime } from '../lib/date-utils.mjs'

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

    it('Should accept Date objects', () => {
      let departures = new TransitDepartures()
      let queryString = departures.generateQueryString({
        date: new Date('2024-07-12T20:29:00.000Z')
      })

      expect(queryString).to.equal('?date_utc=2024-07-12T20:29:00.000Z')
    })

    it('Should accept DateTime objects', () => {
      let departures = new TransitDepartures()
      let queryString = departures.generateQueryString({
        date: parseISOTime('2024-07-12T20:29:00.000Z')
      })

      expect(queryString).to.equal('?date_utc=2024-07-12T20:29:00.000Z')
    })
  })
  
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding Run and Route', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let departures = new TransitDepartures(stubAPI, 19810)
      await departures.fetchBody(10, {
        gtfs: true,
        expand: ['vehicleposition']
      })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/departures/route_type/10/stop/19810?gtfs=true&expand=vehicleposition&expand=stop&expand=run&expand=route&expand=direction',
        requestOptions: {}
      })
    })
  })
})