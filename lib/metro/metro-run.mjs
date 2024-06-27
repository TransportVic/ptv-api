import TransitRun from '../types/transit-run.mjs'
import lineGroups from './metro-data/line-groups.json' assert { type: 'json' }
import MetroUtils from './metro-utils.mjs'

export default class MetroRun extends TransitRun {

  static #UP_DIRECTION = {
    directionID: 1,
    directionName: "City (Flinders Street)",
    railDirection: "Up"
  }

  tdn
  isRailBus
  viaCityLoop = null
  direction
  formedBy = null
  forming = null

  constructor(runRef, destination, position, description, tdn, isRailBus, viaCityLoop, direction, interchange) {
    super(runRef, destination, position, description)
    this.tdn = tdn
    this.isRailBus = isRailBus
    this.viaCityLoop = viaCityLoop
    this.direction = direction
    this.populateInterchange(interchange)
  }

  populateInterchange(interchange) {
    if (!interchange) return
    if (interchange.distributor && interchange.distributor.run_ref !== '0') this.formedBy = {
      tdn: MetroUtils.getTDNFromRunRef(interchange.distributor.run_ref),
      runRef: interchange.distributor.run_ref
    }

    if (interchange.feeder && interchange.feeder.run_ref !== '0') this.forming = {
      tdn: MetroUtils.getTDNFromRunRef(interchange.feeder.run_ref),
      runRef: interchange.feeder.run_ref
    }
  }

  static isViaLoop(tdn, routeName, direction) {
    let viaCityLoop
    let loopIndicator = parseInt(tdn[1])

    if (lineGroups.dandenong.includes(routeName)) {
      let nTDN = parseInt(tdn)

      if (3999 < nTDN && nTDN < 4105) {
        viaCityLoop = direction === 'Up'
      } else if (4179 < nTDN && nTDN < 4200) { // Night network, loop closed
        viaCityLoop = false
      } else if (nTDN < 4265) {
        viaCityLoop = direction === 'Up'
      } else if (4599 < nTDN && nTDN < 4800) {
        viaCityLoop = direction === 'Up'
      }
    } else {
      viaCityLoop = loopIndicator > 5
    }

    return viaCityLoop
  }

  updateToFormedBy() {
    let originalTDN = this.tdn,
        originalRunRef = this.runRef

    let formedBy = this.formedBy

    this.runRef = formedBy.runRef
    this.destination = 'Flinders Street'
    this.tdn = formedBy.tdn
    this.viaCityLoop = true
    this.direction = MetroRun.#UP_DIRECTION

    this.formedBy = null
    this.forming = {
      tdn: originalTDN,
      runRef: originalRunRef
    }
  }

  static fromPTVData(data, flags, line, direction) {
    let tdn = MetroUtils.getTDNFromRunRef(data.run_ref)
    let isRailBus = flags.includes('RRB')
    let viaCityLoop = (isRailBus || !tdn) ? null : MetroRun.isViaLoop(tdn, line.routeName, direction.railDirection)

    return new MetroRun(data.run_ref, data.destination_name, data.vehicle_position, data.vehicle_descriptor, tdn, isRailBus, viaCityLoop, direction, data.interchange)
  }

}