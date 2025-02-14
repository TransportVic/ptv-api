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

  constructor(tdn, stops) {
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