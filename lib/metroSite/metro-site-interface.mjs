import metroSiteData from './metro-site-data.json' with { type: 'json' }
import MetroSiteDepartures from './metro-site-departures.mjs'
import { MetroSiteOpTimetableFactory } from './metro-site-timetables.mjs'

export default class MetroSiteInterface {

  #api
  lines = metroSiteData.lines

  constructor(apiInterface) {
    this.#api = apiInterface
  }

  /**
   * Gets a line's operational timetable.
   * 
   * @param {string|array} lineIDs The Line IDs from `MetroSiteInterface.lines`
   */
  async getOperationalTimetable(lineIDs) {
    let data = []

    if (!(lineIDs instanceof Array)) lineIDs = [ lineIDs ]
    for (let line of lineIDs) {
      data.push({
        data: await this.#api.apiCall(`/op_timetable_${line.lineID}.json`),
        lineName: line.lineName
      })
    }

    return MetroSiteOpTimetableFactory.create(data)
  }

  async getDepartures() {
    let data = await this.#api.apiCall('/departures.json')

    return new MetroSiteDepartures(data)
  }
}