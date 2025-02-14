import fetch from 'node-fetch'

export class MetroSiteAPIError extends Error {

  code

  constructor(message, code) {
    super(`[${code}] ${message}`)
    this.code = code
  }

}

export class MetroSiteAPIInterface {

  /**
   * Constructs a new MetroSiteAPIInterface. This class communicates with the Metro Website API.
   * 
   */
  constructor() {
  }

  /**
   * Constructs a full PTV API URL, with the DevID and signature included
   * 
   * @param {string} pathname The pathanme of a URL in the PTV API
   * @returns {string} An absolute URL pointing to a PTV API resource
   */
  constructURL(pathname) {
    return `https://747813379903-static-assets-production.s3-ap-southeast-2.amazonaws.com${pathname}`
  }

  /**
   * Performs a Metro Website API call
   * @param {string} path The pathname of the API call being made
   * @param {object} requestOptions Request options passed to the `fetch` library
   * @returns {object} The Metro Website API response
   * 
   * @throws {MetroSiteAPIError} If the Metro Website API returned an error
   */
  async apiCall(path, requestOptions={}) {
    let fullURL = this.constructURL(path)
    let body = await (await fetch(fullURL, requestOptions)).text()

    let responseData
    try {
      responseData = JSON.parse(body)
    } catch (e) {
      throw new MetroSiteAPIError('Error parsing API Response - Malformed JSON', 'API_BAD_RESPONSE')
    }

    return responseData
  }
}