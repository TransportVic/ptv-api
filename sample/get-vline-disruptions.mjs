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
  const allDisruptions = [
    ...(await Promise.all(
      Object.values(VLineDisruptions)
        .map(async line => await ptvAPI.vline.getLiveDisruptions(line))
    )),
    ...(await Promise.all(
      Object.values(VLineDisruptions)
        .map(async line => await ptvAPI.vline.getPlannedDisruptions(line))
    )),
  ].flatMap(i => i)

  console.log(allDisruptions)
}

main()
