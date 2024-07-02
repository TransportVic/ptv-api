import { expect } from 'chai'
import { SampleVLineMethod } from './stub-api.mjs'
import { VLineAPIInterface } from '../lib/vline-api-interface.mjs'

describe('The V/Line API Interface', () => {

  describe('The appendAuthData function', () => {
    let apiInterface = new VLineAPIInterface()

    it('Should append a ? if no query string is present', () => {
      expect(apiInterface.appendAuthData('/test', '123')).to.have.string('?AccessToken=123')
    })

    it('Should append a & if a query string is already present', () => {
      expect(apiInterface.appendAuthData('/test?station=Melbourne', '123')).to.have.string('&AccessToken=123')
    })
  })

  describe('The constructURL function', () => {

  })
})