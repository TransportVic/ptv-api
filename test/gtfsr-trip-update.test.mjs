import { expect } from 'chai'
import nock from 'nock'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import GTFSRTripUpdates, { TripStopUpdate, TripUpdate } from '../lib/gtfsr/gtfsr-trip-update.mjs'
import { dateLikeToISO } from '../lib/date-utils.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sampleReply = await fs.readFile(path.join(__dirname, 'gtfsr-data', 'metro-tripupdates.bin'))

let testURL = 'https://gtfs-r.test/'

describe('The GTFSTripUpdates class', () => {
  it('Should return a list of TripUpdates', async () => {
    let api = new GTFSRTripUpdates(testURL, 'test')
    nock(testURL).get('/').reply(200, sampleReply)

    let apiResponse = await api.fetch()
    console.log(apiResponse.entity[0].trip_update.stop_time_update)

    expect(apiResponse[0]).to.be.instanceOf(TripUpdate)
    expect(apiResponse[0].liveTripID).to.equal('2025-02-01-5872')
    expect(apiResponse[0].gtfs).to.deep.equal({
      tripID: '100.T2.2-CGB-vpt-28.10.R',
      departureDate: '20250201',
      departureTime: '17:15'
    })

    expect(apiResponse[0].stopUpdates[0]).to.be.instanceOf(TripStopUpdate)
    expect(apiResponse[0].stopUpdates[0].stopSequence).to.equal(10)
    expect(apiResponse[0].stopUpdates[0].stopGTFSID).to.be.null
    expect(dateLikeToISO(apiResponse[0].stopUpdates[0].arrivalTime)).to.equal('2025-02-01T06:39:00.000Z')
    expect(dateLikeToISO(apiResponse[0].stopUpdates[0].departureTime)).to.equal('2025-02-01T06:40:00.000Z')
  })
})