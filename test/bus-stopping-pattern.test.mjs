import BusStoppingPattern from '../lib/bus/bus-stopping-pattern.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubPatternData from './bus-mock-data/684-pattern.json' assert { type: 'json' }

describe('The BusStoppingPattern class', () => {
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding the required parameters', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPatternData ])
      let stoppingPattern = new BusStoppingPattern(stubAPI, '44-684--1-MF5-95614710')
      await stoppingPattern.fetch({
        date: new Date('2024-06-27T07:08:14.150Z'),
        expand: ['vehicleposition']
      })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/pattern/run/44-684--1-MF5-95614710/route_type/2?date_utc=2024-06-27T07:08:14.150Z&expand=vehicleposition&expand=run&expand=stop&expand=route&expand=direction',
        requestOptions: {}
      })
    })

    it('Should extract the run data from the API response', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPatternData ])
      let stoppingPattern = new BusStoppingPattern(stubAPI, '44-684--1-MF5-95614710')
      await stoppingPattern.fetch()

      let runData = stoppingPattern.runData

      expect(runData.destination).to.equal('Ringwood Station/Maroondah Hwy')
    })

    it('Should extract the stop data from the API response', async () => {
      let stubAPI = new StubAPI('1', '2')
      stubAPI.setResponses([ stubPatternData ])
      let stoppingPattern = new BusStoppingPattern(stubAPI, '44-684--1-MF5-95614710')
      await stoppingPattern.fetch()

      let stops = stoppingPattern.stops

      expect(stops[0].stationName).to.equal('Maroondah Hwy/Green St')
      expect(stops[0].scheduledDeparture.toISOString()).to.equal('2024-06-28T00:35:00.000Z')
      expect(stops[0].estimatedDeparture).to.not.be.null
      expect(stops[0].estimatedDeparture.toISOString()).to.equal('2024-06-28T00:35:00.000Z')

      expect(stops[1].stationName).to.equal('Harker St/Maroondah Hwy')
      expect(stops[1].scheduledDeparture.toISOString()).to.equal('2024-06-28T00:36:00.000Z')
      expect(stops[1].estimatedDeparture).to.be.null
    })
  })
})