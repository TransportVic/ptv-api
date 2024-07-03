import { expect } from 'chai'
import { SampleVLineMethod } from './stub-api.mjs'
import { VLineAPIError, VLineAPIInterface } from '../lib/vline-api-interface.mjs'
import nock from 'nock'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { GetLiveDisruptions } from '../lib/vline/api-methods.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const unauthorisedResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'error-unauthorised.xml'))).toString()
const locationsResponse = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'locations.xml'))).toString()

describe('The V/Line API Interface', () => {
  let apiInterface = new VLineAPIInterface('ABC-DEF', '123-456')

  describe('The appendAuthData function', () => {
    it('Should append a ? if no query string is present', () => {
      expect(apiInterface.appendAuthData('/test', '123')).to.have.string('?CallerID=ABC-DEF&AccessToken=123')
    })

    it('Should append a & if a query string is already present', () => {
      expect(apiInterface.appendAuthData('/test?station=Melbourne', '123')).to.have.string('&CallerID=ABC-DEF&AccessToken=123')
    })
  })

  describe('The constructURLWithAuth function', () => {
    it('Should correctly construct the full url with the signature on a method without a query string', () => {
      let method = new SampleVLineMethod()
      let url = apiInterface.constructURLWithAuth(method)

      expect(url).to.equal('https://example.vline.com/vline/test/method?CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154')
    })

    it('Should correctly construct the full url with the signature on a method with a query string', () => {
      let method = new SampleVLineMethod()
      method.setMethodURLPath('/departures?station=Caulfield')
      let url = apiInterface.constructURLWithAuth(method)

      expect(url).to.equal('https://example.vline.com/departures?station=Caulfield&CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154')
    })
  })


  describe('The constructURLWithoutAuth function', () => {
    it('Should correctly construct the full url without any authentication data', () => {
      let method = new SampleVLineMethod()
      let url = apiInterface.constructURLWithoutAuth(method)

      expect(url).to.equal('https://example.vline.com/vline/test/method')
    })
  })

  describe('The constructURL function', () => {
    it('Should add authentication data for a Journey Planner API Method', () => {
      let method = new SampleVLineMethod()
      let url = apiInterface.constructURL(method)

      expect(url).to.equal('https://example.vline.com/vline/test/method?CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154')
    })

    it('Should not add authentication data for a Servce Status API Method', () => {
      let method = new GetLiveDisruptions()
      let url = apiInterface.constructURL(method)

      expect(url).to.equal('https://api-servicestatus.vline.com.au/Service/VLineService.svc/web/GetPublishedLiveDisruptions?LineCode={0}')
    })


  })

  describe('The apiCall function', () => {
    it('Should detect when the authorisation keys are invalid and raise an error', async () => {
      let method = new SampleVLineMethod()
      let fullURL = '/vline/test/method?CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154'

      nock('https://example.vline.com').get(fullURL).reply(400, unauthorisedResponse)

      let response = await apiInterface.apiCall(method).catch(e => e)

      expect(response).to.be.instanceof(VLineAPIError)
      expect(response.code).to.equal('CALLERID_INVALID')
    })

    it('Should not raise an authorisation error when the keys are valid', async () => {
      let method = new SampleVLineMethod()
      let fullURL = '/vline/test/method?CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154'

      nock('https://example.vline.com').get(fullURL).reply(200, locationsResponse)

      let response = await apiInterface.apiCall(method).catch(e => e)

      expect(response).to.not.be.instanceof(VLineAPIError)
    })
  })

  describe('The performFetch function', () => {
    it('Should replace a: in the response', async () => {
      let method = new SampleVLineMethod()
      let fullURL = '/vline/test/method?CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154'

      nock('https://example.vline.com').get(fullURL).reply(200, '<a:GPSLongitude>138.595749</a:GPSLongitude>')

      expect(await apiInterface.performFetch(method)).to.equal('<GPSLongitude>138.595749</GPSLongitude>')
    })

    it('Should not replace a: inside a tag', async () => {
      let method = new SampleVLineMethod()
      let fullURL = '/vline/test/method?CallerID=ABC-DEF&AccessToken=795511bba1d555c42d4360a6d7544628e454e154'

      nock('https://example.vline.com').get(fullURL).reply(200, '<a:LocationName>Echuca: Ampol Roadhouse Northern Highway and Rose Street</a:LocationName>')

      expect(await apiInterface.performFetch(method)).to.equal('<LocationName>Echuca: Ampol Roadhouse Northern Highway and Rose Street</LocationName>')
    })
  })
})