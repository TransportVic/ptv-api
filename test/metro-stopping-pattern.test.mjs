import MetroStoppingPattern from '../lib/metro/metro-stopping-pattern.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubPatternData from './mock-data/metro-pattern-pkm.json' assert { type: 'json' }

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

      let metroRun = stoppingPattern.extractRunData()

      expect(metroRun.tdn).to.equal('C104')
      expect(metroRun.direction.railDirection).to.equal('Up')
      expect(metroRun.destination).to.equal('Flinders Street')
      expect(metroRun.viaCityLoop).to.be.true
    })
  })
})