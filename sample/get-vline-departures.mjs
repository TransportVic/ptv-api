import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import { VLineAPIInterface } from '../lib/vline-api-interface.mjs'
import config from './config.json' with { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
let vlineAPIInterface = new VLineAPIInterface(
  config.vlineCallerID,
  config.vlineSignature
)
ptvAPI.addVLine(vlineAPIInterface)

async function main() {
  let station = 'Melbourne, Southern Cross'
  let departures = await ptvAPI.vline.getDepartures(station, 'D', 1440)
  inspect(departures)

  let nextTrain = departures[0]
  console.log(nextTrain)

  let stoppingPattern = await nextTrain.getStoppingPattern()
  console.log(stoppingPattern)
}

main()
