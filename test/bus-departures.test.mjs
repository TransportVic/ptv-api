import { StubAPI } from "./stub-api.mjs"
import { expect } from 'chai'
import stubDepartureData from './bus-mock-data/monash-departures.json' assert { type: 'json' }
import BusDepartures from "../lib/bus/bus-departures.mjs"

describe('The BusDepartures class', () => {
  describe('The fetch function', () => {
    it('Should use the estimated time if available', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let buses = new BusDepartures(stubAPI, 19810)

      await buses.fetch({ gtfs: true, maxResults: 1 })
    
      expect(+buses[0].actualDeparture).to.equal(+new Date(stubDepartureData.departures[0].estimated_departure_utc))
    })

    it('Should return a position if available', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let buses = new BusDepartures(stubAPI, 19810)

      await buses.fetch({ gtfs: true, maxResults: 1 })
    
      expect(buses[0].runData.position).to.not.be.null
      expect(buses[13].runData.position).to.be.null
    })

  })
})