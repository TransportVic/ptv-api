import { expect } from 'chai'
import { StubVLineAPI } from './stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetPlatformServicesAPI } from '../lib/vline/get-platform-services.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubJourneyStopsResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'journey-stops.xml'))).toString()

describe('The GetPlatformServicesAPI class', () => {
  class TestPlatformServices extends GetPlatformServicesAPI {
    getServiceType() { return 'Test' }
  }

  describe('The getMethodName function', () => {
    it('Should return JP_GETPLATFORM<service type> in uppercase', () => {
      let testService = new TestPlatformServices()
      expect(testService.getMethodName()).to.equal('JP_GETPLATFORMTEST')
    })
  })

  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the given inputs, setting the URL according to the service type', () => {
      let journeyStops = new TestPlatformServices('Melbourne, Southern Cross', TestPlatformServices.BOTH, 50)
      expect(journeyStops.getMethodURLPath()).to.equal('/VLinePlatformServices.svc/web/GetPlatformTest?LocationName=Melbourne, Southern Cross&Direction=B&minutes=50')
    })
  })

})