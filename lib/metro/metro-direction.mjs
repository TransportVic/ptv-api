import TransitDirection from "../types/transit-direction.mjs"

export default class MetroDirection extends TransitDirection {

  railDirection
  constructor(directionID, directionName, railDirection) {
    super(directionID, directionName)
    this.railDirection = railDirection
  }

}