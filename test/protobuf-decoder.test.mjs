import { expect } from 'chai'
import GTFSREndpoint from '../lib/gtfsr/gtfsr-endpoint.mjs'
import nock from 'nock'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sampleReply = await fs.readFile(path.join(__dirname, 'gtfsr-data', 'metro-tripupdates.bin'))

let testURL = 'https://gtfs-r.test/'
class TestAPI extends GTFSREndpoint {

  constructor() { super(testURL, 'dev-key-here') }

}

describe('The base GTFSREndpoint class', () => {
  it('Should decode the specified protobuf file and return it as JSON', async () => {
    let api = new TestAPI()
    nock(testURL).get('/').reply(200, sampleReply)

    let apiResponse = await api.fetch()
    expect(apiResponse.header.gtfs_realtime_version).to.equal('2.0')
    expect(apiResponse.entity[0].id).to.equal('2025-02-01-5872')
    expect(apiResponse.entity[0].trip_update.trip).to.deep.equal({
      trip_id: '100.T2.2-CGB-vpt-28.10.R',
      route_id: '',
      direction_id: 0,
      start_time: '17:15:00',
      start_date: '20250201',
      schedule_relationship: 0
    })
  })
})