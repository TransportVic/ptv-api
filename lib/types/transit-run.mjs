export default class TransitRun {

  runRef
  destination
  position = null
  vehicle = null

  constructor(runRef, destination, position, description) {
    this.runRef = runRef
    this.destination = destination

    if (position) this.setPosition(position)
    if (description && description.id) this.setVehicle(description)
  }

  setPosition(position) {
    this.position = {
      type: "Feature",
      properties: {
        bearing: position.bearing,
        positionTime: new Date(position.datetime_utc),
        expiry: new Date(position.expiry_time)
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

  setVehicle(vehicle) {
    this.vehicle = {
      operator: vehicle.operator,
      id: vehicle.id,
      description: vehicle.description,
      lowFloor: vehicle.low_floor,
      airConditioned: vehicle.air_conditioned,
      length: vehicle.length,
      dataSource: vehicle.supplier
    }
  }

  static fromPTVData(data) {
    return new TransitRun(data.run_ref, data.destination_name, data.vehicle_position, data.vehicle_descriptor)
  }

}