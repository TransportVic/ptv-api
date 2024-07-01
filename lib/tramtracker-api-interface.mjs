import fetch from 'node-fetch'

import sslRootCas from 'ssl-root-cas'
import https from 'https'

export class TramTrackerAPIError extends Error {

  code

  constructor(message, code) {
    super(`[${code}] ${message}`)
    this.code = code
  }

}

export class TramTrackerAPIInterface {

  #BAD_RESPONSE = 'The page cannot be displayed because an internal server error has occurred.'
  #query

  /**
   * Constructs a new TramTrackerAPIInterface. This class communicates with the TramTracker API.
   * 
   * @param {string} appID The TramTracker Application ID
   * @param {string} token The TramTracker Application token
   * @param {string} clientID The TramTracker Client ID
   */
  constructor(appID, token, clientID) {
    this.#query = `?aid=${appID}&tkn=${token}&cid=${clientID}`
  }

  addTTIntermediateCert(pathname) {
    let rootCas = sslRootCas.create()
    rootCas.addFile(pathname)
    https.globalAgent.options.ca = rootCas
  }

  /**
   * Constructs a full PTV API URL, with the DevID and signature included
   * 
   * @param {string} pathname The pathanme of a URL in the PTV API
   * @returns {string} An absolute URL pointing to a PTV API resource
   */
  constructURL(pathname) {
    return `https://ws2.tramtracker.com.au/tramTRACKERV2/RestService${pathname}${this.#query}`
  }

  /**
   * Checks for error messages in the TramTracker API response
   * 
   * @param {dictionary} responseData The TramTracker API response
   * @throws {PTVAPIError} If an error is found. The error object will contain a short description of the error.
   */
  checkForErrorMessage(responseData) {
    let message = responseData.errorMessage
    if (message) {
      if (message === 'Stop Number must be a valid number.') throw new TramTrackerAPIError('Invalid TramTracker Stop ID', 'INVALID_STOP')
      else if (message.includes('must be a valid')) throw new TramTrackerAPIError('Invalid API Parameter', 'INVALID_API_PARAMETER')
      else throw new TramTrackerAPIError('Unknown TramTracker API Error ' + message, 'API_UNKNOWN_ERROR')
    }
  }

  /**
   * Performs a TramTracker API call
   * @param {string} path The pathname of the API call being made
   * @param {dictionary} requestOptions Request options passed to the `fetch` library
   * @returns {dictionary} The TramTracker API response
   * 
   * @throws {TramTrackerAPIError} If the TramTracker API returned an error
   */
  async apiCall(path, requestOptions={}) {
    let fullURL = this.constructURL(path)
    let body = await (await fetch(fullURL, requestOptions)).text()

    let responseData
    try {
      responseData = JSON.parse(body)
    } catch (e) {
      if (body === this.#BAD_RESPONSE) {
        throw new TramTrackerAPIError('TramTracker API Server Error', 'API_SERVER_ERROR')
      }

      throw new TramTrackerAPIError('Error parsing API Response - Malformed JSON', 'API_BAD_RESPONSE')
    }

    this.checkForErrorMessage(responseData)

    return responseData
  }
}