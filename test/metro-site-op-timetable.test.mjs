import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubWILOpData from './metro-site-mock-data/williamstown-op.json' with { type: 'json' }
import stubNoDateData from './metro-site-mock-data/mtp-date-none-op.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'
import { dateLikeToISO } from '../lib/date-utils.mjs'

describe('The MetroSiteOpTimetable class', () => {
  describe('The fetch function', () => {
    it('Should retrieve operational timetable data for a given line', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubWILOpData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let willamstown = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.WILLIAMSTOWN)

      let td6300 = willamstown.find(trip => trip.tdn === '6300')
      expect(td6300).to.exist
      expect(td6300.routeName).to.equal('Williamstown')
      expect(dateLikeToISO(td6300.operationalDateMoment)).to.equal('2025-02-13T13:00:00.000Z')
      expect(td6300.operationalDate).to.equal('20250214')

      let stops = td6300.stops
      expect(stops[0].stationName).to.equal('Williamstown')
      expect(stops[0].platform).to.equal('1')
      expect(dateLikeToISO(stops[0].scheduledDeparture)).to.equal('2025-02-13T17:56:00.000Z')
    })

    it('Should return forming and formed by data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubWILOpData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let willamstown = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.WILLIAMSTOWN)

      let td6304 = willamstown.find(trip => trip.tdn === '6304')
      expect(td6304).to.exist

      expect(td6304.runData.formedBy).to.deep.equal({
        tdn: '6301'
      })
      
      expect(td6304.runData.forming).to.deep.equal({
        tdn: '4317'
      })
    })

    it('Should not request data for notify alert only lines', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.FLEMINGTON_RACECOURSE_NOTIFY)
      expect(opTimetable.length).to.equal(0)

      opTimetable = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.SHOWGROUNDS_NOTIFY)
      expect(opTimetable.length).to.equal(0)
    })

    it('Should not return trips with the date set to None', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubNoDateData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.SUNBURY)
      expect(opTimetable.length).to.equal(1)
      expect(opTimetable[0].tdn).to.equal('6667')
    })

    it('Should set forming data across different lines', async () => {
      let stubAPI = new StubAPI()
      let response1 = [{"timetable_num": "0", "day_type": "0", "to_city": "1", "station": "Williamstown", "time_seconds": "17760", "time_str": "4:56 AM", "is_arrival": "0", "trip_id": "6300", "platform": "1", "forms_trip_id": "X123", "status": "S", "is_opr": true, "date": "2025-02-14"}]
      let response2 = [{"timetable_num": "0", "day_type": "0", "to_city": "1", "station": "Werribee", "time_seconds": "17760", "time_str": "4:56 AM", "is_arrival": "0", "trip_id": "X123", "platform": "1", "forms_trip_id": "4309", "status": "S", "is_opr": true, "date": "2025-02-14"}]
      stubAPI.setResponses([ response1, response2 ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable([ ptvAPI.metroSite.lines.WILLIAMSTOWN, ptvAPI.metroSite.lines.WERRIBEE ])
      expect(opTimetable.length).to.equal(2)
      expect(opTimetable[0].tdn).to.equal('6300')
      expect(opTimetable[0].runData.forming).to.deep.equal({ tdn: 'X123' })
      expect(opTimetable[0].runData.formedBy).to.be.null

      expect(opTimetable[1].tdn).to.equal('X123')
      expect(opTimetable[1].runData.forming).to.deep.equal({ tdn: '4309' })
      expect(opTimetable[1].runData.formedBy).to.deep.equal({ tdn: '6300' })
    })
  })
})