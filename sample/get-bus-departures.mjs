import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import config from './config.json' assert { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

async function main() {
  let stopGTFSID = process.argv[2]
  if (!stopGTFSID) return console.error(`Please provide a stop number:\n> node get-bus-departures.mjs stop_id`)

  let departures = await ptvAPI.bus.getDepartures(stopGTFSID, {
    gtfs: true,
    maxResults: 2,
    expand: ['vehicleposition']
  })

  inspect(departures)

  // let nextTrain = departures[0]
  // console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
  // console.log(typeof nextTrain) // MetroDeparture

  // let stoppingPattern = await nextTrain.getStoppingPattern()
  // console.log()
}

main()