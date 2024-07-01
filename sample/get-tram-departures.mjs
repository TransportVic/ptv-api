import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import { TramTrackerAPIInterface } from '../lib/tramtracker-api-interface.mjs'
import config from './config.json' assert { type: 'json' }
import inspect from './inspect.mjs'

import path from 'path'
import url from 'url'

import sslRootCas from 'ssl-root-cas'
import https from 'https'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootCas = sslRootCas.create()
rootCas.addFile(path.resolve(__dirname, 'tt-intermediate.pem'))
https.globalAgent.options.ca = rootCas

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))
ptvAPI.addTramTracker(new TramTrackerAPIInterface(
  config.tramTrackerApplicationID,
  config.tramTrackerToken,
  config.tramTrackerClientID
))

async function main() {
  let tramTrackerID = process.argv[2]

  let departures = await ptvAPI.tram.getDepartures(tramTrackerID)

  inspect(departures)

  // let nextTrain = departures[0]
  // console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
  // console.log(typeof nextTrain) // MetroDeparture

  // let stoppingPattern = await nextTrain.getStoppingPattern()
  // console.log()
}

main()