import TransitRun from '../types/transit-run.mjs'
import lineGroups from './metro-data/line-groups.json' with { type: 'json' }
import MetroUtils from './metro-utils.mjs'

const groupByLine = {}
Object.keys(lineGroups).forEach(group => {
  lineGroups[group].forEach(line => groupByLine[line] = group)
})

export default class MetroRun extends TransitRun {

  static #UP_DIRECTION = {
    directionID: 1,
    directionName: "City (Flinders Street)",
    railDirection: "Up"
  }

  tdn
  isRailBus
  viaCityLoop = null
  formedBy = null
  forming = null
  #line

  /**
   * Constructs a new MetroRun instance
   * 
   * @param {string} runRef The PTV API run reference of the run. For live runs from CIS, format is 9XXYYY: XX is the ASCII char code of the first digit, YYY is the last 3 digits.
   * @param {string} destination The loop-corrected destination of the run
   * @param {dictionary} position The current position of the train as a GeoJSON feature, if available
   * @param {dictionary} description Specific consist data for the trip, if available
   * @param {string} tdn The TDN of the run, if available
   * @param {boolean} isRailBus True of the run is a rail replacement bus and not a train
   * @param {boolean} viaCityLoop True of the train runs via the city loop
   * @param {dictionary} direction Direction data of the trip
   * @param {dictionary} interchange Formed by/forming data from the PTV API
   * @param {MetroLine} line The metro line data
   */
  constructor(runRef, destination, direction, position, description, tdn, isRailBus, viaCityLoop, interchange, line) {
    super(runRef, destination, direction, position, description)
    this.tdn = tdn
    this.isRailBus = isRailBus
    this.viaCityLoop = viaCityLoop
    this.#line = line
    this.populateInterchange(interchange)
    this.updateDestination()
  }

  /**
   * Updates the run's formed by/forming data based on the PTV API response.
   * Formed by is given by the interchange distributor.
   * Forming is given by the interchange feeder.
   * 
   * Populates both the TDN and run reference.
   * 
   * @param {dictionary} interchange The formed by/forming data from the PTV API
   */
  populateInterchange(interchange) {
    if (!interchange) return
    if (interchange.feeder && interchange.feeder.run_ref !== '0') this.formedBy = {
      tdn: MetroUtils.getTDNFromRunRef(interchange.feeder.run_ref),
      runRef: interchange.feeder.run_ref,
      destination: interchange.feeder.destination_name
    }

    if (interchange.distributor && interchange.distributor.run_ref !== '0') this.forming = {
      tdn: MetroUtils.getTDNFromRunRef(interchange.distributor.run_ref),
      runRef: interchange.distributor.run_ref,
      destination: interchange.distributor.destination_name
    }
  }

  /**
   * Checks if the Dandenong group train runs via the city loop.
   * 
   * Required as it operates on its own TDN range for the Metro Tunnel.
   * 
   * @param {string} tdn The TDN of the train
   * @param {string} direction The direction of the train
   * @returns True if the train runs via the city loop
   */
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

  /**
   * Checks if the train runs via the city loop.
   * 
   * @param {string} tdn The TDN of the train
   * @param {string} direction The direction of the train
   * @returns True if the train runs via the city loop
   */
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

  /**
   * Updates the run data to become an Up Via Loop train terminating at Flinders Street, using the formed by data.
   * 
   * Used to process Down Direct trains showing in City Loop departures
   */
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

  /**
   * Updates the destination for Burnley group trains.
   */
  updateDestinationBLY() {
    if (this.direction.railDirection === 'Up') {
      // RMD -> FSS -> CLP -> PAR
      if (this.destination === 'Parliament' && !this.viaCityLoop) this.destination = 'Flinders Street'
    }
  }

  /**
   * Updates the destination for Caulfield group trains.
   */
  updateDestinationCFD() {
    if (this.direction.railDirection === 'Up') {
      // RMD -> FSS -> SSS -> NPT group
      if (this.destination === 'Southern Cross' && !this.viaCityLoop) this.destination = 'Flinders Street'
      // RMD -> CLP -> FSS -> PAR -> CLP -> FGS -> NME (to SUY/CGB)
      if (this.destination === 'Flagstaff' && this.viaCityLoop) this.destination = 'Flinders Street'
      // RMD -> FSS -> CLP -> PAR
      if (this.destination === 'Parliament' && !this.viaCityLoop) this.destination = 'Flinders Street'
    }
  }

  /**
   * Updates the destination for Clifton Hill group trains.
   */
  updateDestinationCHL() {
    if (this.direction.railDirection === 'Up') {
      // RMD -> FSS -> CLP -> PAR
      if (this.destination === 'Parliament' && !this.viaCityLoop) this.destination = 'Flinders Street'
    }
  }

  /**
   * Updates the destination for Northern Group group trains.
   */
  updateDestinationNOR() {
    if (this.direction.railDirection === 'Up') {
      // NME -> FGS -> CLP -> FSS -> SSS -> NME (Next trip)
      // Needs to travel via the city loop as some Up trains terminate at SSS without going through the loop during works
      if (this.destination === 'Southern Cross' && this.viaCityLoop) this.destination = 'Flinders Street'
      // NME -> SSS -> FSS -> CLP -> FGS -> NME (Next trip)
      if (this.destination === 'Flagstaff' && !this.viaCityLoop) this.destination = 'Flinders Street'
    }
  }

  /**
   * Updates the destination of the train, taking into account the city loop stops of the next trip showing up
   */
  updateDestination() {
    let lineGroup = this.getLineGroup()

    if (lineGroup === 'burnley') this.updateDestinationBLY()
    else if (lineGroup === 'caulfield') this.updateDestinationCFD()
    else if (lineGroup === 'cliftonHill') this.updateDestinationCHL()
    else if (lineGroup === 'northern') this.updateDestinationCHL()
  }

  /**
   * Gets the line group of the run
   * 
   * @returns {string} The line group
   */
  getLineGroup() {
    return groupByLine[this.#line.routeName]
  }

  /**
   * Populates consist data for this run
   * 
   * @param {dictionary} vehicle The raw vehicle data from the PTV API
   */
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

  /**
   * Constructs a new MetroRun instance from the preprocessed PTV data
   * 
   * @param {dictionary} data The raw run data from the PTV API
   * @param {string} flags The departure flags
   * @param {MetroLine} line The route data
   * @param {dictionary} direction Direction data for the run
   * @returns 
   */
  static fromPTVData(data, flags, line, direction) {
    let tdn = MetroUtils.getTDNFromRunRef(data.run_ref)
    let isRailBus = flags.includes('RRB')
    let viaCityLoop = (isRailBus || !tdn) ? null : MetroRun.isViaLoop(tdn, line.routeName, direction.railDirection)

    return new MetroRun(data.run_ref, data.destination_name, direction, data.vehicle_position, data.vehicle_descriptor, tdn, isRailBus, viaCityLoop, data.interchange, line)
  }

}