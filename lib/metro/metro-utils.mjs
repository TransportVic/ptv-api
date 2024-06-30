import MetroDirection from "./metro-direction.mjs"

export default class MetroUtils {

  /**
   * Converts a PTV API run reference to an Metro TDN
   * 
   * @param {String} runRef The PTV API run reference
   * @returns {string} The TDN, or null if the run reference is invalid
   */
  static getTDNFromRunRef(runRef) {
    let parts
    if (parts = runRef.toString().match(/^9(\d\d)(\d\d\d)$/)) {
      return `${String.fromCharCode(parseInt(parts[1]))}${parts[2]}`
    }

    return null
  }

  /**
   * Converts a Metro TDN into a PTV API run reference
   * 
   * @param {string} tdn The Metro TDN
   * @returns The PTV API run reference, or null if the TDN is invalid
   */
  static getRunRefFromTDN(tdn) {
    let parts
    if (parts = tdn.toString().match(/^(\w)(\d\d\d)$/)) {
      return `9${parts[1].charCodeAt(0)}${parts[2]}`
    }

    return null
  }

  /**
   * Checks if a run is heading Up (to Melbourne) or Down (Away from Melbourne) based on the PTV API direction
   * 
   * @param {string} line The name of the rail line
   * @param {dictionary} direction A dictionary containing direction info from the PTV API
   * @returns {dictionary} `direction` modified to include a new key `railDirection`
   */
  static createDirection(line, directionID, directionName) {
    let railDirection

    if (line.routeName === 'Stony Point') {
      railDirection = runDestination === 'Frankston' ? 'Up' : 'Down'
    } else if (line.routeName === 'City Circle') {
      railDirection = 'Down'
    } else {
      railDirection = directionName.includes('City') ? 'Up' : 'Down'
    }

    return new MetroDirection(directionID, directionName, railDirection)
  }

  /**
   * Corrects the station name. Required for Jolimont
   */
  static correctStationName(stationName) {
    if (stationName === 'Jolimont-MCG') return 'Jolimont'
    return stationName
  }

  /**
   * Corrects the platform number. Required for Flemington Racecourse
   */
  static correctPlatform(stationName, platform) {
    if (stationName === 'Flemington Racecourse' && platform === '4') return '2'
    return platform
  }

  /**
   * Corrects the route name. Required for Flemington Racecourse.
   */
  static correctRouteName(routeName) {
    if (routeName === 'Showgrounds - Flemington Racecourse') return 'Showgrounds/Flemington'
    return routeName
  }
}