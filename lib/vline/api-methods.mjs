import { createHmac } from 'crypto'
import { load as parseXML } from 'cheerio'
import { VLineAPIInterface } from '../vline-api-interface.mjs'

export class VLineAPIMethod {

  constructor() {
  }

  /**
   * Gets the V/Line API Method name
   */
  getMethodName() {}

  /**
   * Gets the V/Line API Method URL Path
   */
  getMethodURLPath() {}

  /**
   * Gets the V/Line API Method URL Host
   */
  getMethodURLHost() {}

  /**
   * Calculates the access token for the API Method
   */
  calculateAccessToken(callerID, signature) {
    let key = `${callerID}${this.getMethodName()}`
    let accessToken = createHmac('SHA1', signature).update(key).digest('hex').toString('hex')

    return accessToken
  }

  /**
   * Fetches data from the API endpoint, constructed from `getMethodURLHost` and `getMethodURLPath`
   * 
   * @param {VLineAPIInterface} apiInterface The V/Line API Interface to use
   * @returns {string} The XML body
   */
  async fetch(apiInterface) {
    return apiInterface.apiCall(this)
  }

}

export class VLineJPMethod extends VLineAPIMethod {

  getMethodURLHost() {
    return 'https://api-jp.vline.com.au/Service'
  }

}

export class VLineStatusMethod extends VLineAPIMethod {

  getMethodURLHost() {
    return 'https://api-servicestatus.vline.com.au/Service'
  }

  /**
   * Replaces XML entities such as &amp; with the proper character (& in this case)
   * 
   * @param {string} html The XML string to clean
   * @returns {string} The XML string with entities removed
   */
  static replaceEntities(html) {
    let $ = parseXML(`<strip-entities>${html}</strip-entities>`)
    return $('strip-entities').text()
  }

  /**
   * Strips HTML tags from a piece of text.
   * 
   * @param {string} html The text to clean
   * @returns {string} The text with HTML tags removed
   */
  static stripHTML(html) {
    let $ = parseXML(`<strip-html>${html}</strip-html>`)
    return $('strip-html').text()
  }

  /**
   * Sanities a piece of text, removing HTML entities and tags
   * 
   * @param {string} html The text to clean
   * @returns {string} The cleaned text
   */
  static sanitise(html) {
    return this.stripHTML(this.replaceEntities(html))
  }

}