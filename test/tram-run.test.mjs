import PTVAPI from "../lib/ptv-api.mjs"
import TramDepartures from "../lib/tram/tram-departures.mjs"
import { expect } from 'chai'
import { StubAPI } from "./stub-api.mjs"
import stubELSDepartureData from './tram-mock-data/elsternwick-departures.json' assert { type: 'json' }
import TramRun from "../lib/tram/tram-run.mjs"

describe('The TramRun class', () => {
  describe('The getDestination function', () => {
    it('Should extract the destination of the tram', () => {
      let firstDeparture = stubELSDepartureData.responseObject[0]
      expect(TramRun.getDestination(firstDeparture)).to.equal('Melbourne University')
    })
  })

  describe('The getVehicleData function', () => {
    it('Should extract the vehicle data of the tram, if available', () => {
      let firstDeparture = stubELSDepartureData.responseObject[0]
      expect(TramRun.getVehicleData(firstDeparture)).to.deep.equal({
        operator: 'Yarra Trams',
        id: 2115,
        lowFloor: false,
        airConditioned: true,
        dataSource: 'TramTracker'
      })
    })

    it('Should return null if the data is unavailable', () => {
      let firstDeparture = { 
        ...stubELSDepartureData.responseObject[0],
        VehicleNo: 0
      }

      expect(TramRun.getVehicleData(firstDeparture)).to.be.null
    })
  })

  describe('The getRunNumber function', () => {
    it('Should extract the run number of the tram', () => {
      let firstDeparture = stubELSDepartureData.responseObject[0]
      expect(TramRun.getRunNumber(firstDeparture)).to.equal('G-63')
    })
  })
})