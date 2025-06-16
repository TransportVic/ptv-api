import fetch from 'node-fetch'
import { load as parseXML } from 'cheerio'
import { VLineAPIMethod, VLineJPMethod } from './vline/api-methods.mjs'

export class VLineAPIError extends Error {

  code

  constructor(message, code) {
    super(`[${code}] ${message}`)
    this.code = code
  }

}

export class VLineAPIInterface {

  #callerID
  #signature

  VLINE_WEBSITE = 'https://vline.com.au'

  /**
   * Constructs a new VLineAPIInterface. This class communicates with the V/Line API.
   * 
   * @param {string} callerID The V/Line Application Caller ID
   * @param {string} signature The V/Line Application Signature
   */
  constructor(callerID, signature) {
    this.#callerID = callerID
    this.#signature = signature
  }

  /**
   * Appends the access token to a URL when requesting API data
   * 
   * @param {string} pathname The pathname of a URL
   * @param {string} accessToken The access token
   * @returns {string} The pathname with the auth data appended
   */
  appendAuthData(pathname, accessToken) {
    return pathname + (pathname.includes('?') ? '&' : '?') + `CallerID=${this.#callerID}&AccessToken=${accessToken}`
  }

  /**
   * Constructs a V/Line API URL for API Methods that require authentication.
   * 
   * @param {VLineAPIMethod} apiMethod The V/Line API Method
   * @returns {string} The constructed URL
   */
  constructURLWithAuth(apiMethod) {
    let accessToken = apiMethod.calculateAccessToken(this.#callerID, this.#signature)
    let pathname = apiMethod.getMethodURLPath()
    let pathWithAuth = this.appendAuthData(pathname, accessToken)
    
    return `${apiMethod.getMethodURLHost()}${pathWithAuth}`
  }

  /**
   * Constructs a V/Line API URL for API Methods that do not require authentication.
   * 
   * @param {VLineAPIMethod} apiMethod The V/Line API Method
   * @returns {string} The constructed URL
   */
  constructURLWithoutAuth(apiMethod) {
    let pathname = apiMethod.getMethodURLPath()
    return `${apiMethod.getMethodURLHost()}${pathname}`
  }

  /**
   * Constructs a full PTV API URL, with the DevID and signature included
   * 
   * @param {VLineAPIMethod} apiMethod A V/Line API Method
   * @returns {string} An absolute URL pointing to a V/Line API resource
   */
  constructURL(apiMethod) {
    if (apiMethod instanceof VLineJPMethod) return this.constructURLWithAuth(apiMethod)
    return this.constructURLWithoutAuth(apiMethod)
  }

  /**
   * Checks for error messages in the V/Line API response
   * 
   * @param {CheerIODom} $ The V/Line API response
   * @throws {VLineAPIError} If an error is found. The error object will contain a short description of the error.
   */
  checkForErrorMessage($) {
    let fault = $('Fault')
    if (fault.length) {
      let reason = $('Reason').text()
      if (reason.includes('VLineWebServices_AuthorisedCallers')) throw new VLineAPIError('Invalid Caller ID', 'CALLERID_INVALID')
      else if (reason.includes('Guid should contain 32 digits with 4 dashes')) throw new VLineAPIError('Invalid Caller ID', 'CALLERID_INVALID')
      else if (reason.includes('AuthorisationException')) throw new VLineAPIError('Invalid signature', 'SIGNATURE_INVALID')
    }
  }

  /**
   * Fetches data from a V/Line API method.
   * 
   * @param {VLineAPIMethod} apiMethod The API Method to fetch data for
   * @param {dictionary} requestOptions The fetch request options
   * @returns {string} The V/Line API XML data, with the a: tag prefix removed
   */
  async performFetch(apiMethod, requestOptions) {
    let fullURL = this.constructURL(apiMethod)
    let textResponse = await (await fetch(fullURL, requestOptions)).text()
    return textResponse.replace(/(<\/?)a:/g, '$1V')
  }

  /**
   * Fetches data from a V/Line Website page.
   * 
   * @param {string} url The webpage URL
   * @param {dictionary} requestOptions The fetch request options
   * @returns {string} The V/Line Website HTML data
   */
  async performWebsiteFetch(url, requestOptions) {
    let fullURL = this.VLINE_WEBSITE + url
    let textResponse = await (await fetch(fullURL, requestOptions)).text()
    return textResponse
  }

  /**
   * Performs a V/Line API call
   * 
   * @param {VLineAPIMethod} apiMethod The V/Line API Method
   * @param {dictionary} requestOptions Request options passed to the `fetch` library
   * @returns {dictionary} The V/Line API response
   * 
   * @throws {VLineAPIError} If the V/Line API returned an error
   */
  async apiCall(apiMethod, requestOptions={}) {
    let body = await this.performFetch(apiMethod, requestOptions)

    let responseData
    try {
      responseData = parseXML(body)
    } catch (e) {
      throw new VLineAPIError('Error parsing API Response - Malformed XML', 'API_BAD_RESPONSE')
    }

    this.checkForErrorMessage(responseData)

    return responseData
  }

  /**
   * Fetches a page from the V/Line Website
   * 
   * @param {string} url The page's URL
   * @param {object} requestOptions Request options passed to the `fetch` library
   * @returns {Cheerio} The webpage parsed as a Cheerio object
   * 
   * @throws {VLineAPIError} If the V/Line Website returned an error
   */
  async getWebsiteData(url, requestOptions={}) {
    let body = await this.performWebsiteFetch(this.VLINE_WEBSITE + url, requestOptions)

    let responseData
    try {
      responseData = parseXML(body)
    } catch (e) {
      throw new VLineAPIError('Error parsing API Response - Malformed HTML', 'API_BAD_RESPONSE')
    }

    return responseData
  }
}
