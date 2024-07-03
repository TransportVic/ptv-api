import { expect } from 'chai'
import { StubVLineAPI } from './stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { VLineDisruption, VLineDisruptions } from '../lib/vline/get-disruptions.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubPlannedResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'planned-disruptions.xml'))).toString()

describe('The GetPlannedDisruptionsAPI class', () => {
  it('Should provide the data as given in the API response', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubPlannedResponse ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getPlannedDisruptions(VLineDisruptions.BALLARAT)
    expect(disruptions).to.be.instanceOf(VLineDisruptions)
    expect(disruptions[0]).to.be.instanceOf(VLineDisruption)

    expect(disruptions[0].type).to.equal('PLANNED')
    expect(disruptions[0].title).to.equal('Temporary train timetable on the Gippsland Line')
    expect(disruptions[0].startTime.toISOString()).to.equal('2024-06-12T14:00:00.000Z')
    expect(disruptions[0].endTime.toISOString()).to.equal('2024-07-07T14:00:00.000Z')
    expect(disruptions[0].disruptionID).to.equal('1868')
    expect(disruptions[0].link).to.equal('https://www.vline.com.au/Service-Changes/Planned-Disruptions/2024/June/Temporary-train-timetable-on-the-Gippsland-Line')
  })
})