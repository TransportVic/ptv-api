import { VLineJPMethod } from './api-methods.mjs'

export class GetJourneysAPI extends VLineJPMethod {

  #origin
  #destination
  #lookBackwards

  #BASE_URL = '/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName={0}&DestinationName={1}&hasPrevious={2}'

  constructor(origin, destination, lookBackwards) {
    super()
    if (typeof lookBackwards === 'undefined') lookBackwards = false

    this.#origin = origin
    this.#destination = destination
    this.#lookBackwards = lookBackwards
  }

  getMethodName() {
    return 'JP_GETNEXTPREVIOUS5JOURNEYS'
  }

  getMethodURLPath() {
    return this.#BASE_URL.replace('{0}', this.#origin)
      .replace('{1}', this.#destination)
      .replace('{2}', this.#lookBackwards)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let journeyData = $('VJourney')

    let journeys = new VLineJourneys()
    
    for (let journey of journeyData) {
      journeys.push(VLineJourney.fromVLineData($, journey))
    }

    return journeys
  }

}

export class VLineJourneys extends Array {

}

export class VLineJourney {

  legs
  duration
  totalWaitTime
  maxWaitTime

  constructor(legs) {
    this.legs = legs
    this.calculateTravelTimes()
  }

  calculateTravelTimes() {
    this.duration = (this.legs[this.legs.length - 1].arrivalTime - this.legs[0].departureTime) / 1000 / 60

    let waitTimes = this.legs.map((leg, i) => {
      let waitTime = i === 0 ? 0 : (leg.departureTime - this.legs[i - 1].arrivalTime) / 1000 / 60
      leg.setWaitTime(waitTime)

      return waitTime
    })

    this.totalWaitTime = waitTimes.reduce((a, e) => a + e, 0)
    this.maxWaitTime = waitTimes.sort((a, b) => b - a)[0]
  }

  static fromVLineData($, journey) {
    let legs = Array.from($('VLeg', journey)).map(leg => this.processLeg($, leg))
    return new VLineJourney(legs)
  }

  static processLeg($, leg) {
    let origin = $('VOrigin', leg).text()
    let destination = $('VDestination', leg).text()

    let departureTime = $('VDepartureTime', leg).text()
    let departureTimeDate = new Date(departureTime)
    let arrivalTime = $('VArrivalTime', leg).text()
    let arrivalTimeDate = new Date(arrivalTime)

    let serviceOperator = $('VOperatorName', leg).text()
    let serviceDestination = $('VServiceDestination', leg).text()
    let runID = $('VServiceIdentifier', leg).text()

    let serviceType = $('VServiceType', leg).text()
    if (serviceType === 'Metropolitan') serviceType = 'Metro'

    return new VLineJourneyLeg(origin, destination, departureTimeDate, arrivalTimeDate, serviceOperator, serviceDestination, runID, serviceType)
  }

}

export class VLineJourneyLeg {

  origin
  destination
  departureTime
  arrivalTime
  operator
  serviceDestination
  runID
  serviceType
  duration
  waitTime

  constructor(origin, destination, departureTime, arrivalTime, operator, serviceDestination, runID, serviceType) {
    this.origin = origin
    this.destination = destination
    this.departureTime = departureTime
    this.arrivalTime = arrivalTime
    this.operator = operator
    this.serviceDestination = serviceDestination
    this.runID = runID
    this.serviceType = serviceType

    this.duration = (arrivalTime - departureTime) / 1000 / 60
  }

  setWaitTime(waitTime) {
    this.waitTime = waitTime
  }

}