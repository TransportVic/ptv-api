import { createHmac } from 'crypto'
import { load as parseXML } from 'cheerio'

export class VLineAPIMethod {

  constructor() {
  }

  getMethodName() {}

  getMethodURLPath() {}

  getMethodURLHost() {}

  calculateAccessToken(callerID, signature) {
    let key = `${callerID}${this.getMethodName()}`
    let accessToken = createHmac('SHA1', signature).update(key).digest('hex').toString('hex')

    return accessToken
  }

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

  static replaceEntities(html) {
    let $ = parseXML(`<strip-entities>${html}</strip-entities>`)
    return $('strip-entities').text()
  }

  static stripHTML(html) {
    let $ = parseXML(`<strip-html>${html}</strip-html>`)
    return $('strip-html').text()
  }

  static sanitise(html) {
    return this.stripHTML(this.replaceEntities(html))
  }

}