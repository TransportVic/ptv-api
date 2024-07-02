import { expect } from 'chai'
import nock from 'nock'
import { VLineAPIMethod } from '../lib/vline/api-methods.mjs'
import { SampleVLineMethod } from './stub-api.mjs'

describe('The V/Line API Method class', () => {
  it('Should calculate the HMAC based on the method name and authentication details', () => {
    let method = new SampleVLineMethod()

    let accessToken = method.calculateAccessToken()

    expect(accessToken).to.equal('8fb9939a362d1b0b4cdef85ce1d2f2eaffb8790a')
  })
})