import { createHmac } from 'crypto'

export class VLineAPIMethod {

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

  getMethodName() {}

  getMethodURLPath() {}

  getMethodURLHost() {}

  calculateAccessToken() {
    let key = `${this.#callerID}${this.getMethodName()}`
    let signature = createHmac('SHA1', this.#signature).update(key).digest('hex').toString('hex')

    return signature
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

}

export class GetLocations extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETLOCATIONS'
  }

  getMethodURLPath() {
    return '/VLineLocations.svc/web/GetAllLocations'
  }

}

export class GetJourneys extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETNEXTPREVIOUS5JOURNEYS'
  }

  getMethodURLPath() {
    return '/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName={0}&DestinationName={1}&hasPrevious={2}'
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

export class GetLiveDisruptions extends VLineStatusMethod {

  getMethodName() {
    return 'JP_GETLIVEDISRUPTIONS'
  }

  getMethodURLPath() {
    return '/VLineService.svc/web/GetPublishedLiveDisruptions?LineCode={0}'
  }

}

export class GetPlannedDisruptions extends VLineStatusMethod {

  getMethodName() {
    return 'JP_GETPLANNEDDISRUPTIONS'
  }

  getMethodURLPath() {
    return '/VLineService.svc/web/GetPublishedPlannedDisruptions?LineCode={0}&MaximumDays={1}&IncludeProposed={2}'
  }

}