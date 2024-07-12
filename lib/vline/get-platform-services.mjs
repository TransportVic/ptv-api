import { VLineJPMethod } from './api-methods.mjs'

export class GetPlatformServicesAPI extends VLineJPMethod {

  #location
  #direction
  #minutes

  static UP = 'U'
  static DOWN = 'D'
  static BOTH = 'B'

  constructor(location, direction, minutes) {
    super()
    this.#location = location
    this.#direction = direction
    this.#minutes = minutes
  }

  getServiceType() { throw new Error('Not implemented on abstract class') }

  getMethodName() {
    return `JP_GETPLATFORM${this.getServiceType().toUpperCase()}`
  }

  getMethodURLPath() {
    return `/VLinePlatformServices.svc/web/GetPlatform{0}?LocationName={1}&Direction={2}&minutes={3}`
      .replace('{0}', this.getServiceType())
      .replace('{1}', this.#location)
      .replace('{2}', this.#direction)
      .replace('{3}', this.#minutes)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let serviceData = $('VPlatformService')

    let services = new VLinePlatformServices()
    
    for (let service of serviceData) {
      services.push(VLinePlatformService.fromVLineData($, service))
    }

    return services
  }
}

export class GetPlatformDeparturesAPI extends GetPlatformServicesAPI {

  getServiceType() { return 'Departures' }

}

export class GetPlatformArrivalsAPI extends GetPlatformServicesAPI {

  getServiceType() { return 'Arrivals' }

}

export class VLinePlatformServices extends Array {

}

export class VLinePlatformService {

  static fromVLineData($, service) {

  }

}