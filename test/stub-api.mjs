import { PTVAPIError, PTVAPIInterface } from '../lib/ptv-api-interface.mjs'

export class StubAPI extends PTVAPIInterface {

  responses = []
  calls = []

  constructor() {
    super('', '')
  }

  setResponses(responses) {
    this.responses = responses
  }

  getCalls() {
    return this.calls
  }

  async apiCall(path, requestOptions={}) {
    this.calls.push({path, requestOptions})
    return this.responses.shift()
  }
}
