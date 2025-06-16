export class GetLiveDisruptionsDetailsAPI {

  #BASE_URL = 'Timetable/Service-changes'
  #$

  constructor() {
  }

  async fetch(apiInterface) {
    this.#$ = await apiInterface.getWebsiteData(this.#BASE_URL)

    console.log()
  }

  getDisruptionModals() {
    let $ = this.#$
    let modalButtons = $('.servicechangesection:has(.disruptionsserviceschangesectionheader) a[data-toggle=modal]')
    return Array.from(modalButtons).map(a => $(a).attr('data-target'))
  }

  getDisruptionModalContent() {
    let modalIDs = this.getDisruptionModals()
    return modalIDs.map(id => this.#$(id + ' .modal-body').html())
  }

  getAlteredServices() {
    
  }
}
