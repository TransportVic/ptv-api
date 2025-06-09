import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubDepartureData from './metro-site-mock-data/departures.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'
import { dateLikeToISO } from '../lib/date-utils.mjs'

describe('The MetroSiteDeparture class', () => {
  describe('The fetch function', () => {
    it('Should return a list of TDNs with available departure data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let departures = await ptvAPI.metroSite.getDepartures()

      let td1054 = departures.find(trip => trip.tdn === '1054')
      expect(td1054).to.exist
      expect(dateLikeToISO(td1054.operationalDateMoment)).to.equal('2025-04-19T14:00:00.000Z')
      expect(td1054.operationalDate).to.equal('20250420')

      let td1054Stops = td1054.stops
      expect(td1054Stops[0].stationName).to.equal('Bell')
      expect(td1054Stops[0].platform).to.equal('1')
      expect(dateLikeToISO(td1054Stops[0].scheduledDeparture)).to.equal('2025-04-20T04:54:00.000Z')
      expect(dateLikeToISO(td1054Stops[0].estimatedArrival)).to.equal('2025-04-20T04:54:00.000Z')
      expect(dateLikeToISO(td1054Stops[0].estimatedDeparture)).to.equal('2025-04-20T04:54:00.000Z')

      let td4406 = departures.find(trip => trip.tdn === '4406')
      expect(td4406).to.exist
      expect(dateLikeToISO(td4406.operationalDateMoment)).to.equal('2025-04-19T14:00:00.000Z')
      expect(td4406.operationalDate).to.equal('20250420')

      let td4406Stops = td4406.stops
      expect(td4406Stops[4].stationName).to.equal('Bonbeach')
      expect(td4406Stops[4].platform).to.equal('1')
      expect(dateLikeToISO(td4406Stops[4].scheduledDeparture)).to.equal('2025-04-20T05:49:00.000Z')
      expect(dateLikeToISO(td4406Stops[4].estimatedArrival)).to.equal('2025-04-20T05:50:00.000Z')
      expect(dateLikeToISO(td4406Stops[4].estimatedDeparture)).to.equal('2025-04-20T05:51:00.000Z')
    })
  })
})