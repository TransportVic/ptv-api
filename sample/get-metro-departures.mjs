import PTVAPI from './lib/ptv-api.mjs'

let ptvAPI = new PTVAPI("1234", "5678")
ptvAPI.gtfs.link()

let mooroolbark = 19877
let departures = await ptvAPI.metro.getDepartures(mooroolbark, {
  maxDepartures: 10,
  date: new Date()
})

let nextTrain = departures[0]
console.log(nextTrain) // 14:50 Flinders Street from Mooroolbark Platform 1
console.log(typeof nextTrain) // MetroDeparture

let stoppingPattern = await nextTrain.getStoppingPattern()
console.log()