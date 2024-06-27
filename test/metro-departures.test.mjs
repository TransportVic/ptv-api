import MetroDepartures from '../lib/metro/metro-departures.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubDepartureData from './mock-data/metro-departures.json' assert { type: 'json' }
import stubRRBDepartureData from './mock-data/metro-departures-rrb.json' assert { type: 'json' }
import stubCCLDepartureData from './mock-data/metro-departures-ccl.json' assert { type: 'json' }
import stubCLPTestDepartureData from './mock-data/metro-departures-via-clp-test.json' assert { type: 'json' }
import stubPARDepartureData from './mock-data/city-loop-departures.json' assert { type: 'json' }
import stubPatternData from './mock-data/metro-pattern-pkm.json' assert { type: 'json' }
import MetroRun from '../lib/metro/metro-run.mjs'

describe('The MetroDepartures class', () => {
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding Run and Route', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/departures/route_type/0/stop/19810?gtfs=true&max_results=1&expand=run&expand=route&expand=direction',
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
      stubAPI.setResponses([ stubDepartureData, stubRRBDepartureData ])
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
      stubAPI.setResponses([ stubRRBDepartureData ])
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

    it('Should provide the route data', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)
      
      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].routeData.routeName).to.equal('Cranbourne')
      expect(metro[0].routeData.gtfsRouteID).to.equal('2-CRB')
      expect(metro[0].routeData.routeNumber).to.null
    })

    it('Should populate the parameters with default data if not provided', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 1181)

      await metro.fetch()

      expect(metro[0].routeData.routeName).to.equal('Cranbourne')
    })
  })

  describe('The calculation of rail direction', () => {
    it('Should be calculated for regular trains', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.direction.railDirection).to.equal('Down')
      expect(metro[1].runData.direction.railDirection).to.equal('Up')
    })

    it('Should be calculated for city circle trains as Down all the time', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubCCLDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.direction.railDirection).to.equal('Down')
    })

    it('Should be calculated for rail buses as well without relying on any TDN', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubRRBDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.direction.railDirection).to.equal('Down')
      expect(metro[1].runData.direction.railDirection).to.equal('Up')
      expect(metro[2].runData.direction.railDirection).to.equal('Down')
    })  
  })

  describe('The calculation of city loop running', () => {
    it('Should be calculated for regular trains', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubCLPTestDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.viaCityLoop).to.be.false
      expect(metro[1].runData.viaCityLoop).to.be.true
      expect(metro[2].runData.viaCityLoop).to.be.true
      expect(metro[3].runData.viaCityLoop).to.be.false
      expect(metro[4].runData.viaCityLoop).to.be.null
    })

    it('Should not be calculated for future trains with no TDN', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubCLPTestDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[4].runData.viaCityLoop).to.be.null
    })

    it('Should not be calculated for rail buses', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubRRBDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.viaCityLoop).to.be.null
    })

    it('Should be true for city circle trains', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubCCLDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.viaCityLoop).to.be.true
    })
  })

  describe('The interchange data', () => {
    it('Should convert the distributor into the formed by', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.formedBy.tdn).to.equal('4001')
    })

    it('Should convert the feeder into the forming', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[0].runData.forming.tdn).to.equal('4000')
    })

    it('Should not use values where the run_ref is equal to 0', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubDepartureData ])
      let metro = new MetroDepartures(stubAPI, 19810)

      await metro.fetch({ gtfs: true, maxResults: 1 })

      expect(metro[1].runData.formedBy).to.be.null
    })
  })

  describe('Departures from the city loop', () => {
    it('Should identify Down non-loop trains in the loop', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPARDepartureData ])
      let metro = new MetroDepartures(stubAPI, 22180)

      await metro.fetch({ gtfs: true, maxResults: 2 })
      expect(metro[0].useFormedByData).to.be.true
    })

    it('Should modify the TDN to use the formed by data, and alter the destination to Flinders Street', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPARDepartureData ])
      let metro = new MetroDepartures(stubAPI, 22180)

      await metro.fetch({ gtfs: true, maxResults: 2 })
      expect(metro[0].runData.tdn).to.equal('6606')
      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].runData.viaCityLoop).to.be.true
      expect(metro[0].runData.direction.railDirection).to.equal('Up')
    })

    it('Should modify the forming to become to orignal TDN', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPARDepartureData ])
      let metro = new MetroDepartures(stubAPI, 22180)

      await metro.fetch({ gtfs: true, maxResults: 2 })
      expect(metro[0].runData.forming.tdn).to.equal('5009')
    })

    it('Should remove the formed by as this is no longer available', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPARDepartureData ])
      let metro = new MetroDepartures(stubAPI, 22180)

      await metro.fetch({ gtfs: true, maxResults: 2 })
      expect(metro[0].runData.formedBy).to.be.null
    })

    it('Should not modify city circle trains', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubCCLDepartureData ])
      let metro = new MetroDepartures(stubAPI, 22180)

      await metro.fetch({ gtfs: true, maxResults: 1 })
      expect(metro[0].useFormedByData).to.be.false
    })
  })

  describe('The getStoppingPattern function', () => {
    it('Should fetch the stopping pattern based on the departure\'s TDN', async () => {
      let departureData = {
        departures: stubPatternData.departures.slice(0, 1),
        stops: stubPatternData.stops,
        directions: stubPatternData.directions,
        routes: stubPatternData.routes,
        runs: stubPatternData.runs,
        status: stubPatternData.status
      }

      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ departureData, stubPatternData ])
      let metro = new MetroDepartures(stubAPI, 49458)

      await metro.fetch({ gtfs: true, maxResults: 1 })
      expect(metro[0].runData.destination).to.equal('Flinders Street')

      let stoppingPattern = await metro[0].getStoppingPattern()
      let caulfield = stoppingPattern.stops.find(stn => stn.stationName === 'Caulfield')
      expect(caulfield).to.not.be.null
      expect(caulfield.platform).to.equal('3')
    })
  })
})