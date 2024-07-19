import TransitRuns from '../types/transit-runs.mjs'

export default class MetroRuns extends TransitRuns {

  constructor(api, routeID) {
    super(api, routeID)
  }

  async fetch(parameters) {
    let body = this.fetchBody(parameters)
  }

  }