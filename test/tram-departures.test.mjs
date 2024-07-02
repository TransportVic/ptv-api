import PTVAPI from "../lib/ptv-api.mjs"
import TramDepartures from "../lib/tram/tram-departures.mjs"
import { expect } from 'chai'
import { StubAPI } from "./stub-api.mjs"
import stubELSDepartureData from './tram-mock-data/elsternwick-departures.json' assert { type: 'json' }
import TramDeparture from "../lib/tram/tram-departure.mjs"

describe('The TramDepartures class', () => {
  describe('The getAPIURL function', () => {
    it('Should default the route number to 0 (all routes), and the low floor specification if unspecified', () => {
      let tram = new TramDepartures(null, 1044)
      expect(tram.getAPIURL()).to.equal('/GetPredictionsCollection/1044/0/false')
    })

    it('Should add the route number if specified', () => {
      let tram = new TramDepartures(null, 1044)
      expect(tram.getAPIURL({ route: '67' })).to.equal('/GetPredictionsCollection/1044/67/false')
    })

    it('Should add a low floor specification if specified', () => {
      let tram = new TramDepartures(null, 1044)
      expect(tram.getAPIURL({ lowFloorOnly: true })).to.equal('/GetPredictionsCollection/1044/0/true')
    })

    it('Should handle both parameters specified at once', () => {
      let tram = new TramDepartures(null, 3001)
      expect(tram.getAPIURL({ route: '3', lowFloorOnly: true })).to.equal('/GetPredictionsCollection/3001/3/true')
    })
  })

  describe('The fetch function', () => {
    it('Should extract the route number and GTFS ID of the departures', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubELSDepartureData ])
      stubAPI.skipErrors()
      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addTramTracker(stubAPI)
      let trams = await ptvAPI.tram.getDepartures(1044)

      expect(trams[0].routeData.routeNumber).to.equal('67')
      expect(trams[0].routeData.gtfsRouteID).to.equal('3-67')
    })

    it('Should extract the run data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubELSDepartureData ])
      stubAPI.skipErrors()
      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addTramTracker(stubAPI)
      let trams = await ptvAPI.tram.getDepartures(1044)

      expect(trams[0].runData.runNumber).to.equal('G-63')
      expect(trams[0].runData.destination).to.equal('Melbourne University')
      expect(trams[0].runData.vehicle).to.not.be.null
      expect(trams[0].runData.vehicle.id).to.equal(2115)
    })

    it('Should provide the scheduled and estimated departure times', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubELSDepartureData ])
      stubAPI.skipErrors()
      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addTramTracker(stubAPI)
      let trams = await ptvAPI.tram.getDepartures(1044)

      expect(trams[0].scheduledDeparture).to.not.be.null
      expect(trams[0].scheduledDeparture.toISOString()).to.equal('2024-07-02T01:01:00.000Z')
      expect(trams[0].estimatedDeparture).to.not.be.null
    })
  })
})

describe('The TramDeparture class', () => {
  describe('The getScheduledTime function', () => {
    it('Should extract the scheduled departure time of the tram', () => {
      let firstDeparture = stubELSDepartureData.responseObject[0]
      let departureTime = TramDeparture.getScheduledTime(firstDeparture)

      expect(departureTime.toISOString()).to.equal('2024-07-02T01:01:00.000Z')
    })
  })

  describe('The getEstimatedTime function', () => {
    it('Should extract the estimated departure time of the tram', () => {
      let firstDeparture = stubELSDepartureData.responseObject[0]
      let departureTime = TramDeparture.getEstimatedTime(firstDeparture)

      expect(departureTime.toISOString()).to.equal('2024-07-02T01:01:05.390Z')
    })
  })

  describe('The getRouteNumber function', () => {
    it('Should extract the route number of the tram', () => {
      let firstDeparture = stubELSDepartureData.responseObject[0]
      expect(TramDeparture.getRouteNumber(firstDeparture)).to.equal('67')
    })
  })
})