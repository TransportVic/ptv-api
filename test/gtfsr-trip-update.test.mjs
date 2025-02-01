import { expect } from 'chai'
import nock from 'nock'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import GTFSRTripUpdates, { TripStopUpdate, TripUpdate } from '../lib/gtfsr/gtfsr-trip-update.mjs'
import { dateLikeToISO } from '../lib/date-utils.mjs'
import MetroTripUpdates, { MetroTripUpdate } from '../lib/gtfsr/metro-trip-update.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sampleReply = await fs.readFile(path.join(__dirname, 'gtfsr-data', 'metro-tripupdates.bin'))

let testURL = 'https://gtfs-r.test/'

describe('The GTFSRTripUpdates class', () => {
  it('Should return a list of TripUpdates', async () => {
    let api = new GTFSRTripUpdates(testURL, 'test')
    nock(testURL).get('/').reply(200, sampleReply)

    let apiResponse = await api.fetch()

    expect(apiResponse[0]).to.be.instanceOf(TripUpdate)
    expect(apiResponse[0].liveTripID).to.equal('2025-02-01-5872')
    expect(apiResponse[0].gtfs).to.deep.equal({
      tripID: '100.T2.2-CGB-vpt-28.10.R',
      departureDate: '20250201',
      departureTime: '17:15'
    })
  })

  it('Should return TripStopUpdates inside each TripUpdate', async () => {
    let api = new GTFSRTripUpdates(testURL, 'test')
    nock(testURL).get('/').reply(200, sampleReply)

    let apiResponse = await api.fetch()

    expect(apiResponse[0].stopUpdates[0]).to.be.instanceOf(TripStopUpdate)
    expect(apiResponse[0].stopUpdates[0].stopSequence).to.equal(10)
    expect(apiResponse[0].stopUpdates[0].stopGTFSID).to.be.null
    expect(dateLikeToISO(apiResponse[0].stopUpdates[0].arrivalTime)).to.equal('2025-02-01T06:39:00.000Z')
    expect(dateLikeToISO(apiResponse[0].stopUpdates[0].departureTime)).to.equal('2025-02-01T06:40:00.000Z')
  })
})

describe('The MetroTripUpdates class', () => {
  it('Should additionally return the trip TDN', async () => {
    let api = new MetroTripUpdates(testURL, 'test')
    nock(testURL).get('/').reply(200, sampleReply)

    let apiResponse = await api.fetch()

    expect(apiResponse[0]).to.be.instanceOf(MetroTripUpdate)
    expect(apiResponse[0].tdn).to.equal('5872')
    expect(apiResponse[1].tdn).to.equal('2679')
  })
})