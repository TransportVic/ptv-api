import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import config from './config.json' with { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

async function main() {
  let runID = process.argv[2]
  if (!runID) return console.error('Please provide a run ID!')

  let trip = await ptvAPI.bus.getStoppingPatternFromRunRef(runID)

  inspect(trip)
}

main()