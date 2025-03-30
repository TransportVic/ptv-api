import { expect } from 'chai'
import { StubVLineAPI } from '../stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetJourneysAPI, VLineJourney, VLineJourneys } from '../lib/vline/get-journeys.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubJourneysResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'journeys.xml'))).toString()

describe('The GetJourneysAPI class', () => {
  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the given inputs', () => {
      let disruptions = new GetJourneysAPI('Hamilton Supermarket', 'Hamilton', true)
      expect(disruptions.getMethodURLPath()).to.equal('/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName=Hamilton Supermarket&DestinationName=Hamilton&hasPrevious=true')

      let disruptions2 = new GetJourneysAPI('Seymour Station', 'Kilmore East Station')
      expect(disruptions2.getMethodURLPath()).to.equal('/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName=Seymour Station&DestinationName=Kilmore East Station&hasPrevious=false')
    })
  })

  it('Should provide the data as given in the API response', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubJourneysResponse ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let journeys = await ptvAPI.vline.getJourneys('Melbourne: Southern Cross', 'Lang Lang')

    expect(stubAPI.getCalls()[0].path).to.equal('https://api-jp.vline.com.au/Service/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName=Melbourne: Southern Cross&DestinationName=Lang Lang&hasPrevious=false&CallerID=123&AccessToken=e096a2f997873d0d391b533883d0f98efc3af5f2')

    expect(journeys).to.be.instanceOf(VLineJourneys)

    let journey = journeys[0]

    expect(journey).to.be.instanceOf(VLineJourney)

    expect(journey.legs.length).to.equal(3)

    expect(journey.legs[0].origin).to.equal('Melbourne, Southern Cross')
    expect(journey.legs[0].destination).to.equal('Dandenong Station')
    expect(journey.legs[0].runID).to.equal('4603')
    expect(journey.legs[0].serviceType).to.equal('Metro')
    expect(journey.legs[0].duration).to.equal(52)
    expect(journey.legs[0].waitTime).to.equal(0)

    expect(journey.legs[1].origin).to.equal('Dandenong Station')
    expect(journey.legs[1].destination).to.equal('Koo Wee Rup')
    expect(journey.legs[1].runID).to.equal('C491')
    expect(journey.legs[1].serviceType).to.equal('Coach')
    expect(journey.legs[1].duration).to.equal(48)
    expect(journey.legs[1].waitTime).to.equal(6)

    expect(journey.legs[2].origin).to.equal('Koo Wee Rup')
    expect(journey.legs[2].destination).to.equal('Lang Lang')
    expect(journey.legs[2].runID).to.equal('C467')
    expect(journey.legs[2].serviceType).to.equal('Coach')
    expect(journey.legs[2].duration).to.equal(10)
    expect(journey.legs[2].waitTime).to.equal(5)

    expect(journey.duration).to.equal(121)
    expect(journey.totalWaitTime).to.equal(11)
    expect(journey.maxWaitTime).to.equal(6)

  })
})