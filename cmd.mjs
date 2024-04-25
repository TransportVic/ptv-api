import { PTVAPIInterface } from "./lib/ptv-api-interface.mjs"
import { inspect } from "util"

let devID = process.argv[2], key = process.argv[3], url = process.argv[4]

let ptvApi = new PTVAPIInterface(devID, key)
ptvApi.apiCall(url).then(data => {
  console.log(inspect(data, { depth: null, colors: true, maxArrayLength: null }).replace(/(\b)([A-Za-z_]+):/g, '$1"$2":').replace(/'/g, '"'))
})