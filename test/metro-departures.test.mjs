import MetroDepartures from '../lib/metro/metro-departures.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import nock from 'nock'
import stubDepartureData from './mock-data/metro-departures.json' assert { type: 'json' }
import stubRailDepartureData from './mock-data/metro-departures-rrb.json' assert { type: 'json' }
import stubCCLDepartureData from './mock-data/metro-departures-ccl.json' assert { type: 'json' }
import MetroRun from '../lib/metro/metro-run.mjs'

describe('The MetroDepartures class', () => {
  describe('The fetch function function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding Run and Route', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/departures/route_type/0/stop/19810?gtfs=true&max_results=1&expand=run&expand=route',
        requestOptions: {}
      })
    })

    it('Should use the estimated time if available', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })
    
      expect(+metro[0].actualDepartureTime).to.equal(+new Date(stubDepartureData.departures[0].estimated_departure_utc))
    })

    it('Should return a position if available', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })
    
      expect(metro[0].runData.position).to.not.be.null
      expect(metro[1].runData.position).to.be.null
    })

    it('Should calculate the TDN if specified', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData, stubRailDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData instanceof MetroRun).to.be.true
      expect(metro[0].runData.tdn).to.equal('4217')
      expect(metro[1].runData.tdn).to.equal('4622')
      expect(metro[2].runData.tdn).to.equal(null) // Future departure
      
      let metroRail = new MetroDepartures(stubAPI, 19810)
      await metroRail.fetch({ gtfs: true, maxResults: 1 })

      expect(metroRail[0].runData.tdn).to.equal(null) // Rail bus
    })

    it('Should detect rail buses', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubRailDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.isRailBus).to.be.true
    })

    it('Should detect city circle trains and add the route data accordingly', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubCCLDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].routeData.routeName).to.equal('City Circle')
    })
  })
})