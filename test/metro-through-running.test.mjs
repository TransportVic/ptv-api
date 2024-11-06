import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubFKNDepartureData from './metro-mock-data/metro-departures-fkn.json' with { type: 'json' }

import PTVAPI from '../lib/ptv-api.mjs'

describe('The MetroDepartures class', () => {
  describe('When handling FKN -> NPT through running', () => {
    it('Reflect the true run destination, with the next trip provided in the forming data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubFKNDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let metro = await ptvAPI.metro.getDepartures(19855)
      console.log(metro[0])
      expect(metro[0].runData.destination).to.equal('Flinders Street')
      expect(metro[0].runData.forming.tdn).to.equal('6283')
      expect(metro[0].runData.forming.destination).to.equal('Laverton')
    })
  })
})