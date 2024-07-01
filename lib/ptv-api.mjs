import BusInterface from './bus/bus-interface.mjs'
import MetroInterface from './metro/metro-interface.mjs'
import TramInterface from './tram/tram-interface.mjs'

export default class PTVAPI {
  
  metro
  bus
  tram

  constructor(apiInterface) {
    this.api = apiInterface
    this.metro = new MetroInterface(apiInterface)
    this.bus = new BusInterface(apiInterface)
  }

  addTramTracker(ttInterface) {
    this.tram = new TramInterface(ttInterface)
  }

}