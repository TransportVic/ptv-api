import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import config from './config.json' with { type: 'json' }
import inspect from './inspect.mjs'
import stops from './metro-stops.json' with { type: 'json' }

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

async function main() {
  let stopName = process.argv[2]
  let stopGTFSID = stops[stopName]
  if (!stopGTFSID) return console.error('Invalid stop name', stopName)

  let departures = await ptvAPI.metro.getDepartures(stopGTFSID, {
    gtfs: true,
    maxResults: 2
  })

  inspect(departures)

  // let nextTrain = departures[0]
  // console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
  // console.log(typeof nextTrain) // MetroDeparture

  // let stoppingPattern = await nextTrain.getStoppingPattern()
  // console.log()
}

main()