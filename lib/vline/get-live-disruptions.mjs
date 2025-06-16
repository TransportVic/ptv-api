export class GetLiveDisruptionsDetailsAPI {

  #BASE_URL = 'Timetable/Service-changes'

  constructor() {
  }

  async fetch(apiInterface) {
    let $ = await apiInterface.getWebsiteData(this.#BASE_URL)
  }

  getDisruptionModals() {
    return []
  }
}
