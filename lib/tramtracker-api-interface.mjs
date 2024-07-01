export class TramTrackerAPIInterface {

  #appID
  #token
  #clientID
  #query

  /**
   * Constructs a new TramTrackerAPIInterface. This class communicates with the TramTracker API.
   * 
   * @param {string} appID The TramTracker Application ID
   * @param {string} token The TramTracker Application token
   * @param {string} clientID The TramTracker Client ID
   */
  constructor(appID, token, clientID) {
    this.#appID = appID
    this.#token = token
    this.#clientID
    this.#query = `?aid=${appID}&tkn=${token}&cid=${clientID}`
  }

  /**
   * Constructs a full PTV API URL, with the DevID and signature included
   * 
   * @param {string} pathname The pathanme of a URL in the PTV API
   * @returns {string} An absolute URL pointing to a PTV API resource
   */
  constructURL(pathname) {
    return `https://ws2.tramtracker.com.au/TramTracker/RestService${pathname}${this.#query}`
  }


}