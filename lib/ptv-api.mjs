import BusInterface from './bus/bus-interface.mjs'
import MetroInterface from './metro/metro-interface.mjs'
import { PTVAPIInterface } from './ptv-api-interface.mjs'
import TramInterface from './tram/tram-interface.mjs'
import { TramTrackerAPIInterface } from './tramtracker-api-interface.mjs'
import VLineInterface from './vline/vline-interface.mjs'
import { VLineAPIInterface } from './vline-api-interface.mjs'

export default class PTVAPI {
  
  metro
  bus
  tram
  vline

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

  /**
   * Adds V/Line data to the PTVAPI instance
   * @param {VLineAPIInterface} vlineInterface The V/Line API Interface to use
   */
  addVLine(vlineInterface) {
    this.vline = new VLineInterface(vlineInterface)
  }

}