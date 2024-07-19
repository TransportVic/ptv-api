import { PTVAPIInterface } from '../ptv-api-interface.mjs'
import generateQueryString from './query-strings.mjs'

export default class TransitRuns extends Array {
  
  #responseData
  #runs
  #api
  #routeID

  /**
   * 
   * @param {PTVAPIInterface} api The PTV API Interface
   * @param {number} routeID The PTV API Route ID
   */
  constructor(api, routeID) {
    super()
    this.#api = api
    this.#routeID = routeID
  }

  async fetch(parameters) {
    let body = await this.fetchBody(parameters)

    this.#runs = body.runs.reduce((acc, run) => {
      acc[run.run_ref] = run
      return acc
    }, {})

    return body
  }

  getRun(runRef) {
    return this.#runs[runRef]
  }

  async fetchBody(parameters) {
    if (!parameters) parameters = {}
    let queryString = generateQueryString(parameters)
    let url = `/v3/runs/route/${this.#routeID}${queryString}`
    let body = await this.#api.apiCall(url)

    this.#responseData = body

    return body
  }
}