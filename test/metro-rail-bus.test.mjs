import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubRRBData from './metro-site-mock-data/railbus-departures.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'
import { dateLikeToISO } from '../lib/date-utils.mjs'

describe('The MTM Rail Bus data', () => {
  it('Should group departures together into a trip', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubRRBData ])
    stubAPI.skipErrors()

    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addMetroSite(stubAPI)

    let trips = await ptvAPI.metroSite.getRailBusUpdates()
    expect(trips[0].tripID).to.equal('Mon - Tue_qo16765')
    expect(trips[0].vehiclePosition).to.deep.equal({
      type: 'Point',
      coordinates: [
        145.05781999999999, -37.88590000000000
      ]
    })
    expect(trips[0].stopTimings[0].stopGTFSID).to.equal('RAIL_CNE_Down')
    expect(dateLikeToISO(trips[0].stopTimings[0].estimatedArrivalTime)).to.equal('2025-07-08T06:07:24.000Z')
  })
})