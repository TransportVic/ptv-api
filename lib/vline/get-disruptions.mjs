import { parseISOTime } from "../date-utils.mjs"
import { VLineStatusMethod } from "./api-methods.mjs"

export class GetPlannedDisruptionsAPI extends VLineStatusMethod {

  #line
  #days
  #includeProposed

  #BASE_URL = '/VLineService.svc/web/GetPublishedPlannedDisruptions?LineCode={0}&MaximumDays={1}&IncludeProposed={2}'

  constructor(line, days, includeProposed) {
    super()
    if (typeof days === 'undefined') days = 14
    if (typeof includeProposed === 'undefined') includeProposed = true

    this.#line = line
    this.#days = days
    this.#includeProposed = includeProposed
  }

  getMethodName() {
    return 'JP_GETPLANNEDDISRUPTIONS'
  }

  getMethodURLPath() {
    return this.#BASE_URL.replace('{0}', this.#line)
      .replace('{1}', this.#days)
      .replace('{2}', this.#includeProposed)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let disruptionData = $('VPlannedDisruption')

    let disruptions = new VLineDisruptions()

    for (let disruption of disruptionData) {
      disruptions.push(VLineDisruption.fromPlannedData($, disruption))
    }

    return disruptions
  }
}

export class GetLiveDisruptionsAPI extends VLineStatusMethod {

  #line

  #BASE_URL = '/VLineService.svc/web/GetPublishedLiveDisruptions?LineCode={0}'

  constructor(line, days, includeProposed) {
    super()
    if (typeof days === 'undefined') days = 14
    if (typeof includeProposed === 'undefined') includeProposed = true

    this.#line = line
  }

  getMethodName() {
    return 'JP_GETLIVEDISRUPTIONS'
  }

  getMethodURLPath() {
    return this.#BASE_URL.replace('{0}', this.#line)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let disruptionData = $('VLiveDisruption')

    let disruptions = new VLineDisruptions()

    for (let disruption of disruptionData) {
      disruptions.push(VLineDisruption.fromLiveData($, disruption))
    }

    return disruptions
  }
}

export class VLineDisruptions extends Array {

  static BALLARAT = 'BAL'
  static BENDIGO = 'BEN'
  static GEELONG = 'GEE'
  static GIPPSLAND = 'GIP'
  static SEYMOUR = 'SEY'

}

export class VLineDisruption {

  title
  details
  startTime
  endTime
  proposed
  disruptionID
  link
  type

  constructor(type, title, details, startTime, endTime, proposed, disruptionID, link) {
    this.type = type
    this.title = title
    this.details = details
    this.startTime = startTime
    this.endTime = endTime
    this.proposed = proposed
    this.disruptionID = disruptionID
    this.link = link
  }

  static fromPlannedData($, disruption) {
    let title = $('VTitle', disruption).text()
    let startTime = parseISOTime($('VScheduledStartUtc', disruption).text() + 'Z')
    let endTime =  parseISOTime($('VScheduledEndUtc', disruption).text() + 'Z')
    let proposed = $('VProposed', disruption).text()
    let disruptionID = $('VPlannedDisruptionId', disruption).text()
    let link = $('VLink', disruption).text()

    return new VLineDisruption(
      'PLANNED',
      title,
      null,
      startTime,
      endTime,
      proposed,
      disruptionID,
      link
    )
  }

  static fromLiveData($, disruption) {
    let title = VLineStatusMethod.sanitise($('VTitle', disruption).text())
    let details = VLineStatusMethod.sanitise($('VDescription', disruption).text())

    return new VLineDisruption(
      'LIVE',
      title,
      details,
      null, null, null, null, null
    )
  }
}