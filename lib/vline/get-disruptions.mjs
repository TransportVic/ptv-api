import { VLineStatusMethod } from "./api-methods.mjs"

export class GetPlannedDisruptionsAPI extends VLineStatusMethod {

  #line
  #days
  #includeProposed

  #BASE_URL = '/VLineService.svc/web/GetPublishedPlannedDisruptions?LineCode={0}&MaximumDays={1}&IncludeProposed={2}'

  constructor(line, days, includeProposed) {
    super()
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
    let disruptionData = $('PlannedDisruption')

    let disruptions = new VLineDisruptions()

    for (let disruption of disruptionData) {
      disruptions.push(VLineDisruption.fromPlannedData($, disruption))
    }

    return disruptions
  }
}

export class VLineDisruptions extends Array {

  BALLARAT = 'BAL'
  BENDIGO = 'BEN'
  GEELONG = 'GEE'
  GIPPSLAND = 'GIP'
  SEYMOUR = 'SEY'

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
    let title = $('Title', disruption).text()
    let startTime = new Date($('ScheduledStartUtc', disruption).text() + 'Z')
    let endTime =  new Date($('ScheduledEndUtc', disruption).text() + 'Z')
    let proposed = $('Proposed', disruption).text()
    let disruptionID = $('PlannedDisruptionId', disruption).text()
    let link = $('Link', disruption).text()

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

}