import metroSiteData from './metro-site-data.json' with { type: 'json' }

export default class MetroSiteInterface {

  #api
  lines = metroSiteData.lines

  constructor(apiInterface) {
    this.#api = apiInterface
  }

  /**
   * Gets a line's operational timetable.
   * 
   * @param {string} lineID The Line ID from `MetroSiteInterface.lines`
   */
  async getOperationalTimetable(lineID) {
    let data = await this.#api.apiCall(`/op_timetable_${lineID}.json`)
    let tripsByDay = this.groupByDay(data)


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