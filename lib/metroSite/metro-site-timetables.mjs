import MetroUtils from '../metro/metro-utils.mjs'

export default class MetroSiteTimetable extends Array {

  #tdns = {}

  constructor(stopTimes) {
    super()
    this.groupByTDN(stopTimes)

    for (let tdn of Object.keys(this.#tdns)) {
      this.push(new MetroSitePattern(tdn, this.#tdns[tdn]))
    }
  }

  groupByTDN(stopTimes) {
    for (let stopTime of stopTimes) {
      if (!this.#tdns[stopTime.trip_id]) this.#tdns[stopTime.trip_id] = []
      this.#tdns[stopTime.trip_id].push(stopTime)
    }
  }

}

export class MetroSitePattern {

  stops
  tdn

  constructor(tdn, stops) {
    this.tdn = tdn
    this.stops = this.createStops(stops)
  }

  createStops(stops) {
    return stops.map(stop => {
      return new MetroSiteTripStop(
        stop.station,
        stop.platform,
        parseInt(stop.time_seconds) / 60
      )
    })
  }

}

export class MetroSiteOpTimetable extends MetroSiteTimetable {

  constructor(day, stopTimes) {
    super(stopTimes)
  }

}

export class MetroSiteOpTimetableFactory {

  static create(data) {
    let tripsByDay = this.#groupByDay(data)
    let allOpTimetables = []

    for (let day of Object.keys(tripsByDay)) {
      let stopTimes = tripsByDay[day]
      let timetable = new MetroSiteOpTimetable(day, stopTimes)
      allOpTimetables.push(...timetable)
    }

    return allOpTimetables
  }

  static #groupByDay(data) {
    let days = {}
    for (let stop of data) {
      if (!days[stop.date]) days[stop.date] = []
      days[stop.date].push(stop)
    }

    return days
  }

}

class MetroSiteTripStop {

  stationName
  platform
  scheduledDeparture
  scheduledDepartureMinutes
  estimatedDeparture = null

  constructor(stationName, platform, scheduledDepartureTimeMinutes) {
    this.stationName = stationName
    this.platform = platform
    this.scheduledDepartureMinutes = scheduledDepartureTimeMinutes

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

}