import TransitRuns from '../types/transit-runs.mjs'
import MetroRun from './metro-run.mjs'
import MetroUtils from './metro-utils.mjs'

export default class MetroRuns extends TransitRuns {

  #routeID

  constructor(api, routeID) {
    super(api, routeID)
    this.#routeID = routeID
  }

  checkAndUpdateFormedBy(distributorData, currentRunData) {
    let runData = this.getRun(distributorData.run_ref)
    if (runData && !runData.interchange.distributor) runData.interchange.distributor = {
      run_ref: currentRunData.run_ref,
      destination_name: currentRunData.destination_name,
      advertised: distributorData.advertised
    }
  }

  checkAndUpdateForming(feederData, currentRunData) {
    let runData = this.getRun(feederData.run_ref)
    if (runData && !runData.interchange.feeder) runData.interchange.feeder = {
      run_ref: currentRunData.run_ref,
      destination_name: currentRunData.destination_name,
      advertised: feederData.advertised
    }
  }

  async fetch(parameters) {
    let body = await super.fetch(parameters)
    let relevantRuns = body.runs.filter(run => run.route_id === this.#routeID && run.run_ref.match(/^9\d{5}$/))

    for (let run of body.runs) {
      if (run.interchange && run.interchange.distributor) {
        // We are formed by this service, set that service's forming to the current service
        this.checkAndUpdateForming(run.interchange.distributor, run)
      }

      if (run.interchange && run.interchange.feeder) {
        // We are forming this service, set that service's formed by to the current service
        this.checkAndUpdateFormedBy(run.interchange.feeder, run)
      }
    }

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