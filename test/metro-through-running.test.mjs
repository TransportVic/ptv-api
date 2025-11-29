import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubFKNDepartureData from './metro-mock-data/metro-departures-fkn.json' with { type: 'json' }
import stubEPHDepartureData from './metro-mock-data/metro-departures-eph.json' with { type: 'json' }
import stubFKNPatternData from './metro-mock-data/metro-pattern-fkn-lav.json' with { type: 'json' }
import stubEPHPatternData from './metro-mock-data/tdn-C100-Z601-pattern.json' with { type: 'json' }
import stubEPHLivePatternData from './metro-mock-data/tdn-C100-Z601-live.json' with { type: 'json' }

import PTVAPI from '../lib/ptv-api.mjs'

describe('The MetroDepartures class', () => {
  describe('When handling FKN -> NPT through running', () => {
    it('Reflect the true run destination, with the next trip provided in the forming data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubFKNDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19855)

      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].runData.forming.tdn).to.equal('6283')
      expect(metro[0].runData.forming.destination).to.equal('Laverton')
    })
  })

  describe('When handling EPH -> SUY through running', () => {
    it('Reflect the true run destination, with the next trip provided in the forming data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubEPHDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(26507)

      expect(metro[0].runData.destination).to.equal('Town Hall')
      expect(metro[0].runData.forming.tdn).to.equal('Z601')
      expect(metro[0].runData.forming.destination).to.equal('West Footscray')
    })
  })
})

describe('The MetroStoppingPattern class', () => {
  describe('When handling FKN -> NPT through running', () => {
    it('It should only contain stops from FKN to FSS as part of the main trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubFKNPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN(4454)

      expect(stoppingPattern.stops[0].stationName).to.equal('Frankston')
      expect(stoppingPattern.stops.slice(-1)[0].stationName).to.equal('Flinders Street')
    })

    it('It should show the LAV trip as part of the forming, and keep the current trip as FSS headboard', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubFKNPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN(4454)
      let runData = stoppingPattern.runData

      expect(runData.destination).to.equal('Flinders Street')
      expect(runData.forming.tdn).to.equal('6285')
      expect(runData.forming.destination).to.equal('Laverton')
      expect(runData.forming.advertised).to.be.true
    })

    it('Contains stops from FSS to LAV as part of the forming trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubFKNPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN(4454)

      expect(stoppingPattern.formingStops[0].stationName).to.equal('Southern Cross')
      expect(stoppingPattern.formingStops.slice(-1)[0].stationName).to.equal('Laverton')
      expect(stoppingPattern.formingStops.length).to.equal(12)
    })
  })

  describe('When handling EPH -> SUY through running', () => {
    it('Contains only stops from EPH to THL as part of the main trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubEPHPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C100')

      expect(stoppingPattern.stops[0].stationName).to.equal('East Pakenham')
      expect(stoppingPattern.stops.slice(-1)[0].stationName).to.equal('Town Hall')
    })

    it('Contains stops from THL to SUY as part of the forming trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubEPHPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C100')

      expect(stoppingPattern.formingStops[0].stationName).to.equal('State Library')
      expect(stoppingPattern.formingStops.slice(-1)[0].stationName).to.equal('West Footscray')
    })

    it('Picks the copy of Town Hall with live timings on the down trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubEPHLivePatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('Z601')

      expect(stoppingPattern.stops[0].stationName).to.equal('Town Hall')
      expect(stoppingPattern.stops[0].estimatedDeparture).to.exist
      expect(stoppingPattern.stops[0].estimatedDeparture.toISOString()).to.equal('2025-11-29T23:18:00Z')
    })
  })
})