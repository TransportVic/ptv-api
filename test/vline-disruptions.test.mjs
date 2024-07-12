import { expect } from 'chai'
import { StubVLineAPI } from './stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetLiveDisruptionsAPI, GetPlannedDisruptionsAPI, VLineDisruption, VLineDisruptions } from '../lib/vline/get-disruptions.mjs'
import { VLineStatusMethod } from '../lib/vline/api-methods.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubPlannedResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'planned-disruptions.xml'))).toString()
const stubLiveResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'live-disruptions.xml'))).toString()

describe('The GetPlannedDisruptionsAPI class', () => {
  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the given inputs', () => {
      let disruptions = new GetPlannedDisruptionsAPI('ZZZ', 99, false)
      expect(disruptions.getMethodURLPath()).to.equal('/VLineService.svc/web/GetPublishedPlannedDisruptions?LineCode=ZZZ&MaximumDays=99&IncludeProposed=false')
    })
  })

  it('Should provide the data as given in the API response', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubPlannedResponse ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getPlannedDisruptions(VLineDisruptions.BALLARAT)

    expect(stubAPI.getCalls()[0].path).to.equal('https://api-servicestatus.vline.com.au/Service/VLineService.svc/web/GetPublishedPlannedDisruptions?LineCode=BAL&MaximumDays=14&IncludeProposed=true')

    expect(disruptions).to.be.instanceOf(VLineDisruptions)
    expect(disruptions[0]).to.be.instanceOf(VLineDisruption)

    expect(disruptions[0].type).to.equal('PLANNED')
    expect(disruptions[0].title).to.equal('Temporary train timetable on the Gippsland Line')
    expect(disruptions[0].startTime.toUTC().toISO()).to.equal('2024-06-12T14:00:00.000Z')
    expect(disruptions[0].endTime.toUTC().toISO()).to.equal('2024-07-07T14:00:00.000Z')
    expect(disruptions[0].disruptionID).to.equal('1868')
    expect(disruptions[0].link).to.equal('https://www.vline.com.au/Service-Changes/Planned-Disruptions/2024/June/Temporary-train-timetable-on-the-Gippsland-Line')
  })
})

describe('The GetLiveDisruptionsAPI class', () => {
  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the line', () => {
      let disruptions = new GetLiveDisruptionsAPI('LOL')

    expect(disruptions.getMethodURLPath()).to.equal('/VLineService.svc/web/GetPublishedLiveDisruptions?LineCode=LOL')
    })
  })

  it('Should provide the data as given in the API response', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubLiveResponse ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getLiveDisruptions(VLineDisruptions.SEYMOUR)

    expect(stubAPI.getCalls()[0].path).to.equal('https://api-servicestatus.vline.com.au/Service/VLineService.svc/web/GetPublishedLiveDisruptions?LineCode=SEY')

    expect(disruptions).to.be.instanceOf(VLineDisruptions)
    expect(disruptions[0]).to.be.instanceOf(VLineDisruption)

    expect(disruptions[0].type).to.equal('LIVE')
    expect(disruptions[0].title).to.equal('Cafe Bar Closure - Swan Hill Service')
    expect(disruptions[0].details).to.equal('The 07:39 Southern Cross - Swan Hill service will operate without Cafe Bar facilities today. Please consider purchasing your food/beverage prior to departure.')
  })
})

describe('The VLineStatusMethod class', () => {
  describe('The replaceEntities method', () => {
    it('Should replace HTML entities with their proper characters', () => {
      let input = '&lt;p&gt;&lt;a href="https://www.vline.com.au"&gt;Click here.&lt;/a&gt;&lt;/p&gt;'
      let output = '<p><a href="https://www.vline.com.au">Click here.</a></p>'

      expect(VLineStatusMethod.replaceEntities(input)).to.equal(output)
    })
  })

  describe('The stripHTML method', () => {
    it('Should replace HTML with just the rendered text', () => {
      let input = '<p><a href="https://www.vline.com.au">Click here.</a></p>'
      let output = 'Click here.'

      expect(VLineStatusMethod.stripHTML(input)).to.equal(output)
    })
  })

  describe('The sanitise method', () => {
    it('Should replace the HTML entities then sanitise the response', () => {
      let input = '&lt;p&gt;&lt;a href="https://www.vline.com.au"&gt;Click here.&lt;/a&gt;&lt;/p&gt;'
      let output = 'Click here.'

      expect(VLineStatusMethod.sanitise(input)).to.equal(output)
    })
  })
})