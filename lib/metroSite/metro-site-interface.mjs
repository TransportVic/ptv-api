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
   * @param {string} lineID The Line ID from `MetroSiteInterface.lines`
   */
  async getOperationalTimetable(lineID) {
    let data = await this.#api.apiCall(`/op_timetable_${lineID}.json`)
    return MetroSiteOpTimetableFactory.create(data)
  }

}