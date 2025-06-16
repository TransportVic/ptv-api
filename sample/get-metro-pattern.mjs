import { dateLikeToISO, parseISOTime } from '../lib/date-utils.mjs'
import { PTVAPIInterface } from '../lib/ptv-api-interface.mjs'
import PTVAPI from '../lib/ptv-api.mjs'
import config from './config.json' with { type: 'json' }
import inspect from './inspect.mjs'

let ptvAPI = new PTVAPI(new PTVAPIInterface(config.devID, config.key))

async function main() {
  let tdn = process.argv[2]
  if (!tdn) return console.error('Please provide a TDN!')

  let timeNow = parseISOTime(new Date().toISOString())
  if (timeNow.get('hour') < 3) timeNow = timeNow.plus({ day: -1 })

  let trip = await ptvAPI.metro.getStoppingPatternFromTDN(tdn, {
    includeForming: true,
    date: new Date(dateLikeToISO(timeNow)),
    expand: ['VehicleDescriptor', 'VehiclePosition']
  })

  inspect(trip)
}

main()