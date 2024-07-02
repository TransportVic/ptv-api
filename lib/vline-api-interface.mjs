import fetch from 'node-fetch'
import { load as parseXML } from 'cheerio'

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
   * Constructs a full PTV API URL, with the DevID and signature included
   * 
   * @param {VLineAPIMethod} apiMethod A V/Line API Method
   * @returns {string} An absolute URL pointing to a V/Line API resource
   */
  constructURL(apiMethod) {
    let accessToken = apiMethod.calculateAccessToken(this.#callerID, this.#signature)
    let pathname = apiMethod.getMethodURLPath()
    let pathWithAuth = this.appendAuthData(pathname, accessToken)
    
    return `${apiMethod.getMethodURLHost()}${pathWithAuth}`
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

  async performFetch(apiMethod, requestOptions) {
    let fullURL = this.constructURL(apiMethod)
    let textResponse = await (await fetch(fullURL, requestOptions)).text()
    return textResponse.replace(/(<\/?)a:/g, '$1')
  }

  /**
   * Performs a V/Line API call
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
}
