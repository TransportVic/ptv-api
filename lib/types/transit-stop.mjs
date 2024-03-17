export default class TransitStop {

  stopGTFSID
  stopName
  suburb
  stopNumber
  stopPlatform

  constructor({ stopGTFSID = 0, stopName = "", suburb = "", stopNumber = null, stopPlatform = null }) {
    this.stopGTFSID = stopGTFSID
    this.stopName = stopName
    this.suburb = suburb
    this.stopNumber = stopNumber
    this.stopPlatform = stopPlatform
  }

}