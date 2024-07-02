import fetch from 'node-fetch'

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
    return pathname + (pathname.includes('?') ? '&' : '?') + `AccessToken=${accessToken}`
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
   * @param {dictionary} responseData The V/Line API response
   * @throws {VLineAPIError} If an error is found. The error object will contain a short description of the error.
   */
  checkForErrorMessage(responseData) {
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
    let fullURL = this.constructURL(apiMethod)
    let body = await (await fetch(fullURL, requestOptions)).text()

    // let responseData
    // try {
    //   responseData = JSON.parse(body)
    // } catch (e) {
    //   throw new VLineAPIError('Error parsing API Response - Malformed JSON', 'API_BAD_RESPONSE')
    // }

    // this.checkForErrorMessage(responseData)

    return responseData
  }
}
