import MetroDepartures from '../lib/metro/metro-departures.mjs'
import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubDepartureData from './metro-mock-data/metro-departures.json' with { type: 'json' }
import stubRRBDepartureData from './metro-mock-data/metro-departures-rrb.json' with { type: 'json' }
import stubCCLDepartureData from './metro-mock-data/metro-departures-ccl.json' with { type: 'json' }
import stubCLPTestDepartureData from './metro-mock-data/metro-departures-via-clp-test.json' with { type: 'json' }
import stubPARDepartureData from './metro-mock-data/city-loop-departures.json' with { type: 'json' }
import stubBEGDepartureData from './metro-mock-data/metro-departures-beg.json' with { type: 'json' }
import stubSSSDepartureData from './metro-mock-data/metro-departures-sss.json' with { type: 'json' }
import stubBXRDepartureData from './metro-mock-data/metro-departures-bxr.json' with { type: 'json' }
import stubRMDDepartureData from './metro-mock-data/metro-departures-rmd.json' with { type: 'json' }

import stubPKMPatternData from './metro-mock-data/metro-pattern-pkm.json' with { type: 'json' }
import stubRCEPatternData from './metro-mock-data/metro-pattern-rce.json' with { type: 'json' }
import MetroRun from '../lib/metro/metro-run.mjs'
import PTVAPI from '../lib/ptv-api.mjs'

