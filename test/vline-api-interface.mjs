import { expect } from 'chai'
import { SampleVLineMethod } from './stub-api.mjs'
import { VLineAPIInterface } from '../lib/vline-api-interface.mjs'

describe('The V/Line API Interface', () => {
  let apiInterface = new VLineAPIInterface('ABC-DEF', '123-456')

  describe('The appendAuthData function', () => {
    it('Should append a ? if no query string is present', () => {
      expect(apiInterface.appendAuthData('/test', '123')).to.have.string('?AccessToken=123')
    })

    it('Should append a & if a query string is already present', () => {
      expect(apiInterface.appendAuthData('/test?station=Melbourne', '123')).to.have.string('&AccessToken=123')
    })
  })

  describe('The constructURL function', () => {
    it('Should correctly construct the full url with the signature on a method without a query string', () => {
      let method = new SampleVLineMethod()
      let url = apiInterface.constructURL(method)

      expect(url).to.equal('https://example.vline.com/vline/test/method?AccessToken=795511bba1d555c42d4360a6d7544628e454e154')
    })

    it('Should correctly construct the full url with the signature on a method with a query string', () => {
      let method = new SampleVLineMethod()
      method.setMethodURLPath('/departures?station=Caulfield')
      let url = apiInterface.constructURL(method)

      expect(url).to.equal('https://example.vline.com/departures?station=Caulfield&AccessToken=795511bba1d555c42d4360a6d7544628e454e154')
    })
  })
})