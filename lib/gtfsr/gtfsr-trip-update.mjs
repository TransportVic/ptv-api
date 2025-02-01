import { parseMSTime } from '../date-utils.mjs'
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
  stopUpdates = []

  constructor(liveTripID, { tripID, departureDate, departureTime }) {
    this.liveTripID = liveTripID
    this.gtfs = {
      tripID, departureDate, departureTime
    }
  }

  #addStop(stop) {
    this.stopUpdates.push(stop)
  }

  static from(tripUpdate) {
    let updateBody = tripUpdate.trip_update
    let trip = new TripUpdate(tripUpdate.id, {
      tripID: updateBody.trip.trip_id,
      departureDate: updateBody.trip.start_date,
      departureTime: updateBody.trip.start_time.slice(0, 5)
    })

    for (let stopUpdate of updateBody.stop_time_update) {
      trip.#addStop(TripStopUpdate.from(stopUpdate))
    }

    return trip
  }

}

export class TripStopUpdate {

  stopSequence
  stopGTFSID
  arrivalTime
  departureTime

  constructor({ stopSequence, stopGTFSID, arrivalTime, departureTime }) {
    this.stopSequence = stopSequence
    this.stopGTFSID = stopGTFSID ? stopGTFSID : null
    this.arrivalTime = arrivalTime
    this.departureTime = departureTime
  }

  static from(stopUpdate) {
    return new TripStopUpdate({
      stopSequence: stopUpdate.stop_sequence,
      stopGTFSID: stopUpdate.stop_id,
      arrivalTime: parseMSTime(stopUpdate.arrival.time * 1000),
      departureTime: parseMSTime(stopUpdate.departure.time * 1000),
    })
  }

}