export default class MetroSiteTimetable extends Array {

  constructor(stopTimes) {
  }

}

export class MetroSiteOpTimetable extends MetroSiteTimetable {

  constructor(day, stopTimes) {
    super(stopTimes)
  }

}

export class MetroSiteOpTimetableFactory {

  constructor(data) {
    let tripsByDay = this.groupByDay(data)
    for (let day of Object.keys(tripsByDay)) {
      let stopTimes = tripsByDay[day]
      let timetable = new MetroSiteOpTimetable(day, stopTimes)
    }
  }

  groupByDay(data) {
    let days = {}
    for (let stop of data) {
      if (!days[stop.date]) days[stop.date] = []
      days[stop.date].push(stop)
    }

    return days
  }

}