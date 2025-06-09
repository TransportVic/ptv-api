import { createHmac } from 'crypto'
import fetch from 'node-fetch'

export class PTVAPIError extends Error {

  code

  constructor(message, code) {
    super(`[${code}] ${message}`)
    this.code = code
  }

}

export class PTVAPIInterface {

  #devID
  #key

  /**
   * Constructs a new PTVAPIInterface. This class does the actual communicatication with the PTV API.
   * 
   * @param {string} devID The DevID associated with the PTV API account
   * @param {string} key The key associated with the PTV API account
   */
  constructor(devID, key) {
    this.#devID = devID
    this.#key = key
  }

  /**
   * Appends the DevID to a URL when requesting API data
   * 
   * @param {string} pathname The pathname of a URL
   * @returns {string} The pathname with the DevID appended
   */
  appendDevID(pathname) {
    return pathname + (pathname.includes('?') ? '&' : '?') + 'devid=' + this.#devID
  }

  /**
   * Constructs a full PTV API URL, with the DevID and signature included
   * 
   * @param {string} pathname The pathanme of a URL in the PTV API
   * @returns {string} An absolute URL pointing to a PTV API resource
   */
  constructURL(pathname) {
    let pathWithDevID = this.appendDevID(pathname)
    let signature = createHmac('SHA1', this.#key).update(pathWithDevID).digest('hex').toString('hex')
    return `https://timetableapi.ptv.vic.gov.au${pathWithDevID}&signature=${signature}`
  }

  /**
   * Checks for error messages in the PTV API response
   * 
   * @param {dictionary} responseData The PTV API response
   * @throws {PTVAPIError} If an error is found. The error object will contain a short description of the error.
   */
  checkForErrorMessage(responseData) {
    let message = responseData.Message || responseData.message
    if (message) {
      if (message === 'An error has occurred.') throw new PTVAPIError('PTV API Server Error', 'API_SERVER_ERROR')
      else if (message.includes('signature is invalid')) throw new PTVAPIError('Signature Invalid', 'DEVID_KEY_MISMATCH')
      else if (message.includes('is invalid')) throw new PTVAPIError('Dev ID Invalid', 'DEVID_INVALID')
      else if (message.includes('has been disabled')) throw new PTVAPIError('Dev ID Disabled', 'DEVID_DISABLED')
      else if (message.includes('stop_id') && message.includes('gtfs')) throw new PTVAPIError('Invalid GTFS Stop ID', 'INVALID_STOP')
      else throw new PTVAPIError('Unknown PTV API Error ' + message, 'API_UNKNOWN_ERROR')
    }
  }

  /**
   * Checks if the PTV API has a good health status
   * 
   * @param {dictionary} responseData The PTV API response
   * @throws {PTVAPIError} If the PTV API indicates that the server is not healthy
   */
  checkForAPIStatus(responseData) {
    if (responseData.status && responseData.status.health !== 1) throw new PTVAPIError('PTV API Server Error', 'API_SERVER_ERROR')
  }

  /**
   * Performs a PTV API call
   * @param {string} path The pathname of the API call being made
   * @param {dictionary} requestOptions Request options passed to the `fetch` library
   * @returns {dictionary} The PTV API response
   * 
   * @throws {PTVAPIError} If the PTV API returned an error
   */
  async apiCall(path, requestOptions={}) {
    let fullURL = this.constructURL(path)
    let body = await (await fetch(fullURL, requestOptions)).text()
console.log(fullURL)
    let responseData
    try {
      responseData = JSON.parse(body)
    } catch (e) {
      throw new PTVAPIError('Error parsing API Response - Malformed JSON', 'API_BAD_RESPONSE')
    }

    this.checkForErrorMessage(responseData)
    this.checkForAPIStatus(responseData)

    return responseData
  }
}
