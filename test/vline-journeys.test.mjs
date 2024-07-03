import { expect } from 'chai'
import { StubVLineAPI } from './stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetLiveDisruptionsAPI, GetPlannedDisruptionsAPI, VLineDisruption, VLineDisruptions } from '../lib/vline/get-disruptions.mjs'
import { VLineStatusMethod } from '../lib/vline/api-methods.mjs'
import { GetJourneysAPI } from '../lib/vline/get-journeys.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubLiveResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'live-disruptions.xml'))).toString()

describe('The GetPlannedDisruptionsAPI class', () => {
  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the given inputs', () => {
      let disruptions = new GetJourneysAPI('Hamilton Supermarket', 'Hamilton', true)
      expect(disruptions.getMethodURLPath()).to.equal('/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName=Hamilton Supermarket&DestinationName=Hamilton&hasPrevious=true')

      let disruptions2 = new GetJourneysAPI('Seymour Station', 'Kilmore East Station')
      expect(disruptions2.getMethodURLPath()).to.equal('/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName=Seymour Station&DestinationName=Kilmore East Station&hasPrevious=false')
    })
  })
})