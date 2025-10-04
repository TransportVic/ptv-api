import { parseDate, dateToGTFSDate, parseMSTime } from '../date-utils.mjs'
import MetroUtils from '../metro/metro-utils.mjs'

export default class MetroSiteDepartures extends Array {

  #tdnStops = {}
  #tdns = {}

  constructor(departureData) {
    super()
    this.groupByTDN(departureData.entries)

    let operationalDateMoment = parseMSTime(departureData.created).startOf('day')

    for (let tdn of Object.keys(this.#tdnStops)) {
      let trip = new MetroSiteDepartureTrip(tdn, this.#tdnStops[tdn], operationalDateMoment)
      this.push(trip)
      this.#tdns[tdn] = trip
    }
  }

  groupByTDN(stopTimes) {
    for (let stopTime of stopTimes) {
      if (!this.#tdnStops[stopTime.trip_id]) this.#tdnStops[stopTime.trip_id] = []
      this.#tdnStops[stopTime.trip_id].push(stopTime)
    }
  }

}

export class MetroSiteDepartureTrip {

  stops
  tdn
  operationalDateMoment
  operationalDate

  constructor(tdn, stops, date) {
    this.tdn = tdn
    this.stops = this.createStops(stops)

    this.operationalDateMoment = date
    this.operationalDate = dateToGTFSDate(date)

    let workingDate = date.set({ hour: 12 }).plus({ hour: -12 })
    
    for (let stop of this.stops) {
      stop.setOperationalDate(workingDate)
    }

    let lastStop = this.stops[this.stops.length - 1]
    if (this.tdn.match(/^0[78]/) && lastStop.stationName === 'Flinders Street') {
      // If sch and est times mismatch by > 5 min discard as it is for first stop
      if (lastStop.scheduledDeparture.diff(lastStop.estimatedDeparture, 'minutes').minutes > 5) {
        lastStop.estimatedArrival = null
        lastStop.estimatedArrivalMinutes = null
        lastStop.estimatedDeparture = null
        lastStop.estimatedDepartureMinutes = null
        lastStop.platform = lastStop.scheduledPlatform
      }
    }
  }

  createStops(stops) {
    return stops.map(stop => {
      let arrivalMinutes = null
      if (stop.estimated_arrival_time_seconds) {
        arrivalMinutes = parseInt(stop.estimated_arrival_time_seconds) / 60
        if (arrivalMinutes < 180) arrivalMinutes += 1440
      }

      let departureMinutes = parseInt(stop.estimated_departure_time_seconds) / 60
      if (departureMinutes < 180) departureMinutes += 1440

      return new MetroSiteDepartureStop(
        stop.station,
        stop.estimated_platform,
        stop.platform,
        parseInt(stop.time_seconds) / 60,
        arrivalMinutes,
        departureMinutes
      )
    })
  }

}

class MetroSiteDepartureStop {

  stationName
  platform
  scheduledPlatform
  scheduledDeparture = null
  scheduledDepartureMinutes

  estimatedArrival = null
  estimatedArrivalMinutes

  estimatedDeparture = null
  estimatedDepartureMinutes

  constructor(stationName, platform, scheduledPlatform, scheduledDepartureMinutes, estimatedArrivalMinutes, estimatedDepartureMinutes) {
    this.stationName = stationName
    this.platform = platform
    this.scheduledPlatform = scheduledPlatform
    this.scheduledDepartureMinutes = scheduledDepartureMinutes
    this.estimatedArrivalMinutes = estimatedArrivalMinutes
    this.estimatedDepartureMinutes = estimatedDepartureMinutes

    this.correctStationName()
    this.correctPlatform()
  }

  get delay() {
    if (this.estimatedDeparture !== null) {
      return Math.round((this.estimatedDeparture - this.scheduledDeparture) / 1000 / 30) / 2
    }
    return null
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

  setOperationalDate(date) {
    this.scheduledDeparture = date.plus({ minutes: this.scheduledDepartureMinutes })
    if (this.estimatedArrivalMinutes) {
      this.estimatedArrival = date.plus({ minutes: this.estimatedArrivalMinutes })
    }
    this.estimatedDeparture = date.plus({ minutes: this.estimatedDepartureMinutes })
  }

}
