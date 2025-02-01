import GTFSRTripUpdates, { TripStopUpdate, TripUpdate } from './gtfsr-trip-update.mjs'

export default class MetroTripUpdates extends GTFSRTripUpdates {

  static API_PATH = '/opendata/v1/gtfsr/metrotrain-tripupdates'

  constructor(devKey) {
    super(MetroTripUpdates.API_PATH, devKey)
  }

  async parse(data) {
    return data.entity.map(tripUpdate => {
      return MetroTripUpdate.from(tripUpdate)
    })
  }

}

export class MetroTripUpdate extends TripUpdate {

  tdn

  constructor(liveTripID, gtfsData) {
    super(liveTripID, gtfsData)
    this.tdn = liveTripID.slice(-4)
  }

  static from(tripUpdate) {
    let trip = new MetroTripUpdate(this._getLiveTripID(tripUpdate), this._getTripGTFSData(tripUpdate))
    let updateBody = tripUpdate.trip_update

    for (let stopUpdate of updateBody.stop_time_update) {
      trip._addStop(TripStopUpdate.from(stopUpdate))
    }

    return trip
  }

}