import metroSiteData from './metro-site-data.json' with { type: 'json' }
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

    if (typeof lineIDs === 'string') lineIDs = [ lineIDs ]
    for (let lineID of lineIDs) {
      data.push(...await this.#api.apiCall(`/op_timetable_${lineID}.json`))
    }

    return MetroSiteOpTimetableFactory.create(data)
  }

}