import { StubAPI } from "./stub-api.mjs"
import { expect } from 'chai'
import stubDepartureData from './bus-mock-data/monash-departures.json' assert { type: 'json' }
import PTVAPI from "../lib/ptv-api.mjs"
import { PTVAPIError, PTVAPIInterface } from "../lib/ptv-api-interface.mjs"

describe('The BusDepartures class', () => {
  describe('The fetch function', () => {
    it('Should use the estimated time if available', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(+buses[0].actualDeparture).to.equal(+new Date(stubDepartureData.departures[0].estimated_departure_utc))
    })

    it('Should provide the route data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(buses[0].routeData.routeName).to.equal("Dandenong - Chadstone via North Dandenong & Oakleigh")
      expect(buses[0].routeData.gtfsRouteID).to.equal('4-862')
      expect(buses[0].routeData.routeNumber).to.equal('862')
    })

    it('Should return a position if available', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(buses[0].runData.position).to.not.be.null
      expect(buses[0].runData.position.type).to.equal('Feature')

      let departure630 = buses.find(dep => dep.routeData.routeNumber === '630')
      expect(departure630.runData.position).to.be.null
    })

    it('Should filter out combined route departures', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      let departureCombined = buses.find(dep => dep.routeData.gtfsRouteID === '4-C17')
      expect(departureCombined).to.be.undefined
    })

    it('Should extract the route number from the route name if it is missing from the route number', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      let departure737 = buses.find(dep => dep.runData.runRef === '29-737--1-MF15-14')
      expect(departure737.routeData.routeNumber).to.equal('737')
      expect(departure737.routeData.routeName).to.equal('Croydon Station - Monash University via Boronia & Knox City Shopping Centre & Glen Waverley')
    })

    it('Should extract the direction data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      expect(buses[0].runData.direction.directionName).to.equal('Dandenong')
    })

    it('Should parse the Smartrak ID if available (please come back 🥺)', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let ptvAPI = new PTVAPI(stubAPI)

      let buses = await ptvAPI.bus.getDepartures(19810, { gtfs: true, maxResults: 1 })

      let departure862 = buses.find(dep => dep.runData.runRef === '41-862--1-MF1-34')
      expect(departure862.runData.vehicle.smartrakID).to.equal(60202)
    })

    it('Should raise an appropriate error if the Stop ID is invalid', async () => {
      let response = {"message":"Invalid combination of route_type: bus, stop_id: 34079 & optional query string param gtfs: True","status":{"version":"3.0","health":1}}

      let stubAPI = new StubAPI()
      stubAPI.setResponses([ response ])
      let ptvAPI = new PTVAPI(stubAPI)

      let error = await ptvAPI.bus.getDepartures(34079, { gtfs: true }).catch(e => e)

      expect(error).to.be.instanceof(PTVAPIError)
      expect(error.code).to.equal('INVALID_STOP')
    })
  })
})