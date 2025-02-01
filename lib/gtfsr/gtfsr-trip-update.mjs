import GTFSREndpoint from './gtfsr-endpoint.mjs'

export default class GTFSRTripUpdates extends GTFSREndpoint {

  async parse(data) {
    return data.entity.map(tripUpdate => {
      return TripUpdate.from(tripUpdate)
    })
  }

}

export class TripUpdate {

  constructor() {

  }

  static from(tripUpdate) {
    return new TripUpdate()
  }

}

export class TripStopUpdate {

}