import { PTVAPI, PTVAPIError } from '../lib/ptv-api.js'
import { expect } from 'chai'
import nock from 'nock'

describe('The PTV API', () => {
  describe('The appendDevID function', () => {
    it('Should append a ? if no query string is present', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')
      let testURL = '/v3/departures/route_type/0/stop/1081'

      expect(api.appendDevID(testURL)).to.have.string('?devid=')
    })

    it('Should append a & if a query string is already present', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')
      let testURL = '/v3/departures/route_type/0/stop/1081?max_results=5'

      expect(api.appendDevID(testURL)).to.have.string('&devid=')
    })
  })

  describe('The constructURL function', () => {
    it('Should correctly calculate the signature', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')
      let testURLs = [
        [ '/v3/departures/route_type/0/stop/1081', 'a5fd92c5445e7b766d463687c09beda38af6' ],
        [ '/v3/departures/route_type/0/stop/1081?max_results=5', '67d07b4b402a42acdfd96b5d203afb3f8da9' ],
        [ '/v3/departures/route_type/0/stop/1081?max_results=5&expand=All', 'ca3dc7010c7cec225ae0c70835364d788bda' ]
      ]

      for (let url of testURLs) {
        expect(api.constructURL(url[0])).to.have.string(url[1])
      }
    })
  })

  describe('The checkForErrorMessage function', () => {
    it('Should raise a PTVAPIError for server errors', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')

      expect(api.checkForErrorMessage.bind(api, { message: 'An error has occurred.' })).to.throw(/API_SERVER_ERROR/)
      expect(api.checkForErrorMessage.bind(api, { message: 'Forbidden (403): Supplied signature is invalid for request.' })).to.throw(/DEVID_KEY_MISMATCH/)
      expect(api.checkForErrorMessage.bind(api, { message: 'BadRequest (400): devid 1234567 is invalid.' })).to.throw(/DEVID_INVALID/)
      expect(api.checkForErrorMessage.bind(api, { message: 'Forbidden (403): Account for devid 1234567 has been disabled. Developer account permanently removed' })).to.throw(/DEVID_DISABLED/)
      expect(api.checkForErrorMessage.bind(api, { message: 'Unexpected Error!' })).to.throw(/API_UNKNOWN_ERROR/)
    })

    it('Should not raise a PTVAPIError on normal responses', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')

      expect(api.checkForErrorMessage.bind(api, { departures: [] })).not.to.throw(PTVAPIError)
    })
  })

  describe('The checkForAPIStatus function', () => {
    it('Should raise a PTVAPIError for invalid health values', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')

      expect(api.checkForAPIStatus.bind(api, { departures: [], status: { health: 0 } })).to.throw(/API_SERVER_ERROR/)
    })

    it('Should not raise a PTVAPIError on health value 1', () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')

      expect(api.checkForAPIStatus.bind(api, { departures: [], status: { health: 1 } })).not.to.throw(PTVAPIError)
    })
  })

  describe('The apiCall function', () => {
    let testURL = '/v3/departures/route_type/0/stop/1081'
    let fullURL = '/v3/departures/route_type/0/stop/1081?devid=1234567&signature=679da5fd92c5445e7b766d463687c09beda38af6'

    it('Should return the PTV API response if no errors are found', async () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')

      let sampleReply = { departures: [], status: { health: 1 } }
      nock('https://timetableapi.ptv.vic.gov.au').get(fullURL).reply(200, sampleReply)

      expect(await api.apiCall(testURL)).to.deep.equal(sampleReply)
    })

    it('Should raise a PTVError as necessary', async () => {
      let api = new PTVAPI('1234567', '12345678-1234-1234-1234-123456789ABC')

      nock('https://timetableapi.ptv.vic.gov.au').get(fullURL).reply(200, { departures: [], status: { health: 0 } })
      expect(await api.apiCall(testURL).catch(e => e)).to.be.instanceof(PTVAPIError)

      nock('https://timetableapi.ptv.vic.gov.au').get(fullURL).reply(200, { message: 'An error has occurred.' })
      expect(await api.apiCall(testURL).catch(e => e)).to.be.instanceof(PTVAPIError)
    })
  })
})