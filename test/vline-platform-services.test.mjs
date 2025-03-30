import { expect } from 'chai'
import { StubVLineAPI } from '../stub-api.mjs'

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import PTVAPI from '../lib/ptv-api.mjs'
import { GetPlatformServicesAPI, VLinePlatformService, VLinePlatformServices } from '../lib/vline/get-platform-services.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stubPlatformDepartures = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'platform-departures.xml'))).toString()
const stubPlatformArrivals = (await fs.readFile(path.join(__dirname, 'vline-mock-data', 'platform-arrivals.xml'))).toString()
const stubJourneyStops = (await fs.readFile(path.join(__dirname, 'vline-mock-data', '8156-journey-stops.xml'))).toString()

describe('The GetPlatformServicesAPI class', () => {
  class TestPlatformServices extends GetPlatformServicesAPI {
    getServiceType() { return 'Test' }
  }

  describe('The getMethodName function', () => {
    it('Should return JP_GETPLATFORM<service type> in uppercase', () => {
      let testService = new TestPlatformServices()
      expect(testService.getMethodName()).to.equal('JP_GETPLATFORMTEST')
    })
  })

  describe('The getMethodURLPath function', () => {
    it('Should populate the query string with the given inputs, setting the URL according to the service type', () => {
      let journeyStops = new TestPlatformServices('Melbourne, Southern Cross', TestPlatformServices.BOTH, 50)
      expect(journeyStops.getMethodURLPath()).to.equal('/VLinePlatformServices.svc/web/GetPlatformTest?LocationName=Melbourne, Southern Cross&Direction=B&minutes=50')
    })
  })

  describe('The GetPlatformDeparturesAPI class', () => {
    it('Should provide the data as given in the API response', async () => {
      let stubAPI = new StubVLineAPI()
      stubAPI.setResponses([ stubPlatformDepartures ])
      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addVLine(stubAPI)

      let departures = await ptvAPI.vline.getDepartures('Melbourne, Southern Cross', TestPlatformServices.DOWN, 30)

      expect(departures).to.be.instanceOf(VLinePlatformServices)
      expect(departures[0]).to.be.instanceOf(VLinePlatformService)

      expect(departures[0].origin).to.equal('Melbourne, Southern Cross')
      expect(departures[0].destination).to.equal('Geelong Station: Railway Terrace')

      expect(departures[0].departureTime.toUTC().toISO()).to.equal('2024-07-12T12:45:00.000Z')
      expect(departures[0].arrivalTime.toUTC().toISO()).to.equal('2024-07-12T13:48:00.000Z')

      expect(departures[0].tdn).to.equal('8811')
      expect(departures[0].direction).to.equal('Down')

      expect(departures[0].platform).to.equal('16')

      expect(departures[0].estStationArrivalTime).to.be.null
      expect(departures[0].estArrivalTime).to.be.null
    })
  })

  describe('The GetPlatformArrivalsAPI class', () => {
    it('Should provide the data as given in the API response', async () => {
      let stubAPI = new StubVLineAPI()
      stubAPI.setResponses([ stubPlatformArrivals ])
      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addVLine(stubAPI)

      let arrivals = await ptvAPI.vline.getArrivals('Footscray Station', TestPlatformServices.UP, 30)

      expect(arrivals[0].origin).to.equal('Wendouree Station')
      expect(arrivals[0].destination).to.equal('Melbourne, Southern Cross')

      expect(arrivals[0].departureTime.toUTC().toISO()).to.equal('2024-07-12T10:51:00.000Z')
      expect(arrivals[0].arrivalTime.toUTC().toISO()).to.equal('2024-07-12T12:38:00.000Z')

      expect(arrivals[0].tdn).to.equal('8156')
      expect(arrivals[0].direction).to.equal('Up')

      expect(arrivals[0].platform).to.be.null

      expect(arrivals[0].estStationArrivalTime).to.not.be.null
      expect(arrivals[0].estStationArrivalTime.toUTC().toISO()).to.equal('2024-07-12T12:27:00.000Z')
      expect(arrivals[0].estArrivalTime.toUTC().toISO()).to.equal('2024-07-12T12:38:00.000Z')

      expect(arrivals[1].arrivalTime.toUTC().toISO()).to.equal('2024-07-12T12:47:00.000Z')
      expect(arrivals[1].estArrivalTime.toUTC().toISO()).to.equal('2024-07-12T12:48:00.000Z')
    })

    it('Should be able to fetch the stopping pattern', async () => {
      let stubAPI = new StubVLineAPI()
      stubAPI.setResponses([ stubPlatformArrivals, stubJourneyStops ])
      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addVLine(stubAPI)

      let arrivals = await ptvAPI.vline.getArrivals('Footscray Station', TestPlatformServices.UP, 30)
      let pattern = await arrivals[0].getStoppingPattern()

      expect(stubAPI.getCalls()[1].path).to.equal('https://api-jp.vline.com.au/Service/VLineServices.svc/web/GetJourneyStops?LocationName=Wendouree Station&DestinationName=Melbourne, Southern Cross&originDepartureTime=2024-07-12T10:51:00.000Z&originServiceIdentifier=8156&CallerID=123&AccessToken=ce31c8bb53fa483ac564c8fed8622265ebc81da5')
      expect(pattern[0].location).to.equal('Wendouree Station')
      expect(pattern[1].location).to.equal('Ballarat Station')

      expect(pattern[3].location).to.equal('Bacchus Marsh Station')
      expect(pattern[3].departureTime.toUTC().toISO()).to.equal('2024-07-12T11:48:00.000Z')
    })
  })
})