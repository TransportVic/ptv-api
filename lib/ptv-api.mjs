import BusInterface from './bus/bus-interface.mjs'
import MetroInterface from './metro/metro-interface.mjs'
import { PTVAPIInterface } from './ptv-api-interface.mjs'
import TramInterface from './tram/tram-interface.mjs'
import { TramTrackerAPIInterface } from './tramtracker-api-interface.mjs'

export default class PTVAPI {
  
  metro
  bus
  tram

  /**
   * Constructs a new PTVAPI instance.
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   */
  constructor(apiInterface) {
    this.api = apiInterface
    this.metro = new MetroInterface(apiInterface)
    this.bus = new BusInterface(apiInterface)
  }

  /**
   * Adds TramTracker data to the PTVAPI instance
   * @param {TramTrackerAPIInterface} ttInterface The TramTracker API Interface to use
   */
  addTramTracker(ttInterface) {
    this.tram = new TramInterface(ttInterface)
  }

}