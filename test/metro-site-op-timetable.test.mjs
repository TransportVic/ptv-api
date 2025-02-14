import { StubAPI } from './stub-api.mjs'
import { expect } from 'chai'
import stubWILOpData from './metro-site-mock-data/williamstown-op.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'
import { dateLikeToISO, stubDate, unstubDate } from '../lib/date-utils.mjs'

describe('The MetroSiteOpTimetable class', () => {
  describe('The fetch function', () => {
    it('Should retrieve operational timetable data for a given line', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubWILOpData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let willamstown = await ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.WILLIAMSTOWN)

      let td6300 = willamstown.find(trip => trip.tdn = '6300')
      expect(td6300).to.exist

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

      let td6304 = willamstown.find(trip => trip.tdn = '6304')
      expect(td6304).to.exist
      
      expect(td6304.runData.formedBy).to.deep.equal({
        tdn: '6301'
      })
      
      expect(td6304.runData.forming).to.deep.equal({
        tdn: '4317'
      })
    })
  })
})