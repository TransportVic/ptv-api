import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"
import MetroUtils from "./metro-utils.mjs"
import CITY_CIRCLE_ROUTE from './metro-data/city-circle.route.json' assert { type: 'json' }
import { PTVAPIInterface } from "../ptv-api-interface.mjs"

export default class MetroStoppingPattern extends TransitStoppingPattern {

  #api
  #runRef

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
    let destination = this.runData.destination
    
    let startIndex = this.stops.findIndex(stop => stop.stationName === origin)
    let endIndex = this.stops.findIndex(stop => stop.stationName === destination)

    let formedByStops = this.stops.slice(0, startIndex)
    let tripStops = this.stops.slice(startIndex, endIndex + 1)
    let formingStops = this.stops.slice(endIndex + 1)

    this.stops = tripStops

    this.formedByStops = formedByStops
    this.formingStops = formingStops
  }

  /**
   * Fetches the stopping pattern data from the PTV API
   * 
   * @param {dictionary} parameters The PTV API parameter
   */
  async fetch(parameters) {
    await this.fetchBody(0, parameters)

    this.routeData = MetroLine.fromPTVData(this.getRoute())

    this.extractRunData()
    this.processStops()
    this.trimStops()
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

  /**
   * Corrects the station name. Required for Jolimont
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