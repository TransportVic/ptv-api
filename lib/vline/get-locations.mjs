import { VLineJPMethod } from "./api-methods.mjs"

export class GetLocationsAPI extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETLOCATIONS'
  }

  getMethodURLPath() {
    return '/VLineLocations.svc/web/GetAllLocations'
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let locationData = $('VLocation')

    let locations = new VLineLocations()

    for (let location of locationData) {
      locations.push(VLineLocation.fromVLineData($, location))
    }

    return locations
  }
}

export class VLineLocations extends Array {

}

export class VLineLocation {

  name
  stopType
  vnetCode
  position

  constructor(name, stopType, vnetCode, latitude, longitude) {
    this.name = name.replace(/  +/g, ' ').trim()
    this.stopType = stopType
    this.vnetCode = vnetCode
    this.position = latitude === 0 ? null : {
      type: 'Point',
      coordinates: [
        longitude, latitude
      ]
    }
  }

  static fromVLineData($, location) {
    let name = $('VLocationName', location).text()
    let stopType = $('VStopType', location).text()
    let vnetCode = $('VVNetStopCode', location).text()
    let latitude = parseFloat($('VGPSLatitude', location).text())
    let longitude = parseFloat($('VGPSLongitude', location).text())

    return new VLineLocation(name, stopType, vnetCode, latitude, longitude)
  }

}
