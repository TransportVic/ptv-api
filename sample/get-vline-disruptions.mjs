import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import { VLineAPIInterface } from '../lib/vline-api-interface.mjs'
import { VLineDisruptions } from '../lib/vline/get-disruptions.mjs'
import config from './config.json' with { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
let vlineAPIInterface = new VLineAPIInterface(
  config.vlineCallerID,
  config.vlineSignature
)
ptvAPI.addVLine(vlineAPIInterface)

async function main() {
  console.log(await ptvAPI.vline.getLiveDisruptions(VLineDisruptions.BALLARAT))
}

main()
