import GTFSRTripUpdates, { TripUpdate } from './gtfsr-trip-update.mjs'

export default class MetroTripUpdates extends GTFSRTripUpdates {

  static API_HOST = 'https://data-exchange-api.vicroads.vic.gov.au'
  static API_PATH = '/opendata/v1/gtfsr/metrotrain-tripupdates'

  static API_URL = this.API_HOST + this.API_PATH

  constructor(devKey) {
    super(MetroTripUpdates.API_URL, devKey)
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

}