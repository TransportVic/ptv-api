import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import config from './config.json' assert { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

async function main() {
  let tdn = process.argv[2]
  if (!tdn) return console.error('Please provide a TDN!')

  let trip = await ptvAPI.metro.getStoppingPatternFromTDN(tdn, {
    includeForming: true
  })

  inspect(trip)
}

main()