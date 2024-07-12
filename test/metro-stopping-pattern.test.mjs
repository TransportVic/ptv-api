import MetroStoppingPattern from '../lib/metro/metro-stopping-pattern.mjs'
import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubPKMPatternData from './metro-mock-data/metro-pattern-pkm.json' assert { type: 'json' }
import stubHBEPatternData from './metro-mock-data/metro-pattern-hbe.json' assert { type: 'json' }
import stubCBEPatternData from './metro-mock-data/metro-pattern-cbe.json' assert { type: 'json' }
import stubRCEPatternData from './metro-mock-data/metro-pattern-rce.json' assert { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'

describe('The MetroStoppingPattern class', () => {
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding the required parameters', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPKMPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C104', {
        date: new Date('2024-06-27T07:08:14.150Z')
      })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/pattern/run/967104/route_type/0?date_utc=2024-06-27T07:08:14.150Z&expand=run&expand=stop&expand=route&expand=direction',
        requestOptions: {}
      })
    })

    it('Should extract the run data from the API response', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPKMPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C104')

      let runData = stoppingPattern.runData

      expect(runData.tdn).to.equal('C104')
      expect(runData.direction.railDirection).to.equal('Up')
      expect(runData.destination).to.equal('Flinders Street')
      expect(runData.viaCityLoop).to.be.true
    })

    it('Should extract the stop data from the API response', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubPKMPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C104')

      let stops = stoppingPattern.stops

      expect(stops[0].stationName).to.equal('East Pakenham')
      expect(stops[0].platform).to.equal('1')
      expect(stops[0].scheduledDeparture.toUTC().toISO()).to.equal('2024-06-27T07:45:00.000Z')
      expect(stops[0].estimatedDeparture).to.not.be.null
      expect(stops[0].estimatedDeparture.toUTC().toISO()).to.equal('2024-06-27T07:45:00.000Z')

      expect(stops[stops.length - 1].stationName).to.equal('Flinders Street')
      expect(stops[stops.length - 1].platform).to.equal('6')
      expect(stops[stops.length - 1].scheduledDeparture.toUTC().toISO()).to.equal('2024-06-27T09:06:00.000Z')
      expect(stops[stops.length - 1].estimatedDeparture).to.be.null
    })

    it('Should deduplicate stops that appear twice in a row', async () => {
      let duplicatedData = {
        departures: [],
        stops: stubPKMPatternData.stops,
        directions: stubPKMPatternData.directions,
        routes: stubPKMPatternData.routes,
        runs: stubPKMPatternData.runs,
        status: stubPKMPatternData.status
      }

      for (let stop of stubPKMPatternData.departures) duplicatedData.departures.push(stop, stop)

      let stubAPI = new StubAPI()
      stubAPI.setResponses([ duplicatedData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C104')

      let stops = stoppingPattern.stops

      expect(stops[0].stationName).to.equal('East Pakenham')
      expect(stops[1].stationName).to.equal('Pakenham')
      expect(stops[2].stationName).to.equal('Cardinia Road')
    })

    it('Should rename Jolimont-MCG to just Jolimont', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubHBEPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('1234')

      let stops = stoppingPattern.stops

      expect(stops[22].stationName).to.equal('Jolimont')
    })

    it('Should should update the platform number for Platform 2 (4 Road) at Flemington Racecourse', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubRCEPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('R800')

      expect(stoppingPattern.stops[0].stationName).to.equal('Flemington Racecourse')
      expect(stoppingPattern.stops[0].platform).to.equal('2')
    })

    it('Should trim away the city loop stops of the forming trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubHBEPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('1234')

      expect(stoppingPattern.runData.destination).to.equal('Flinders Street')
      let lastStop = stoppingPattern.stops[stoppingPattern.stops.length - 1]
      expect(lastStop.stationName).to.equal('Flinders Street')

      expect(stoppingPattern.formingStops[0].stationName).to.equal('Southern Cross')
    })

    it('Should trim away the city loop stops of the formed by trip', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubCBEPatternData ])
      let ptvAPI = new PTVAPI(stubAPI)
      let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C425')

      expect(stoppingPattern.runData.destination).to.equal('Cranbourne')
      expect(stoppingPattern.stops[0].stationName).to.equal('Flinders Street')

      expect(stoppingPattern.formedByStops[0].stationName).to.equal('Parliament')
      expect(stoppingPattern.formedByStops.slice(-1)[0].stationName).to.equal('Southern Cross')
    })
  })
})