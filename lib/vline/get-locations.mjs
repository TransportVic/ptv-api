import { VLineJPMethod } from "./api-methods.mjs"

export class GetLocations extends VLineJPMethod {

  getMethodName() {
    return 'JP_GETLOCATIONS'
  }

  getMethodURLPath() {
    return '/VLineLocations.svc/web/GetAllLocations'
  }

}
