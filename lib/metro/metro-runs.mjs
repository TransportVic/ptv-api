import TransitRuns from '../types/transit-runs.mjs'
import MetroRun from './metro-run.mjs'
import MetroUtils from './metro-utils.mjs'

export default class MetroRuns extends TransitRuns {

  #routeID

  constructor(api, routeID) {
    super(api, routeID)
    this.#routeID = routeID
  }

  async fetch(parameters) {
    let body = await super.fetch(parameters)
    let relevantRuns = body.runs.filter(run => run.route_id === this.#routeID && run.run_ref.match(/^9\d{5}$/))

    for (let run of relevantRuns) {
      let runRef = run.run_ref
      let tdn = MetroUtils.getTDNFromRunRef(runRef)
      let runData = new SimplifiedMetroRun(runRef, run.vehicle_position, run.vehicle_descriptor, tdn, run.interchange)
      this.push(runData)
    }
  }

}

export class SimplifiedMetroRun extends MetroRun {
  
  constructor(runRef, position, description, tdn, interchange) {
    super(runRef, '', null, position, description, tdn, null, null, interchange, {
      routeName: null
    })
  }

}