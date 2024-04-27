import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import config from './config.json' assert { type: 'json' }

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
// ptvAPI.gtfs.link()

async function main() {
  let mooroolbark = 19877
  let departures = await ptvAPI.metro.getDepartures(mooroolbark, {
    gtfs: true,
    maxResults: 3,
    date: new Date()
  })

  console.log(departures)

  let nextTrain = departures[0]
  console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
  console.log(typeof nextTrain) // MetroDeparture

  // let stoppingPattern = await nextTrain.getStoppingPattern()
  // console.log()
}

main()