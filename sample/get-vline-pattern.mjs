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
  //let departures = await ptvAPI.vline.getJourneys('Melbourne, Southern Cross', 'Sydney Rail Terminal (NSW)')
  let departures = await ptvAPI.vline.getJourneyStops('Melbourne, Southern Cross', 'Sydney Rail Terminal (NSW)', '2024-12-18T08:30:00', 'ST21')

  inspect(departures)
  //inspect(departures[0].getStoppingPattern())
}

main()
