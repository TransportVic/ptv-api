import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import { TramTrackerAPIInterface } from '../lib/tramtracker-api-interface.mjs'
import config from './config.json' with { type: 'json' }
import inspect from './inspect.mjs'

import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
let tramTrackerAPIInterface = new TramTrackerAPIInterface(
  config.tramTrackerApplicationID,
  config.tramTrackerToken,
  config.tramTrackerClientID
)
tramTrackerAPIInterface.addTTIntermediateCert(path.resolve(__dirname, 'tt-intermediate.pem'))

ptvAPI.addTramTracker(tramTrackerAPIInterface)

async function main() {
  let tramTrackerID = process.argv[2]
  if (!tramTrackerID) return console.error(`Please provide a stop number:\n> node get-tram-departures.mjs stop_id`)

  let departures = await ptvAPI.tram.getDepartures(tramTrackerID)

  inspect(departures)

  // let nextTrain = departures[0]
  // console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
  // console.log(typeof nextTrain) // MetroDeparture

  // let stoppingPattern = await nextTrain.getStoppingPattern()
  // console.log()
}

main()