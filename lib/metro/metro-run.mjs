import TransitRun from '../types/transit-run.mjs'
import lineGroups from './metro-data/line-groups.json' assert { type: 'json' }

export default class MetroRun extends TransitRun {

  tdn
  isRailBus
  viaCityLoop

  constructor(runRef, destination, position, description, tdn, isRailBus, viaCityLoop) {
    super(runRef, destination, position, description)
    this.tdn = tdn
    this.isRailBus = isRailBus
    this.viaCityLoop = viaCityLoop
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

  static getTDN(ptvRunID) {
    let parts
    if (parts = ptvRunID.toString().match(/^9(\d\d)(\d\d\d)$/)) {
      return `${String.fromCharCode(parseInt(parts[1]))}${parts[2]}`
    }

    return null
  }

  static fromPTVData(data, flags, line, direction) {
    let tdn = MetroRun.getTDN(data.run_ref)
    let isRailBus = flags.includes('RRB')
    let viaCityLoop = (isRailBus || !tdn) ? null : MetroRun.isViaLoop(tdn, line.routeName, direction.railDirection)

    return new MetroRun(data.run_ref, data.destination_name, data.vehicle_position, data.vehicle_descriptor, tdn, isRailBus, viaCityLoop)
  }

}