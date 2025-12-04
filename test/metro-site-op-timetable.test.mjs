import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubWILOpData from './metro-site-mock-data/williamstown-op.json' with { type: 'json' }
import stubNoDateData from './metro-site-mock-data/mtp-date-none-op.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'
import { dateLikeToISO } from '../lib/date-utils.mjs'
import belgraveDSTStart from './metro-site-mock-data/belgrave-dst-start.mjs'
import lilydaleDSTEnd from './metro-site-mock-data/lilydale-dst-end.json' with { type: 'json' }
import mtpTimetableSUY from './metro-site-mock-data/mtp-timetable-suy.mjs'
import mtpTimetablePKM from './metro-site-mock-data/mtp-timetable-pkm.mjs'

const clone = o => JSON.parse(JSON.stringify(o))

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
      let response1 = [
        {"timetable_num": "0", "day_type": "0", "to_city": "1", "station": "Williamstown", "time_seconds": "17760", "time_str": "4:56 AM", "is_arrival": "0", "trip_id": "6300", "platform": "1", "forms_trip_id": "X123", "status": "S", "is_opr": true, "date": "2025-02-14"},
        {"timetable_num": "0", "day_type": "0", "to_city": "1", "station": "Williamstown", "time_seconds": "17760", "time_str": "4:56 AM", "is_arrival": "0", "trip_id": "6300", "platform": "1", "forms_trip_id": "X123", "status": "S", "is_opr": true, "date": "2025-02-15"}
      ]
      let response2 = [
        {"timetable_num": "0", "day_type": "0", "to_city": "1", "station": "Werribee", "time_seconds": "17760", "time_str": "4:56 AM", "is_arrival": "0", "trip_id": "X123", "platform": "1", "forms_trip_id": "4309", "status": "S", "is_opr": true, "date": "2025-02-14"},
        {"timetable_num": "0", "day_type": "0", "to_city": "1", "station": "Werribee", "time_seconds": "17760", "time_str": "4:56 AM", "is_arrival": "0", "trip_id": "X123", "platform": "1", "forms_trip_id": "4309", "status": "S", "is_opr": true, "date": "2025-02-15"}
      ]

      stubAPI.setResponses([ response1, response2 ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable([ ptvAPI.metroSite.lines.WILLIAMSTOWN, ptvAPI.metroSite.lines.WERRIBEE ])
      expect(opTimetable.length).to.equal(4)

      let td6300s = opTimetable.filter(trip => trip.tdn === '6300')
      for (let trip of td6300s) {
        expect(trip.tdn).to.equal('6300')
        expect(trip.runData.forming).to.deep.equal({ tdn: 'X123' })
        expect(trip.runData.formedBy).to.be.null
      }
      
      let tdX123 = opTimetable.filter(trip => trip.tdn === 'X123')
      for (let trip of tdX123) {
        expect(trip.tdn).to.equal('X123')
        expect(trip.runData.forming).to.deep.equal({ tdn: '4309' })
        expect(trip.runData.formedBy).to.deep.equal({ tdn: '6300' })
      }
    })
  })

  describe('MTP handling', () => {
    it('Removes stops before THL on MTP Down Sunbury trips', async () => {
      const stubAPI = new StubAPI()
      stubAPI.setResponses([ mtpTimetableSUY ])
      stubAPI.skipErrors()

      const ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      const willamstown = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.SUNBURY)

      const tdZ625 = willamstown.find(trip => trip.tdn === 'Z625')
      expect(tdZ625).to.exist
      expect(tdZ625.routeName).to.equal('Sunbury')

      const stops = tdZ625.stops
      expect(stops[0].stationName).to.equal('Town Hall')
      expect(stops[0].platform).to.equal('1')
      expect(dateLikeToISO(stops[0].scheduledDeparture)).to.equal('2025-12-04T03:31:00.000Z')

      expect(stops[1].stationName).to.equal('State Library')
      expect(stops[1].platform).to.equal('1')
      expect(dateLikeToISO(stops[1].scheduledDeparture)).to.equal('2025-12-04T03:33:00.000Z')
    })

    it('Removes stops before THL on MTP Down Dandenong trips', async () => {
      const stubAPI = new StubAPI()
      stubAPI.setResponses([ mtpTimetablePKM ])
      stubAPI.skipErrors()

      const ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      const willamstown = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.PAKENHAM)

      const tdC977 = willamstown.find(trip => trip.tdn === 'C977')
      expect(tdC977).to.exist
      expect(tdC977.routeName).to.equal('Pakenham')

      const stops = tdC977.stops
      expect(stops[0].stationName).to.equal('Town Hall')
      expect(stops[0].platform).to.equal('2')
      expect(dateLikeToISO(stops[0].scheduledDeparture)).to.equal('2025-12-04T00:18:00.000Z')

      expect(stops[1].stationName).to.equal('Malvern')
      expect(stops[1].platform).to.equal('4')
      expect(dateLikeToISO(stops[1].scheduledDeparture)).to.equal('2025-12-04T00:29:00.000Z')
    })

    it('Removes stops after THL on MTP Up Sunbury trips', async () => {
      const stubAPI = new StubAPI()
      stubAPI.setResponses([ mtpTimetableSUY ])
      stubAPI.skipErrors()

      const ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      const willamstown = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.SUNBURY)

      const tdZ600 = willamstown.find(trip => trip.tdn === 'Z600')
      expect(tdZ600).to.exist
      expect(tdZ600.routeName).to.equal('Sunbury')

      const stops = tdZ600.stops
      expect(stops[0].stationName).to.equal('West Footscray')
      expect(stops[0].platform).to.equal('2')
      expect(dateLikeToISO(stops[0].scheduledDeparture)).to.equal('2025-12-03T23:01:00.000Z')

      expect(stops[6].stationName).to.equal('Town Hall')
      expect(stops[6].platform).to.equal('2')
      expect(dateLikeToISO(stops[6].scheduledDeparture)).to.equal('2025-12-03T23:18:00.000Z')

      expect(stops[7]).to.not.exist
    })
  })

  describe('DST handling', () => {
    it('Handles the extra 2am on Sunday from Saturday TT trips when DST ends', async () => {
      let stubAPI = new StubAPI()

      stubAPI.setResponses([ lilydaleDSTEnd ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable([ ptvAPI.metroSite.lines.LILYDALE ])

      let td3326 = opTimetable.find(trip => trip.tdn === '3326')

      expect(td3326.stops[0].stationName).to.equal('Lilydale')
      expect(dateLikeToISO(td3326.stops[0].scheduledDeparture)).to.equal('2025-04-05T15:48:00.000Z') // 02:48 (first)

      expect(td3326.stops[2].stationName).to.equal('Croydon')
      expect(dateLikeToISO(td3326.stops[2].scheduledDeparture)).to.equal('2025-04-05T15:57:00.000Z') // 02:58 (first)

      expect(td3326.stops[3].stationName).to.equal('Ringwood East')
      expect(dateLikeToISO(td3326.stops[3].scheduledDeparture)).to.equal('2025-04-05T16:01:00.000Z') // 02:01 (second)

      expect(td3326.stops[4].stationName).to.equal('Ringwood')
      expect(dateLikeToISO(td3326.stops[4].scheduledDeparture)).to.equal('2025-04-05T16:04:00.000Z') // 02:01 (second)

      let td3298 = opTimetable.find(trip => trip.tdn === '3298')

      expect(td3298.stops[0].stationName).to.equal('Lilydale')
      expect(dateLikeToISO(td3298.stops[0].scheduledDeparture)).to.equal('2025-04-05T16:50:00.000Z') // 02:50 (second)

      expect(td3298.stops[2].stationName).to.equal('Croydon')
      expect(dateLikeToISO(td3298.stops[2].scheduledDeparture)).to.equal('2025-04-05T16:59:00.000Z') // 02:59 (second)

      expect(td3298.stops[3].stationName).to.equal('Ringwood East')
      expect(dateLikeToISO(td3298.stops[3].scheduledDeparture)).to.equal('2025-04-05T17:03:00.000Z') // 03:03

      expect(td3298.stops[4].stationName).to.equal('Ringwood')
      expect(dateLikeToISO(td3298.stops[4].scheduledDeparture)).to.equal('2025-04-05T17:06:00.000Z') // 03:06
    })

    it('Handles the extra 2am on Sunday from Sunday TT trips when DST ends', async () => {
      let stubAPI = new StubAPI()

      // 03:50 LIL-FSS on Sunday morning
      const td3292Raw = clone(lilydaleDSTEnd.filter(t => t.trip_id === '3292')).map(s => ({ ...s, date: '2025-04-06' }))

      stubAPI.setResponses([ td3292Raw ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable([ ptvAPI.metroSite.lines.LILYDALE ])

      let td3292 = opTimetable.find(trip => trip.tdn === '3292')

      expect(td3292.stops[0].stationName).to.equal('Lilydale')
      expect(dateLikeToISO(td3292.stops[0].scheduledDeparture)).to.equal('2025-04-05T17:50:00.000Z') // 03:50

      expect(td3292.stops[2].stationName).to.equal('Croydon')
      expect(dateLikeToISO(td3292.stops[2].scheduledDeparture)).to.equal('2025-04-05T17:59:00.000Z') // 03:59

      expect(td3292.stops[3].stationName).to.equal('Ringwood East')
      expect(dateLikeToISO(td3292.stops[3].scheduledDeparture)).to.equal('2025-04-05T18:03:00.000Z') // 04:03

      expect(td3292.stops[4].stationName).to.equal('Ringwood')
      expect(dateLikeToISO(td3292.stops[4].scheduledDeparture)).to.equal('2025-04-05T18:06:00.000Z') // 04:06
    })


    it('Handles the missing 2am on Sunday from Saturday TT trips when DST starts', async () => {
      let stubAPI = new StubAPI()

      stubAPI.setResponses([ belgraveDSTStart ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable([ ptvAPI.metroSite.lines.BELGRAVE ])

      let td3152 = opTimetable.find(trip => trip.tdn === '3152')

      expect(td3152.stops[0].stationName).to.equal('Belgrave')
      expect(dateLikeToISO(td3152.stops[0].scheduledDeparture)).to.equal('2025-10-04T15:36:00.000Z') // 01:36

      expect(td3152.stops[6].stationName).to.equal('Bayswater')
      expect(dateLikeToISO(td3152.stops[6].scheduledDeparture)).to.equal('2025-10-04T15:57:00.000Z') // 01:57

      expect(td3152.stops[7].stationName).to.equal('Heathmont')
      expect(dateLikeToISO(td3152.stops[7].scheduledDeparture)).to.equal('2025-10-04T16:01:00.000Z') // 03:01 (skip 2am)

      expect(td3152.stops[8].stationName).to.equal('Ringwood')
      expect(dateLikeToISO(td3152.stops[8].scheduledDeparture)).to.equal('2025-10-04T16:04:00.000Z') // 03:04
    })

    it('Handles the missing 2am on Sunday from Sunday TT trips when DST starts', async () => {
      let stubAPI = new StubAPI()

      stubAPI.setResponses([ belgraveDSTStart ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let opTimetable = await ptvAPI.metroSite.getOperationalTimetable([ ptvAPI.metroSite.lines.BELGRAVE ])

      let td3154 = opTimetable.find(trip => trip.tdn === '3154')

      expect(td3154.stops[0].stationName).to.equal('Belgrave')
      expect(dateLikeToISO(td3154.stops[0].scheduledDeparture)).to.equal('2025-10-04T16:40:00.000Z') // 03:40

      expect(td3154.stops[6].stationName).to.equal('Bayswater')
      expect(dateLikeToISO(td3154.stops[6].scheduledDeparture)).to.equal('2025-10-04T16:57:00.000Z') // 03:57

      expect(td3154.stops[7].stationName).to.equal('Heathmont')
      expect(dateLikeToISO(td3154.stops[7].scheduledDeparture)).to.equal('2025-10-04T17:01:00.000Z') // 04:01

      expect(td3154.stops[8].stationName).to.equal('Ringwood')
      expect(dateLikeToISO(td3154.stops[8].scheduledDeparture)).to.equal('2025-10-04T17:04:00.000Z') // 04:04
    })
  })
})