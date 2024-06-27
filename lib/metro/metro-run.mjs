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

  static handleDNGViaLoop(tdn, direction) {
    if (tdn[0] === 'C') {
      // Hey I know this looks bad but its reserved for future code to handle night network where Up is not so simple
      if (direction === 'Up') {
        return true
      } else return false
    } else {
      // Todo: Verify this logic is still in place
      let nTDN = parseInt(tdn)

      if (3999 < nTDN && nTDN < 4105) {
        return direction === 'Up'
      } else if (4179 < nTDN && nTDN < 4200) { // Night network, loop closed
        return false
      } else if (nTDN < 4265) {
        return direction === 'Up'
      } else if (4599 < nTDN && nTDN < 4800) {
        return direction === 'Up'
      }
    }
  }

  static isViaLoop(tdn, routeName, direction) {
    let viaCityLoop
    let loopIndicator = parseInt(tdn[1])

    if (lineGroups.dandenong.includes(routeName)) {
      return this.handleDNGViaLoop(tdn, direction)
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

  setVehicle(vehicle) {
    let description = vehicle.description
    let parts
    let fleetNumbers = vehicle.id.split('-')
    let motorCars = fleetNumbers.filter(car => car.endsWith('M'))
    let trailerCars = fleetNumbers.filter(car => car.endsWith('T'))
    let cars, model

    if (parts = description.match(/^(\d+)[ \-][cC]ar ([\w ]+)$/)) {
      cars = parseInt(parts[1]), model = parts[2]
    }

    if (model === 'HCMT') motorCars = motorCars.map(car => car.replace('M', ''))
    if (model === 'Silver Hitachi') model = 'Hitachi'

    this.vehicle = {
      operator: vehicle.operator,
      cars,
      model,
      motorCars,
      trailerCars,
      length: vehicle.length,
      dataSource: vehicle.supplier
    }
  }

  static fromPTVData(data, flags, line, direction) {
    let tdn = MetroUtils.getTDNFromRunRef(data.run_ref)
    let isRailBus = flags.includes('RRB')
    let viaCityLoop = (isRailBus || !tdn) ? null : MetroRun.isViaLoop(tdn, line.routeName, direction.railDirection)

    return new MetroRun(data.run_ref, data.destination_name, data.vehicle_position, data.vehicle_descriptor, tdn, isRailBus, viaCityLoop, direction, data.interchange)
  }

}