import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import { VLineAPIInterface } from '../lib/vline-api-interface.mjs'
import config from './config.json' assert { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
let vlineAPIInterface = new VLineAPIInterface(
  config.vlineCallerID,
  config.vlineSignature
)
ptvAPI.addVLine(vlineAPIInterface)

async function main() {
  let departures = await ptvAPI.vline.getDepartures('Melbourne, Southern Cross', 'D', 30)
  inspect(departures)
}

main()