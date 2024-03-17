import MetroInterface from './metro/metro-interface.mjs'

export default class PTVAPI {
  
  constructor(apiInterface) {
    this.api = apiInterface
    this.metro = new MetroInterface(apiInterface)
  }

}