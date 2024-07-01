import { TramTrackerAPIInterface } from '../lib/tramtracker-api-interface.mjs'
import { expect } from 'chai'
import nock from 'nock'

describe('The TramTracker API Interface', () => {
  describe('The constructURL function', () => {
    it('Should append the aid and tkn query parameters', () => {
      let api = new TramTrackerAPIInterface('1234567', 'abcdefg', '0')
      let apiEndpoint = '/GetPredictionsCollection/1044/0/false'

      let url = api.constructURL(apiEndpoint)
      expect(url).to.have.string('aid=1234567')
      expect(url).to.have.string('tkn=abcdefg')
      expect(url).to.have.string('cid=0')
    })

    it('Should form the full API url', () => {
      let api = new TramTrackerAPIInterface('1234567', 'abcdefg', '0')
      let apiEndpoint = '/GetPredictionsCollection/1044/0/false'

      let url = api.constructURL(apiEndpoint)

      expect(url).to.equal('https://ws2.tramtracker.com.au/TramTracker/RestService/GetPredictionsCollection/1044/0/false?aid=1234567&tkn=abcdefg&cid=0')
    })
  })
})