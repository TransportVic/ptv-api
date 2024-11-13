import BusStoppingPattern from '../lib/bus/bus-stopping-pattern.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubPatternData from './bus-mock-data/684-pattern.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'

describe('The BusStoppingPattern class', () => {
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding the required parameters', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.bus.getStoppingPatternFromRunRef('44-684--1-MF5-95614710', {
        date: new Date('2024-06-27T07:08:14.150Z'),
        expand: ['vehicleposition']
      })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/pattern/run/44-684--1-MF5-95614710/route_type/2?date_utc=2024-06-27T07:08:14.150Z&expand=vehicleposition&expand=run&expand=stop&expand=route&expand=direction',
        requestOptions: {}
      })
    })

    it('Should extract the run data from the API response', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.bus.getStoppingPatternFromRunRef('44-684--1-MF5-95614710')

      let runData = stoppingPattern.runData

      expect(runData.destination).to.equal('Ringwood Station/Maroondah Hwy')
    })

    it('Should extract the stop data from the API response', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.bus.getStoppingPatternFromRunRef('44-684--1-MF5-95614710')

      let stops = stoppingPattern.stops

      expect(stops[0].stationName).to.equal('Maroondah Hwy/Green St')
      expect(stops[0].scheduledDeparture.toUTC().toISO()).to.equal('2024-06-28T00:35:00.000Z')
      expect(stops[0].estimatedDeparture).to.not.be.null
      expect(stops[0].estimatedDeparture.toUTC().toISO()).to.equal('2024-06-28T00:35:00.000Z')

      expect(stops[1].stationName).to.equal('Harker St/Maroondah Hwy')
      expect(stops[1].scheduledDeparture.toUTC().toISO()).to.equal('2024-06-28T00:36:00.000Z')
      expect(stops[1].estimatedDeparture).to.be.null
    })

    it('Should deduplicate stops that appear twice in a row', async () => {
      let duplicatedData = {
        departures: [],
        stops: stubPatternData.stops,
        directions: stubPatternData.directions,
        routes: stubPatternData.routes,
        runs: stubPatternData.runs,
        status: stubPatternData.status
      }

      for (let stop of stubPatternData.departures) duplicatedData.departures.push(stop, stop)

      let stubAPI = new StubAPI()
      stubAPI.setResponses([ duplicatedData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.bus.getStoppingPatternFromRunRef('44-684--1-MF5-95614710')

      let stops = stoppingPattern.stops

      expect(stops[0].stationName).to.equal('Maroondah Hwy/Green St')
      expect(stops[1].stationName).to.equal('Harker St/Maroondah Hwy')
      expect(stops[2].stationName).to.equal('Crowley Rd/Maroondah Hwy')
    })
  })
})