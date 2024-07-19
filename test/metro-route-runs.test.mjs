import { expect } from 'chai'
import { StubAPI } from './stub-api.mjs'
import PTVAPI from '../lib/ptv-api.mjs'

import stubMDDRunData from './metro-mock-data/mdd-runs.json' assert { type: 'json' }
import { SimplifiedMetroRun } from '../lib/metro/metro-runs.mjs'

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

  it('Should transform the PTV API runs into a SimplifiedMetroRun instances', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubMDDRunData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let runs = await ptvAPI.metro.getRouteRuns(5, {
      expand: ['VehicleDescriptor', 'VehiclePosition'],
      includeForming: true
    })

    let tdn1697 = runs.find(run => run.tdn === '1697')
    expect(tdn1697).to.not.be.undefined
    expect(tdn1697).to.be.instanceof(SimplifiedMetroRun)

    expect(tdn1697.position.properties.bearing).to.equal(186.26073629390189)
    expect(tdn1697.vehicle.motorCars).to.have.members(['217M', '218M', '917M', '918M'])
    expect(tdn1697.vehicle.model).to.equal('Xtrapolis')
  })

  it('Should not include the details of runs from other routes added in through the forming data', async () => {
    let stubAPI = new StubAPI()
    stubAPI.setResponses([ stubMDDRunData ])
    let ptvAPI = new PTVAPI(stubAPI)

    let runs = await ptvAPI.metro.getRouteRuns(5, {
      expand: ['VehicleDescriptor', 'VehiclePosition'],
      includeForming: true
    })

    let tdn3202 = runs.find(run => run.tdn === '3202')
    expect(tdn3202).to.be.undefined
  })
})