import { PTVAPIInterface } from '../ptv-api-interface.mjs'
import generateQueryString from './query-strings.mjs'

export default class TransitRuns extends Array {
  
  #responseData
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

  // generateQueryString(parameters) {
  //   return generateQueryString(parameters)
  // }

  async fetch(parameters) {
    
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