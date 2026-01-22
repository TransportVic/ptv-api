import { parseISOTime } from '../date-utils.mjs'
import { VLineJPMethod } from './api-methods.mjs'
import { GetJourneyStopsAPI } from './get-journey-stops.mjs'

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
      services.push(VLinePlatformService.fromVLineData($, service, apiInterface))
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

  #CONSIST_TYPES = {
    'N-Set': 'N Class'
  }

  origin
  destination
  departureTime
  arrivalTime
  tdn
  platform
  direction
  consist

  #api

  estStationArrivalTime = null
  estArrivalTime = null

  constructor(origin, destination, departureTime, arrivalTime, tdn, platform, direction, consistSize, consistType, apiInterface) {
    this.origin = origin
    this.destination = destination
    this.departureTime = departureTime
    this.arrivalTime = arrivalTime
    this.tdn = tdn
    this.platform = platform
    this.direction = direction

    const type = this.#CONSIST_TYPES[consistType] || consistType
    this.consist = {
      consist: [],
      size: type === 'VLocity' ? consistSize * 3 : consistSize,
      type
    }

    this.#api = apiInterface
  }

  static getDirection(abbreviated) {
    if (abbreviated === 'D') return 'Down'
    else if (abbreviated === 'U') return 'Up'
    else throw new Error('Invalid direction!')
  }

  #addRealtimeData($, service) {
    let stationArrivalTime = VLinePlatformService.#getText($('VActualArrivalTime', service))
    let actualArrivalTime = VLinePlatformService.#getText($('VActualDestinationArrivalTime', service))
    
    // Actual station arrival time available for Arrivals endpoint IIF valid location passed in
    if (stationArrivalTime) this.estStationArrivalTime = parseISOTime(stationArrivalTime)

    // Actual arrival time available for Arrivals endpoint
    if (actualArrivalTime) this.estArrivalTime = parseISOTime(actualArrivalTime)
  }

  /**
   * Gets the stopping pattern of the platform service
   * 
   * @returns {VLineJourneyStops} The stopping pattern of the service
   */
  async getStoppingPattern() {
    let journeyStops = new GetJourneyStopsAPI(this.origin, this.destination, this.departureTime, this.tdn)
    return await journeyStops.fetch(this.#api)
  }

  static #getText(field) {
    if ((typeof field.attr('i:nil')) === 'undefined') return field.text()
    return null
  }

  static fromVLineData($, service, apiInterface) {
    // Remember that origin and destination can be null if it's not a normal V/Line stop
    let origin = this.#getText($('VOrigin', service))
    let destination = this.#getText($('VDestination', service))

    let departureTime = $('VScheduledDepartureTime', service).text()
    let arrivalTime = $('VScheduledDestinationArrivalTime', service).text()
    let tdn = $('VServiceIdentifier', service).text()
    let platform = this.#getText($('VPlatform', service))
    let direction = $('VDirection', service).text()
    let consistSize = parseInt($('VConsistCount', service).text()) || 1
    let consistType = $('VConsistSubType', service).text() || 'Unknown'

    let platformService = new VLinePlatformService(
      origin, destination,
      parseISOTime(departureTime), parseISOTime(arrivalTime),
      tdn, platform, this.getDirection(direction), consistSize, consistType,
      apiInterface
    )

    platformService.#addRealtimeData($, service, platformService)

    return platformService
  }

}