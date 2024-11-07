import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubFKNDepartureData from './metro-mock-data/metro-departures-fkn.json' with { type: 'json' }
import stubFKNPatternData from './metro-mock-data/metro-pattern-fkn-lav.json' with { type: 'json' }

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
})

describe('The MetroStoppingPattern class', () => {
  describe('When handling FKN -> NPT through running', () => {
    it('It should only contain stops from FKN to FSS as part of the main trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubFKNDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN(4452)
      let runData = stoppingPattern.runData

      expect(runData.destination).to.equal('Flinders Street')
      expect(runData.forming.tdn).to.equal('6285')
      expect(runData.forming.destination).to.equal('Laverton')

      expect(stoppingPattern.stops[0].stationName).to.equal('Frankston')
      expect(stoppingPattern.stops.slice(-1)[0].stationName).to.equal('Flinders Street')
    })
  })
})