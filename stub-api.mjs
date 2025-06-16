import { PTVAPIInterface } from './lib/ptv-api-interface.mjs'
import { VLineAPIInterface } from './lib/vline-api-interface.mjs'
import { VLineJPMethod } from './lib/vline/api-methods.mjs'

export class StubAPI extends PTVAPIInterface {

  responses = []
  calls = []
  #skipErrors = false

  constructor() {
    super('', '')
  }

  setResponses(responses) {
    this.responses = responses
  }

  getCalls() {
    return this.calls
  }

  skipErrors() {
    this.#skipErrors = true
  }

  async apiCall(path, requestOptions={}) {
    this.calls.push({path, requestOptions})
    let responseData = this.responses.shift()

    if (this.#skipErrors) return responseData

    this.checkForErrorMessage(responseData)
    this.checkForAPIStatus(responseData)

    return responseData
  }
}

export class SampleVLineMethod extends VLineJPMethod {

  #urlPath = '/vline/test/method'

  constructor() {
    super()
  }

  setMethodURLPath(urlPath) {
    this.#urlPath = urlPath
  }

  getMethodName() {
    return 'TEST_METHOD'
  }

  getMethodURLPath() {
    return this.#urlPath
  }

  getMethodURLHost() {
    return 'https://example.vline.com'
  }

}

export class StubVLineAPI extends VLineAPIInterface {

  responses = []
  calls = []

  constructor() {
    super('123', 'ABC')
  }

  setResponses(responses) {
    this.responses = responses
  }

  getCalls() {
    return this.calls
  }

  async performFetch(apiMethod, requestOptions) {    
    let fullURL = this.constructURL(apiMethod)
    this.calls.push({path: fullURL, requestOptions})
    let responseData = this.responses.shift()

    return responseData.replace(/(<\/?)a:/g, '$1V')
  }

  async performWebsiteFetch(url, requestOptions) {    
    let fullURL = this.VLINE_WEBSITE + url
    this.calls.push({path: fullURL, requestOptions})
    let responseData = this.responses.shift()

    return responseData
  }
}