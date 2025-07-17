import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubPKMPatternData from './metro-mock-data/metro-pattern-pkm.json' with { type: 'json' }
import stubHBEPatternData from './metro-mock-data/metro-pattern-hbe.json' with { type: 'json' }
import stubCBEPatternData from './metro-mock-data/metro-pattern-cbe.json' with { type: 'json' }
import stubRCEPatternData from './metro-mock-data/metro-pattern-rce.json' with { type: 'json' }
import stubBadPatternData from './metro-mock-data/metro-bad-pattern.json' with { type: 'json' }
import stubTD4439PatternData from './metro-mock-data/tdn-4439-pattern.json' with { type: 'json' }
import stubTD3230PatternData from './metro-mock-data/tdn-3230-pattern.json' with { type: 'json' }
import stubTD4439BadPatternData from './metro-mock-data/tdn-4439-pattern-bad-day.json' with { type: 'json' }
import stubTDC842PatternData from './metro-mock-data/tdn-c842-pattern.json' with { type: 'json' }
import stubTD1202PatternData from './metro-mock-data/tdn-1202-pattern.json' with { type: 'json' }
import parliamentOnlyPattern from './metro-mock-data/parliament-only.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'
import { dateLikeToISO, stubDate, unstubDate } from '../lib/date-utils.mjs'

