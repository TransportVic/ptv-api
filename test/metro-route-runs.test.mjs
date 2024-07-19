import { expect } from 'chai'
import { StubAPI } from './stub-api.mjs'
import PTVAPI from '../lib/ptv-api.mjs'

import stubMDDRunData from './metro-mock-data/mdd-runs.json' assert { type: 'json' }

describe('The getRouteRuns function of the MetroInterface', () => {
  it('Should call the PTV API with the appropriate URL', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubMDDRunData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let runs = await ptvAPI.metro.getRouteRuns(5, {
      expand: ['VehicleDescriptor', 'VehiclePosition'],
      includeForming: true
    })

    expect(stubAPI.getCalls()[0].path).to.equal('/v3/runs/route/5?expand=VehicleDescriptor&expand=VehiclePosition&include_advertised_interchange=true')
  })

  it('Should transform the PTV API runs into MetroRun instances', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubMDDRunData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let runs = await ptvAPI.metro.getRouteRuns(5, {
      expand: ['VehicleDescriptor', 'VehiclePosition'],
      includeForming: true
    })

    let tdn1697 = runs.find(run => run.tdn === '1697')
    expect(!tdn1697).to.be.false
  })
})