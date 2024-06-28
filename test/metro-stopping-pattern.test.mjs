import MetroStoppingPattern from '../lib/metro/metro-stopping-pattern.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubPatternData from './metro-mock-data/metro-pattern-pkm.json' assert { type: 'json' }

describe('The MetroStoppingPattern class', () => {
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding the required parameters', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPatternData ])
      let stoppingPattern = new MetroStoppingPattern(stubAPI, 967104)
      await stoppingPattern.fetch({
        date: new Date('2024-06-27T07:08:14.150Z')
      })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/pattern/run/967104/route_type/0?date_utc=2024-06-27T07:08:14.150Z&expand=run&expand=stop&expand=route&expand=direction',
        requestOptions: {}
      })
    })

    it('Should extract the run data from the API response', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPatternData ])
      let stoppingPattern = new MetroStoppingPattern(stubAPI, 967104)
      await stoppingPattern.fetch()

      let runData = stoppingPattern.runData

      expect(runData.tdn).to.equal('C104')
      expect(runData.direction.railDirection).to.equal('Up')
      expect(runData.destination).to.equal('Flinders Street')
      expect(runData.viaCityLoop).to.be.true
    })

    it('Should extract the stop data from the API response', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPatternData ])
      let stoppingPattern = new MetroStoppingPattern(stubAPI, 967104)
      await stoppingPattern.fetch()

      let stops = stoppingPattern.stops

      expect(stops[0].stationName).to.equal('East Pakenham')
      expect(stops[0].platform).to.equal('1')
      expect(stops[0].scheduledDeparture.toISOString()).to.equal('2024-06-27T07:45:00.000Z')
      expect(stops[0].estimatedDeparture).to.not.be.null
      expect(stops[0].estimatedDeparture.toISOString()).to.equal('2024-06-27T07:45:00.000Z')

      expect(stops[stops.length - 1].stationName).to.equal('Flinders Street')
      expect(stops[stops.length - 1].platform).to.equal('6')
      expect(stops[stops.length - 1].scheduledDeparture.toISOString()).to.equal('2024-06-27T09:06:00.000Z')
      expect(stops[stops.length - 1].estimatedDeparture).to.be.null
    })

    // Todo: add checks to trim destination to and from FSS
  })
})