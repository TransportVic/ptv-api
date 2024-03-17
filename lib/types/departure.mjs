export default class Departure {
  stop
  scheduledDeparture
  estimatedDeparture

  constructor(stop, v3Departure, run) {
    this.stop = stop
  }

  get actualDeparture() {
    return this.estimatedDeparture || this.scheduledDeparture
  }
}