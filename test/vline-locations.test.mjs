import { expect } from 'chai'
import { StubVLineAPI } from './stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { VLineLocation, VLineLocations } from '../lib/vline/get-locations.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubLocationsResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'locations.xml'))).toString()

describe('The VLineLocations class', () => {
  it('Should provide the data as given in the API response', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubLocationsResponse ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let locations = await ptvAPI.vline.getAllLocations()
    expect(locations).to.be.instanceOf(VLineLocations)
    expect(locations[0]).to.be.instanceOf(VLineLocation)

    expect(locations[0].name).to.equal('Adelaide City 85 Franklin St (SA)')
  })
})

describe('The VLineLocation class', () => {
  let loc1 = new VLineLocation('many   spaces', 'Coach', 'MSP', 0, 0)
  let loc2 = new VLineLocation('many   spaces', 'Coach', 'MSP', 1, 2)

  it('Should trim excess spaces in the name', () => {
    expect(loc1.name).to.equal('many spaces')
  })

  it('Should not accept a position with 0 latitude and longitude', () => {
    expect(loc1.position).to.be.null
  })

  it('Should set the position as a GeoJSON point if the latitude and longitude are valid', () => {
    expect(loc2.position).to.deep.equal({
      type: 'Point',
      coordinates: [2, 1]
    })
  })
})