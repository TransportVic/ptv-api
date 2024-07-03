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

export class GetJourneyStops extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETJOURNEYSTOPS'
  }

  getMethodURLPath() {
    return '/VLineServices.svc/web/GetJourneyStops?LocationName={0}&DestinationName={1}&originDepartureTime={2}&originServiceIdentifier={3}'
  }

}

export class GetPlatformDepartures extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETPLATFORMDEPARTURES'
  }

  getMethodURLPath() {
    return '/VLinePlatformServices.svc/web/GetPlatformDepartures?LocationName={0}&Direction={1}&minutes={2}'
  }

}

export class GetPlatformArrivals extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETPLATFORMARRIVALS'
  }

  getMethodURLPath() {
    return '/VLinePlatformServices.svc/web/GetPlatformArrivals?LocationName={0}&Direction={1}&minutes={2}'
  }

}