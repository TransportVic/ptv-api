import TransitRun from "../types/transit-run.mjs" 

export default class MetroRun extends TransitRun {

  constructor(runRef, destination, position, description, isRailBus) {
    super(runRef, destination, position, description)
    this.tdn = MetroRun.getTDN(runRef)
    this.isRailBus = isRailBus
  }

  static getTDN(ptvRunID) {
    let parts
    if (parts = ptvRunID.toString().match(/^9(\d\d)(\d\d\d)$/)) {
      return `${String.fromCharCode(parseInt(parts[1]))}${parts[2]}`
    }

    return null
  }

  static fromPTVData(data, flags) {
    return new MetroRun(data.run_ref, data.destination_name, data.vehicle_position, data.vehicle_descriptor, flags.includes('RRB'))
  }

}