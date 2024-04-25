export default class TransitRun {

  constructor(runRef, destination, position, description) {
    this.runRef = runRef
    this.destination = destination
    if (position) this.setPosition(position)
    else this.position = null
    this.description = description
  }

  setPosition(position) {
    this.position = {
      type: "Feature",
      properties: {
        bearing: position.bearing,
        positionTime: new Date(position.datetime_utc),
        expiry: new Date(position.expiry)
      },
      geometry: {
        type: "Point",
        coordinates: [
          position.longitude,
          position.latitude
        ]
      }
    }
  }

  static fromPTVData(data) {
    return new TransitRun(data.run_ref, data.destination_name, data.vehicle_position, data.vehicle_descriptor)
  }

}