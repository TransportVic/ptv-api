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

describe('The GetLiveDisruptionsDetailsAPI class', () => {
  describe('The getModals function', () => {
    it('Should return a list of modals with suspension details', async () => {
      let stubAPI = new StubVLineAPI()
      stubAPI.setResponses([ stubServiceChangesPage ])
      let method = new GetLiveDisruptionsDetailsAPI()
      await method.fetch(stubAPI)
      expect(method.getDisruptionModals()).to.have.members('3589EasternGippsland')
    })
  })

  it('Should return a list of altered services', async () => {
    let stubAPI = new StubVLineAPI()
    stubAPI.setResponses([ stubServiceChangesPage ])
    let ptvAPI = new PTVAPI(stubAPI)
    ptvAPI.addVLine(stubAPI)

    let disruptions = await ptvAPI.vline.getLiveDisruptionsDetails()
    expect(true).to.be.false
  })
})