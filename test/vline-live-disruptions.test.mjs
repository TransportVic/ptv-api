import { expect } from 'chai'
import { StubVLineAPI } from '../stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetLiveDisruptionsDetailsAPI } from '../lib/vline/get-live-disruptions.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubServiceChangesPage = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'service-changes-page.html'))).toString()
const stubSeymourServiceChangesPage = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'service-changes-page-seymour.html'))).toString()
const stubServiceChangesPage_ul_li = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'service-changes-page-ul_li.html'))).toString()

describe('The GetLiveDisruptionsDetailsAPI class', () => {
  describe('The getModals function', () => {
    it('Should return a list of modals with suspension details', async () => {
      let stubAPI = new StubVLineAPI()
      stubAPI.setResponses([ stubServiceChangesPage ])
      let method = new GetLiveDisruptionsDetailsAPI()
      await method.fetch(stubAPI)
      expect(method.getDisruptionModals()).to.have.members(['#3589EasternGippsland'])
    })
  })

  describe('The getDisruptionModalContent function', () => {
    it('Should return the disruption data within each modal', async () => {
      let stubAPI = new StubVLineAPI()
      stubAPI.setResponses([ stubServiceChangesPage ])
      let method = new GetLiveDisruptionsDetailsAPI()
      await method.fetch(stubAPI)
      let modal = method.getDisruptionModalContent()[0]
      expect(modal).to.include('16/06/2025 - Eastern Line Suspension')
      expect(modal).to.include('Line suspension - Gippsland line')
      expect(modal).to.include('The 12:54 Bairnsdale - Southern Cross service will terminate at East Pakenham and no longer run to Southern Cross.')
      expect(modal).to.include('The 15:21 Traralgon - Southern Cross service will not run today.')
    })
  })

  it('Should return a list of altered services', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubServiceChangesPage ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getLiveDisruptionsDetails()
    expect(disruptions.getAlteredServices()).to.have.members([
      'The 12:54 Bairnsdale - Southern Cross service will terminate at East Pakenham and no longer run to Southern Cross.',
      'The 15:21 Traralgon - Southern Cross service will not run today.'
    ])
  })

  it('Should read through unordered lists', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubServiceChangesPage_ul_li ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getLiveDisruptionsDetails()
    expect(disruptions.getAlteredServices()).to.have.members([
      'The 12:54 Bairnsdale - Southern Cross service will terminate at East Pakenham and no longer run to Southern Cross.',
      'The 15:21 Traralgon - Southern Cross service will not run today.'
    ])
  })

  it('Should work on Seymour data', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubSeymourServiceChangesPage ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getLiveDisruptionsDetails()
    expect(disruptions.getAlteredServices()).to.have.members([
      'The 14:36 Southern Cross - Seymour service terminated at Craigieburn.',
      'The 15:33 Southern Cross - Seymour service will now run through to Seymour.',
      'The 12:51 Albury - Southern Cross service will run through to Southern Cross.',
      'The 16:00 Shepparton - Southern Cross service will run thorugh to Southern Cross.',
      'The 15:45 Seymour - Southern Cross service will not run today. Passengers are to board replacement coaches.'
    ])
  })
})