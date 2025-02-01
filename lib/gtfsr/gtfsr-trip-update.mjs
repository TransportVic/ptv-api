import GTFSREndpoint from './gtfsr-endpoint.mjs'

export default class GTFSRTripUpdates extends GTFSREndpoint {

  async parse(data) {
    return data.entity.map(tripUpdate => {
      return TripUpdate.from(tripUpdate)
    })
  }

}

export class TripUpdate {

  liveTripID
  gtfs

  constructor(liveTripID, { tripID, departureDate, departureTime }) {
    this.liveTripID = liveTripID
    this.gtfs = {
      tripID, departureDate, departureTime
    }
  }

  static from(tripUpdate) {
    let updateBody = tripUpdate.trip_update
    let trip = new TripUpdate(tripUpdate.id, {
      tripID: updateBody.trip.trip_id,
      departureDate: updateBody.trip.start_date,
      departureTime: updateBody.trip.start_time.slice(0, 5)
    })

    return trip
  }

}

export class TripStopUpdate {

}