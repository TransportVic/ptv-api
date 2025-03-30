import TransitDepartures from '../lib/types/transit-departures.mjs'
import { expect } from 'chai'
import { StubAPI } from '../stub-api.mjs'
import stubDepartureData from './metro-mock-data/metro-departures.json' with { type: 'json' }

describe('The TransitDepartures class', () => {
  describe('The fetch function', () => {
    it('Should call the PTV API providing the stop ID and specified parameters, automatically expanding Run and Route', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubDepartureData ])
      let departures = new TransitDepartures(stubAPI, 19810)
      await departures.fetchBody(10, {
        gtfs: true,
        expand: ['vehicleposition']
      })

      expect(stubAPI.getCalls()[0]).to.deep.equal({
        path: '/v3/departures/route_type/10/stop/19810?gtfs=true&expand=vehicleposition&expand=stop&expand=run&expand=route&expand=direction',
        requestOptions: {}
      })
    })
  })
})