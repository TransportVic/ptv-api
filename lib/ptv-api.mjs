import BusInterface from './bus/bus-interface.mjs'
import MetroInterface from './metro/metro-interface.mjs'

export default class PTVAPI {
  
  constructor(apiInterface) {
    this.api = apiInterface
    this.metro = new MetroInterface(apiInterface)
    this.bus = new BusInterface(apiInterface)
  }

}