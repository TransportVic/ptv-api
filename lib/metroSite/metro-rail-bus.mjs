import { parseMSTime } from '../date-utils.mjs'

export default class MetroRailBusUpdates extends Array {

  constructor(data) {
    super()
    let trips = this.groupByTripID(data)
    this.push(...trips)
  }

  groupByTripID(data) {
    let trips = {}
    for (let trip of data) {
      if (!trips[trip.trip_id]) {
        trips[trip.trip_id] = {
          tripID: trip.trip_id,
          vehiclePosition: {
            type: 'Point',
            coordinates: [
              parseFloat(trip.longitude),
              parseFloat(trip.latitude)
            ]
          },
          stopTimings: []
        }
      }

      let estimatedArrivalTime, estimatedDepartureTime
      if (trip.time_until_arrival !== null) {
        estimatedArrivalTime = parseMSTime((trip.modified + trip.time_until_arrival) * 1000)
      }

      if (trip.time_until_departure !== null) {
        estimatedDepartureTime = parseMSTime((trip.modified + trip.time_until_departure) * 1000)
      }

      if (estimatedArrivalTime && !estimatedDepartureTime) estimatedDepartureTime = estimatedArrivalTime

      trips[trip.trip_id].stopTimings.push({
        stopGTFSID: 'RAIL_' + trip.stop_id,
        estimatedArrivalTime, estimatedDepartureTime
      })
    }

    return Object.values(trips)
  }

}