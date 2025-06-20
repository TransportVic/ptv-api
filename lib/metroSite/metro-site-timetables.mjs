import { parseDate, dateToGTFSDate } from '../date-utils.mjs'
import MetroUtils from '../metro/metro-utils.mjs'

export default class MetroSiteTimetable extends Array {

  #tdnStops = {}

  constructor(routeName, stopTimes) {
    super()
    this.groupByTDN(stopTimes)

    for (let tdn of Object.keys(this.#tdnStops)) {
      let trip = new MetroSitePattern(routeName, tdn, this.#tdnStops[tdn])
      this.push(trip)
    }
  }

  groupByTDN(stopTimes) {
    for (let stopTime of stopTimes) {
      if (!this.#tdnStops[stopTime.trip_id]) this.#tdnStops[stopTime.trip_id] = []
      this.#tdnStops[stopTime.trip_id].push(stopTime)
    }
  }

}

export class MetroSitePattern {

  stops
  tdn
  runData = { forming: null, formedBy: null }
  operationalDateMoment
  operationalDate
  scheduledDay
  routeName

  constructor(routeName, tdn, stops) {
    this.routeName = routeName
    this.tdn = tdn
    this.stops = this.createStops(stops)
    this.#setFormingFromRunData(stops[0])
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

  setOperationalDate(date) {
    this.operationalDateMoment = date
    this.operationalDate = dateToGTFSDate(date)
    
    for (let stop of this.stops) {
      stop.setOperationalDate(date)
    }
  }

  #setFormingFromRunData(stop) {
    let formingTDN = stop.forms_trip_id

    this.runData.forming = (formingTDN && formingTDN !== '0') ? {
      tdn: formingTDN
    } : null
  }

  setFormedBy(tdn) {
    this.runData.formedBy = { tdn }
  }

}

export class MetroSiteOpTimetable extends MetroSiteTimetable {

  #date

  constructor(routeName, date, stopTimes) {
    super(routeName, stopTimes)
    this.#date = date
    this.applyDates()
  }

  applyDates() {
    let parsedDate = parseDate(this.#date)
    for (let trip of this) {
      trip.setOperationalDate(parsedDate)
    }
  }

}

export class MetroSiteOpTimetableFactory {

  static create(data) {
    let allOpTimetables = []
    let dailyTimetables = {}

    for (let line of data) {
      let tripsByDay = this.#groupByDay(line.data)

      for (let day of Object.keys(tripsByDay)) {
        let stopTimes = tripsByDay[day]
        let timetable = new MetroSiteOpTimetable(line.lineName, day, stopTimes)
        allOpTimetables.push(...timetable)
        if (!dailyTimetables[day]) dailyTimetables[day] = {}

        for (let trip of timetable) dailyTimetables[day][trip.tdn] = trip
      }
    }

    for (let day of Object.keys(dailyTimetables)) {
      let trips = dailyTimetables[day]
      for (let trip of Object.values(trips)) {
        if (trip.runData.forming) {
          let formingTrip = trips[trip.runData.forming.tdn]
          if (formingTrip) formingTrip.setFormedBy(trip.tdn)
        }
      }
    }

    return allOpTimetables
  }

  static #groupByDay(data) {
    let days = {}
    for (let stop of data) {
      if (stop.date === 'None') continue
      if (!days[stop.date]) days[stop.date] = []
      days[stop.date].push(stop)
    }

    return days
  }

}

class MetroSiteTripStop {

  stationName
  platform
  scheduledDeparture = null
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

  setOperationalDate(date) {
    this.scheduledDeparture = date.plus({
      minutes: this.scheduledDepartureMinutes
    })
  }

}