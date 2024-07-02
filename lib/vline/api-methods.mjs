import { createHmac } from 'crypto'

export class VLineAPIMethod {

  /**
   * Constructs a new VLineAPIInterface. This class communicates with the V/Line API.
   */
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