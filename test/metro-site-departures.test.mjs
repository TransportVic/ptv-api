import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubDepartureData from './metro-site-mock-data/departures.json' with { type: 'json' }
import stubBadDepartureData from './metro-site-mock-data/bad-departures.json' with { type: 'json' }
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

    it('Should shift post 12am departures forward by a day', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ {
        entries: [{"timetable_num": "0", "day_type": "3", "to_city": "0", "station": "Flinders Street", "time_seconds": "86580", "time_str": "12:03 AM", "is_arrival": "0", "trip_id": "6065", "platform": "5", "estimated_arrival_time_str": "11:52 PM", "estimated_arrival_time_seconds": 85920, "estimated_departure_time_str": "0:03 AM", "estimated_departure_time_seconds": 180, "estimated_platform": "5"}],
        created: 1749473586000
      } ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let departures = await ptvAPI.metroSite.getDepartures()

      let td6065 = departures.find(trip => trip.tdn === '6065')
      expect(td6065).to.exist
      expect(dateLikeToISO(td6065.operationalDateMoment)).to.equal('2025-06-08T14:00:00.000Z')
      expect(td6065.operationalDate).to.equal('20250609')

      let td1054Stops = td6065.stops
      expect(td1054Stops[0].stationName).to.equal('Flinders Street')
      expect(td1054Stops[0].platform).to.equal('5')
      expect(dateLikeToISO(td1054Stops[0].scheduledDeparture)).to.equal('2025-06-09T14:03:00.000Z')
      expect(dateLikeToISO(td1054Stops[0].estimatedArrival)).to.equal('2025-06-09T13:52:00.000Z')
      expect(dateLikeToISO(td1054Stops[0].estimatedDeparture)).to.equal('2025-06-09T14:03:00.000Z')
    })

    it('Should not set arrival times if it is unavailable', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubBadDepartureData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let departures = await ptvAPI.metroSite.getDepartures()

      let td2319 = departures.find(trip => trip.tdn === '2319')
      expect(td2319).to.exist
      expect(dateLikeToISO(td2319.operationalDateMoment)).to.equal('2025-06-09T14:00:00.000Z')
      expect(td2319.operationalDate).to.equal('20250610')

      let td1054Stops = td2319.stops
      expect(td1054Stops[0].stationName).to.equal('Camberwell')
      expect(td1054Stops[0].platform).to.equal('3')
      expect(dateLikeToISO(td1054Stops[0].scheduledDeparture)).to.equal('2025-06-10T00:47:00.000Z')
      expect(td1054Stops[0].estimatedArrival).to.be.null
      expect(dateLikeToISO(td1054Stops[0].estimatedDeparture)).to.equal('2025-06-10T00:47:00.000Z')
    })
  })
})