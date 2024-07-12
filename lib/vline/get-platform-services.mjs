import { parseISOTime } from '../date-utils.mjs'
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

  origin
  destination
  departureTime
  arrivalTime
  tdn
  platform
  direction

  estStationArrivalTime = null
  estArrivalTime = null

  constructor(origin, destination, departureTime, arrivalTime, tdn, platform, direction) {
    this.origin = origin
    this.destination = destination
    this.departureTime = departureTime
    this.arrivalTime = arrivalTime
    this.tdn = tdn
    this.platform = platform
    this.direction = direction
  }

  static getDirection(abbreviated) {
    if (abbreviated === 'D') return 'Down'
    else if (abbreviated === 'U') return 'Up'
    else throw new Error('Invalid direction!')
  }

  #addRealtimeData($, service) {
    let stationArrivalTime = $('VActualArrivalTime', service)
    let actualArrivalTime = $('VActualDestinationArrivalTime', service)
    
    if ((typeof stationArrivalTime.attr('i:nil')) === 'undefined') {
      this.estStationArrivalTime = parseISOTime(stationArrivalTime.text())
      this.estArrivalTime = parseISOTime(actualArrivalTime.text())
    }
  }

  static fromVLineData($, service) {
    let origin = $('VOrigin', service).text()
    let destination = $('VDestination', service).text()
    let departureTime = $('VScheduledDepartureTime', service).text()
    let arrivalTime = $('VScheduledDestinationArrivalTime', service).text()
    let tdn = $('VServiceIdentifier', service).text()
    let platform = $('VPlatform', service).text()
    let direction = $('VDirection', service).text()

    let platformService = new VLinePlatformService(
      origin, destination,
      parseISOTime(departureTime), parseISOTime(arrivalTime),
      tdn, platform, this.getDirection(direction)
    )

    platformService.#addRealtimeData($, service, platformService)

    return platformService
  }

}