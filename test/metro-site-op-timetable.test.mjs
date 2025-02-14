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
      let ptvAPI = new PTVAPI(stubAPI)

      let willamstown = ptvAPI.metroSite.getOperationalTimetable(ptvAPI.metroSite.lines.WILLIAMSTOWN)

      let td6300 = willamstown.find(trip => trip.runID = '6300')
      expect(td6300).to.exist
    })
  })
})