describe('The MetroDepartures class', () => {
  describe('The fetch function', () => {
    it('Should use the estimated time if available', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(+metro[0].actualDeparture).to.equal(+new Date(stubDepartureData.departures[0].estimated_departure_utc))
    })

    it('Should return a position if available', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810, { gtfs: true, maxResults: 1 })
    
      expect(metro[0].runData.position).to.not.be.null
      expect(metro[0].runData.position.type).to.equal('Feature')

      expect(metro[1].runData.position).to.be.null
    })

    it('Should calculate the TDN if specified', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData, stubRRBDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)
    
      expect(metro[0].runData instanceof MetroRun).to.be.true
      expect(metro[0].runData.tdn).to.equal('4217')
      expect(metro[1].runData.tdn).to.equal('4622')
      expect(metro[2].runData.tdn).to.equal(null) // Future departure
      
      let metroRail = await ptvAPI.metro.getDepartures(19810)

      expect(metroRail[0].runData.tdn).to.equal(null) // Rail bus
    })

    it('Should detect rail buses', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubRRBDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.isRailBus).to.be.true
    })

    it('Should detect city circle trains and add the route data accordingly', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCCLDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(metro[0].routeData.routeName).to.equal('City Circle')
    })

    it('Should provide the route data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(metro[0].routeData.routeName).to.equal('Cranbourne')
      expect(metro[0].routeData.gtfsRouteID).to.equal('2-CRB')
      expect(metro[0].routeData.routeNumber).to.null
    })

    it('Should populate the parameters with default data if not provided', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].routeData.routeName).to.equal('Cranbourne')
    })
  })

  describe('The calculation of rail direction', () => {
    it('Should be calculated for regular trains', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.direction.railDirection).to.equal('Down')
      expect(metro[1].runData.direction.railDirection).to.equal('Up')
    })

    it('Should be calculated for city circle trains as Down all the time', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCCLDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.direction.railDirection).to.equal('Down')
    })

    it('Should be calculated for rail buses as well without relying on any TDN', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubRRBDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.direction.railDirection).to.equal('Down')
      expect(metro[1].runData.direction.railDirection).to.equal('Up')
      expect(metro[2].runData.direction.railDirection).to.equal('Down')
    })  
  })

  describe('The calculation of city loop running', () => {
    it('Should be calculated for regular trains', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCLPTestDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.viaCityLoop).to.be.false
      expect(metro[1].runData.viaCityLoop).to.be.true
      expect(metro[2].runData.viaCityLoop).to.be.true
      expect(metro[3].runData.viaCityLoop).to.be.false
      expect(metro[4].runData.viaCityLoop).to.be.null
    })

    it('Should not be calculated for future trains with no TDN', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCLPTestDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[4].runData.viaCityLoop).to.be.null
    })

    it('Should not be calculated for rail buses', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubRRBDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.viaCityLoop).to.be.null
    })

    it('Should be true for city circle trains', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCCLDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.viaCityLoop).to.be.true
    })

    it('Should marked updated/amended trips as such', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubRMDDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].runData.tdn).to.equal('C008')
      expect(metro[0].runData.forming.tdn).to.equal('C013')
      expect(metro[0].runData.forming.destination).to.equal('East Pakenham')
      expect(metro[0].runData.updated).to.be.true

      expect(metro[1].runData.destination).to.equal('Flinders Street')
      expect(metro[1].runData.tdn).to.equal('X016')
      expect(metro[1].runData.forming.destination).to.equal('Sandringham')
      expect(metro[1].runData.updated).to.be.false
    })

    it('Should marked cancelled trips as such', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubBEGDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].runData.tdn).to.equal('3064')
      expect(metro[0].runData.forming.tdn).to.equal('3651')
      expect(metro[0].runData.forming.destination).to.equal('Blackburn')
      expect(metro[0].runData.cancelled).to.be.true
    })
  })

  describe('The interchange data', () => {
    it('Should convert the distributor into the formed by', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.formedBy.tdn).to.equal('4000')
    })

    it('Should convert the feeder into the forming', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[0].runData.forming.tdn).to.equal('4001')
    })

    it('Should not use values where the run_ref is equal to 0', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19810)

      expect(metro[1].runData.forming).to.be.null
    })
  })

  describe('Departures from the city loop', () => {
    it('Should identify Down non-loop trains in the loop', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPARDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].useFormedByData).to.be.true
    })

    it('Should modify the TDN to use the formed by data, and alter the destination to Flinders Street', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPARDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.tdn).to.equal('5616')
      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].runData.viaCityLoop).to.be.true
      expect(metro[0].runData.direction.railDirection).to.equal('Up')
    })

    it('Should modify the forming to become to orignal TDN', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPARDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.forming.tdn).to.equal('5009')
    })

    it('Should remove the formed by as this is no longer available', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPARDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.formedBy).to.be.null
    })

    it('Should not modify city circle trains', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCCLDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].useFormedByData).to.be.false
    })

    it('Should updated run-through destinations like Southern Cross or Parliament to Flinders Street', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPARDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[2].runData.destination).to.equal('Flinders Street')
      expect(metro[2].runData.forming.tdn).to.equal('5265')
      expect(metro[2].runData.forming.destination).to.equal('Craigieburn')
    })
  })

  describe('The getStoppingPattern function', () => {
    it('Should fetch the stopping pattern based on the departure\'s TDN', async () => {
      let departureData = {
        departures: stubPKMPatternData.departures.slice(0, 1),
        stops: stubPKMPatternData.stops,
        directions: stubPKMPatternData.directions,
        routes: stubPKMPatternData.routes,
        runs: stubPKMPatternData.runs,
        status: stubPKMPatternData.status
      }

      let stubAPI = new StubAPI()
      stubAPI.setResponses([ departureData, stubPKMPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.destination).to.equal('Flinders Street')

      let stoppingPattern = await metro[0].getStoppingPattern()
      let caulfield = stoppingPattern.stops.find(stn => stn.stationName === 'Caulfield')
      expect(caulfield).to.not.be.null
      expect(caulfield.platform).to.equal('3')
    })
  })

  describe('Up Direct trains ending at Parliament', () => {
    it('Should correct the destination to Flinders Street', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubBEGDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19844)

      expect(metro[0].runData.destination).to.equal('Flinders Street')
    })
  })

  describe('Down trains on Southern Cross platform 13', () => {
    it('Should correct it to an Up train on the formed by trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubSSSDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[1].runData.destination).to.equal('Williamstown')
    })
  })

  describe('Up Northern Group trains on Southern Cross platform 11', () => {
    it('Should not correct it to an Up train on the formed by trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubSSSDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(22180)

      expect(metro[2].runData.destination).to.equal('Flinders Street')
      expect(metro[2].runData.tdn).to.equal('5036')
    })
  })

  describe('Platform 2 (4 Road) at Flemington Racecourse', () => {
    it('Should update the platform number in the depature data', async () => {
      let departureData = {
        departures: stubRCEPatternData.departures.slice(0, 1),
        stops: stubRCEPatternData.stops,
        directions: stubRCEPatternData.directions,
        routes: stubRCEPatternData.routes,
        runs: stubRCEPatternData.runs,
        status: stubRCEPatternData.status
      }

      let stubAPI = new StubAPI()
      stubAPI.setResponses([ departureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(20027)

      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].platform).to.equal('2')
    })
  })

  describe('Stony Point trains', () => {
    it('Should accuratly detect their rail direction', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubBXRDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19834)

      expect(metro[0].runData.destination).to.equal('Frankston')
      expect(metro[0].runData.tdn).to.be.null
      expect(metro[0].runData.direction.railDirection).to.equal('Up')

      expect(metro[1].runData.destination).to.equal('Stony Point')
      expect(metro[1].runData.tdn).to.be.null
      expect(metro[1].runData.direction.railDirection).to.equal('Down')
    })
  })
})