let clone = o => JSON.parse(JSON.stringify(o))

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
    expect(stoppingPattern.runData.updated).to.be.true
    expect(stoppingPattern.stops[0].stationName).to.equal('Flinders Street')

    expect(stoppingPattern.formedByStops[0].stationName).to.equal('Parliament')
    expect(stoppingPattern.formedByStops.slice(-1)[0].stationName).to.equal('Southern Cross')
  })

  it('Should mark additional trips as such', async () => {
    let stubAPI = new StubAPI()
    let response = clone(stubCBEPatternData)
    response.runs[response.departures[0].run_ref].status = 'added'
    stubAPI.setResponses([ response ])

    let ptvAPI = new PTVAPI(stubAPI)
    let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('C425')

    expect(stoppingPattern.runData.additional).to.be.true
  })

  it('Should identify pattern data where there is a random block of lateness in the future and correct this', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubBadPatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    stubDate('2025-01-12T11:30:00Z')

    let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('1695')

    expect(stoppingPattern.runData.destination).to.equal('Mernda')
    expect(stoppingPattern.stops[0].stationName).to.equal('Flinders Street')

    expect(stoppingPattern.stops[0].delay).to.equal(0)

    let wrm = stoppingPattern.stops.find(stop => stop.stationName === 'West Richmond')
    expect(wrm.delay).to.equal(0)
    expect(dateLikeToISO(wrm.estimatedDeparture)).to.equal('2025-01-12T11:45:00.000Z')

    let nrm = stoppingPattern.stops.find(stop => stop.stationName === 'North Richmond')
    expect(nrm.delay).to.equal(0)
    expect(dateLikeToISO(nrm.estimatedDeparture)).to.equal('2025-01-12T11:47:00.000Z')

    expect(stoppingPattern.stops.find(stop => stop.stationName === 'Epping').delay).to.equal(2)
    expect(stoppingPattern.stops.slice(-1)[0].delay).to.be.null

    unstubDate()
  })

  it('Should not apply delay correction to FSS on Up trips', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubTD3230PatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    stubDate('2025-06-12T09:13:00.000Z')

    let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('3230')

    expect(stoppingPattern.runData.destination).to.equal('Flinders Street')

    expect(stoppingPattern.stops[0].stationName).to.equal('Lilydale')
    expect(stoppingPattern.stops[0].delay).to.equal(0)

    let rmd = stoppingPattern.stops.find(stop => stop.stationName === 'Richmond')
    expect(rmd.delay).to.equal(14)
    expect(dateLikeToISO(rmd.estimatedDeparture)).to.equal('2025-06-12T09:13:50.000Z')

    let fss = stoppingPattern.stops.find(stop => stop.stationName === 'Flinders Street')
    expect(fss.delay).to.equal(0)
    expect(dateLikeToISO(fss.estimatedDeparture)).to.equal('2025-06-12T09:29:00.000Z')

    unstubDate()
  })

  it('Should mark cancelled trips as such', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubHBEPatternData ])
    let ptvAPI = new PTVAPI(stubAPI)
    let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('1234')
    expect(stoppingPattern.runData.cancelled).to.be.true
  })

  it('Should return the trip\'s PT operation day', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubHBEPatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('1234')
    expect(stoppingPattern.runData.operationDay).to.equal('20240630')
  })

  it('Should return the previous day as the trip\'s PT operation day if it starts before 3am', async () => {
    let stubAPI = new StubAPI()
    let response = clone(stubHBEPatternData)
    response.departures[0].scheduled_departure_utc = '2024-06-30T15:46:00Z'
    stubAPI.setResponses([ response ])
    let ptvAPI = new PTVAPI(stubAPI)

    let stoppingPattern = await ptvAPI.metro.getStoppingPatternFromTDN('1234')
    expect(stoppingPattern.runData.operationDay).to.equal('20240630')
  })

  it('Should account for a repeated 2am on DST days when calculating the PT operation day', async () => {
    let stubAPI = new StubAPI()
    let response1 = clone(stubHBEPatternData)
    response1.departures[0].scheduled_departure_utc = '2025-04-05T15:46:00Z' // First 2am

    let response2 = clone(stubHBEPatternData)
    response2.departures[0].scheduled_departure_utc = '2025-04-05T16:46:00Z' // Second 2am

    let response3 = clone(stubHBEPatternData)
    response3.departures[0].scheduled_departure_utc = '2025-04-05T17:46:00Z' // 3am

    stubAPI.setResponses([ response1, response2, response3 ])

    let ptvAPI = new PTVAPI(stubAPI)

    expect((await ptvAPI.metro.getStoppingPatternFromTDN('1234')).runData.operationDay).to.equal('20250405')
    expect((await ptvAPI.metro.getStoppingPatternFromTDN('1234')).runData.operationDay).to.equal('20250405')
    expect((await ptvAPI.metro.getStoppingPatternFromTDN('1234')).runData.operationDay).to.equal('20250406')
  })

  it('Should remove duplicated Flinders Street and Southern Cross stops on Cross City trips', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubTD4439PatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let pattern = await ptvAPI.metro.getStoppingPatternFromTDN('4439')
    expect(dateLikeToISO(pattern.stops[0].scheduledDeparture)).to.equal('2025-06-09T09:39:00.000Z')
    expect(dateLikeToISO(pattern.formedByStops[pattern.formedByStops.length - 1].scheduledDeparture)).to.equal('2025-06-09T09:34:00.000Z')
  })

  it('Should remove duplicated Flinders Street and Southern Cross that span across 2 days stops on Cross City trips', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubTD4439BadPatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let pattern = await ptvAPI.metro.getStoppingPatternFromTDN('4439')
    expect(pattern.runData.operationDay).to.equal('20250611')
    expect(dateLikeToISO(pattern.stops[0].scheduledDeparture)).to.equal('2025-06-11T04:57:00.000Z')
  })

  it('Should return null for an invalid response', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ {"disruptions":[],"departures":[],"stops":{},"routes":{},"runs":{},"directions":{},"status":{"version":"3.0","health":1}} ])
    let ptvAPI = new PTVAPI(stubAPI)

    let pattern = await ptvAPI.metro.getStoppingPatternFromTDN('4439')
    expect(pattern).to.be.null
  })

  it('Should account for trips with only 2 stops', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubTDC842PatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let pattern = await ptvAPI.metro.getStoppingPatternFromTDN('C842')
    expect(pattern).to.exist
    expect(pattern.stops[0].stationName).to.equal('Richmond')
  })

  it('Corrects the destination as well', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubTD1202PatternData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let pattern = await ptvAPI.metro.getStoppingPatternFromTDN('1202')
    expect(pattern).to.exist
    expect(pattern.runData.destination).to.equal('Jolimont')
    expect(pattern.stops[0].stationName).to.equal('Heidelberg')
  })

  it('Does not break a half city circle PAR-FSS service', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ parliamentOnlyPattern ])
    let ptvAPI = new PTVAPI(stubAPI)

    let pattern = await ptvAPI.metro.getStoppingPatternFromTDN('0806')
    expect(pattern).to.exist
    expect(pattern.runData.destination).to.equal('Flinders Street')
    expect(pattern.stops[0].stationName).to.equal('Parliament')
    expect(pattern.stops[1].stationName).to.equal('Flinders Street')
  })
})