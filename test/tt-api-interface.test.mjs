import { TramTrackerAPIError, TramTrackerAPIInterface } from '../lib/tramtracker-api-interface.mjs'
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

      expect(url).to.equal('https://ws2.tramtracker.com.au/tramTRACKERV2/RestService/GetPredictionsCollection/1044/0/false?aid=1234567&tkn=abcdefg&cid=0')
    })
  })

  describe('The checkForErrorMessage function', () => {
    it('Should raise a TramTrackerAPIError for server errors', () => {
      let api = new TramTrackerAPIInterface('1234567', 'abcdefg', '0')

      expect(api.checkForErrorMessage.bind(api, { errorMessage: 'Stop Number must be a valid number.' })).to.throw(/INVALID_STOP/)
      expect(api.checkForErrorMessage.bind(api, { errorMessage: "RouteId must be a valid number." })).to.throw(/INVALID_API_PARAMETER/)
    })

    it('Should not raise a TramTrackerAPIError on normal responses', () => {
      let api = new TramTrackerAPIInterface('1234567', 'abcdefg', '0')

      expect(api.checkForErrorMessage.bind(api, { errorMessage: null })).not.to.throw(TramTrackerAPIError)
    })
  })

  
  describe('The apiCall function', () => {
    let testURL = '/GetPredictionsCollection/1044/0/false'
    let fullURL = '/tramTRACKERV2/RestService/GetPredictionsCollection/1044/0/false?aid=1234567&tkn=abcdefg&cid=0'

    it('Should return the TramTracker API response if no errors are found', async () => {
      let api = new TramTrackerAPIInterface('1234567', 'abcdefg', '0')

      let sampleReply = { errorMessage: null, hasError: false, webMethodCalled: "GetPredictions" }
      nock('https://ws2.tramtracker.com.au').get(fullURL).reply(200, sampleReply)

      expect(await api.apiCall(testURL)).to.deep.equal(sampleReply)
    })

    it('Should raise a TramTrackerAPIError as necessary', async () => {
      let api = new TramTrackerAPIInterface('1234567', 'abcdefg', '0')

      let sampleReply = { errorMessage: 'Stop Number must be a valid number.', hasError: true, webMethodCalled: "GetPredictions" }
      nock('https://ws2.tramtracker.com.au').get(fullURL).reply(200, sampleReply)
      expect(await api.apiCall(testURL).catch(e => e)).to.be.instanceof(TramTrackerAPIError)

      nock('https://ws2.tramtracker.com.au').get(fullURL).reply(500, 'The page cannot be displayed because an internal server error has occurred.')
      expect(await api.apiCall(testURL).catch(e => e)).to.be.instanceof(TramTrackerAPIError)
    })
  })
})