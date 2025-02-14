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
  getOperationalTimetable(lineID) {
    
  }

}