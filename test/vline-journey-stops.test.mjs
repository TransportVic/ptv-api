import { expect } from 'chai'
import { StubVLineAPI } from './stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetJourneyStopsAPI, VLineTripStop, VLineStoppingPattern } from '../lib/vline/get-journey-stops.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubJourneyStopsResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'journey-stops.xml'))).toString()

describe('The GetJourneyStopsAPI class', () => {
  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the given inputs', () => {
      let journeyStops = new GetJourneyStopsAPI('Melbourne, Southern Cross', 'Traralgon Station: Princes Hwy', '14:23', '8417')
      expect(journeyStops.getMethodURLPath()).to.equal('/VLineServices.svc/web/GetJourneyStops?LocationName=Melbourne, Southern Cross&DestinationName=Traralgon Station: Princes Hwy&originDepartureTime=14:23&originServiceIdentifier=8417')
    })
  })

  it('Should provide the data as given in the API response', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubJourneyStopsResponse ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let journeyStops = await ptvAPI.vline.getJourneyStops('Melbourne: Flinders Street', 'Traralgon Station: Princes Hwy', '07:39', '8403')

    expect(stubAPI.getCalls()[0].path).to.contain('https://api-jp.vline.com.au/Service/VLineServices.svc/web/GetJourneyStops?LocationName=Melbourne: Flinders Street&DestinationName=Traralgon Station: Princes Hwy&originDepartureTime=07:39&originServiceIdentifier=8403')

    expect(journeyStops).to.be.instanceOf(VLineStoppingPattern)
    expect(journeyStops[0]).to.be.instanceOf(VLineTripStop)

    expect(journeyStops[0].location).to.equal('Melbourne: Flinders Street')
    expect(journeyStops[0].departureTime.toUTC().toISO()).to.equal('2024-07-11T21:39:00.000Z')
    expect(journeyStops[2].departureTime.toUTC().toISO()).to.equal('2024-07-11T22:01:00.000Z')
  })
})