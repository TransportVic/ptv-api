import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import { VLineAPIInterface } from '../lib/vline-api-interface.mjs'
import { GetLocations } from '../lib/vline/get-locations.mjs'
import config from './config.json' assert { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
let vlineAPIInterface = new VLineAPIInterface(
  config.vlineCallerID,
  config.vlineSignature
)
// ptvAPI.addVLine(vlineAPIInterface)

async function main() {
    let loc = new GetLocations()
    vlineAPIInterface.apiCall(loc)

  // let nextTrain = departures[0]
  // console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
  // console.log(typeof nextTrain) // MetroDeparture

  // let stoppingPattern = await nextTrain.getStoppingPattern()
  // console.log()
}

main()