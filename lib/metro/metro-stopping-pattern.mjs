import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"
import MetroUtils from "./metro-utils.mjs"
import CITY_CIRCLE_ROUTE from './metro-data/city-circle.route.json' with { type: 'json' }
import { PTVAPIInterface } from "../ptv-api-interface.mjs"
import { dateToGTFSDate, getDateNow, parseISOTime, parseMSTime } from '../date-utils.mjs'

const CROSS_CITY = [
  'Frankston',
  'Sandringham',
  'Werribee',
  'Williamstown'
]

export default class MetroStoppingPattern extends TransitStoppingPattern {

  #api
  #runRef

  valid = true

  /**
   * Constructs a new MetroStoppingPattern instance
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {string} runRef The run reference for the trip
   */
  constructor(apiInterface, runRef) {
    super(apiInterface, runRef)
    this.#api = apiInterface
    this.#runRef = runRef
  }
  
  /**
  * Gets the raw route data from the PTV response
  * @returns {string} The route data
  */
 getRoute() {
   let routeID = this.getRun().route_id
   if (routeID === 99) return CITY_CIRCLE_ROUTE

   return this.getResponseData().routes[routeID]
 }

  /**
   * Sets the MetroRun data for this trip
   */
  extractRunData() {
    let direction = this.getDirection()

    let metroDirection = MetroUtils.createDirection(this.routeData, direction.direction_id, direction.direction_name)

    this.runData = MetroRun.fromPTVData(this.getRun(), this.getFlags(), this.routeData, metroDirection)
  }

  /**
   * Processes the stop data for this trip as as series of `MetroTripStop`s
   */
  processStops() {
    let stopData = this.getStops()
    this.stops = stopData.map(stop => {
      let {stopName, platform, scheduledDepartureTime, estimatedDepartureTime} = stop

      return new MetroTripStop(stopName, platform, scheduledDepartureTime, estimatedDepartureTime)
    })
  }

  /**
   * Gets the origin station name, taking into account the formed by data showing up
   * 
   * @returns {string} The origin station name
   */
  #getOrigin() {
    if (this.runData.direction.railDirection === 'Up') return this.stops[0].stationName

    // Down trip: Need to trim to FSS
    let fss = this.stops.find(stop => stop.stationName === 'Flinders Street')
    if (fss) return fss.stationName

    return this.stops[0].stationName
  }

  /**
   * Trims the stops to just the actual trip stops, removing the formed by/forming stops.
   */
  trimStops() {
    let origin = this.#getOrigin()
    let destination = MetroUtils.correctStationName(this.runData.destination)

    let startIndex = this.stops.findIndex(stop => stop.stationName === origin)
    let endIndex = this.stops.findIndex(stop => stop.stationName === destination)

    /*
    Trip created as
    FKN -> RMD -> FSS then FSS -> SSS -> NME -> WER/WIL
    And reverse for eastbound trips
    If FSS arr/dep is the same time FSS won't be duplicated
    If it is different it gets duplicated
    But there are cases when it returns trip data from the wrong day and so both SSS and FSS get duplicated
    So need to check for +1 (SSS FSS FSS) and +2 (SSS FSS SSS FSS)

    Note start + 1 may not exist if a trip is AMEX to have 1 stop
    */
    if (this.stops[startIndex + 1] && this.stops[startIndex + 1].stationName === origin && CROSS_CITY.includes(this.routeData.routeName)) startIndex += 1
    if (this.stops[startIndex + 2] && this.stops[startIndex + 2].stationName === origin && CROSS_CITY.includes(this.routeData.routeName)) startIndex += 2

    let formedByStops = this.stops.slice(0, startIndex)
    let tripStops = this.stops.slice(startIndex, endIndex + 1)
    let formingStops = this.stops.slice(endIndex + 1)

    this.stops = tripStops

    this.formedByStops = formedByStops
    this.formingStops = formingStops
  }

  fixDelayJumps() {
    let now = +getDateNow()
    let nextStopIndex = this.stops.findIndex(stop =>
      (stop.estimatedDeparture || stop.scheduledDeparture) > now
    )

    if (nextStopIndex === -1) return
    let lastStopIndex = this.stops.length - 1
    if (this.stops[lastStopIndex].stationName === 'Flinders Street') lastStopIndex -= 1

    for (let i = nextStopIndex + 1; i <= lastStopIndex; i++) {
      let curStop = this.stops[i], prevStop = this.stops[i - 1]
      if (curStop.delay === null || prevStop.delay === null) continue

      let delayDiff = Math.abs(curStop.delay - prevStop.delay)
      if (delayDiff > 5) curStop.delay = prevStop.delay
    }
  }

  setOperationDay() {
    let firstStopDepartureTime = this.stops[0].scheduledDeparture
    let hour = firstStopDepartureTime.hour

    let ptDay = firstStopDepartureTime
    if (hour < 3) ptDay = firstStopDepartureTime.minus({ days: 1 })
    
    this.runData.operationDay = dateToGTFSDate(ptDay)
  }

  /**
   * Fetches the stopping pattern data from the PTV API
   * 
   * @param {dictionary} parameters The PTV API parameter
   */
  async fetch(parameters) {
    await this.fetchBody(0, parameters)
    if (!this.getRun()) return this.valid = false

    this.routeData = MetroLine.fromPTVData(this.getRoute())

    this.extractRunData()
    this.processStops()
    this.trimStops()
    this.fixDelayJumps()
    this.setOperationDay()
  }
}

class MetroTripStop {

  stationName
  platform
  scheduledDeparture
  estimatedDeparture

  constructor(stationName, platform, scheduledDepartureTime, estimatedDepartureTime) {
    this.stationName = stationName
    this.platform = platform
    this.scheduledDeparture = scheduledDepartureTime
    this.estimatedDeparture = estimatedDepartureTime

    this.correctStationName()
    this.correctPlatform()
  }

  get delay() {
    if (this.estimatedDeparture !== null) {
      return Math.round((this.estimatedDeparture - this.scheduledDeparture) / 1000 / 30) / 2
    }
    return null
  }

  set delay(delay) {
    this.estimatedDeparture = parseMSTime(+this.scheduledDeparture + delay * 1000 * 60)
  }

  /**
   * Corrects the station name. Required for Jolimont and St. Albans
   */
  correctStationName() {
    this.stationName = MetroUtils.correctStationName(this.stationName)
  }

  /**
   * Corrects the platform number. Required for Flemington Racecourse
   */
  correctPlatform() {
    this.platform = MetroUtils.correctPlatform(this.stationName, this.platform)
  }

}