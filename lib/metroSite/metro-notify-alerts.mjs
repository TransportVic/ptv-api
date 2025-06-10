import metroSiteData from './metro-site-data.json' with { type: 'json' }
import sanitiseHTML from 'sanitize-html'
import crypto from 'crypto'

const notifyLines = Object.values(metroSiteData.lines).reduce((acc, e) => {
  acc[e.lineID] = e.lineName
  return acc
}, {})

const sha256 = input => crypto.createHash('sha256').update(input).digest('hex')

export class MetroNotifyAlerts extends Array {

  constructor(websiteData) {
    super()

    let mergedAlerts = {}
    for (let lineID of Object.keys(websiteData)) {
      if (!lineID.match(/^\d+$/)) continue
      let lineData = websiteData[lineID]
      let alerts = lineData.alerts
      if (typeof alerts === 'string') continue
      for (let alert of alerts) {
        if (mergedAlerts[alert.alert_id]) {
          mergedAlerts[alert.alert_id].lineIDs.push(lineID)
        } else mergedAlerts[alert.alert_id] = {
          ...alert,
          lineIDs: [lineID]
        }
      }
    }

    if (websiteData.general) {
      let alert = websiteData.general
      let alertID = alert.from_date + alert.to_date

      mergedAlerts[alertID] = {
        ...alert,
        lineIDs: Object.keys(notifyLines),
        alert_id: alertID,
        alert_type: 'general',
        alert_text: `<h1>${alert.title}</h1>\n${alert.body}`
      }
    }

    for (let alert of Object.values(mergedAlerts)) this.push(MetroNotifyAlert.fromData(alert))
  }
}

export class MetroNotifyAlert {

  id
  lineNames
  rawID
  startTime
  endTime
  modifiedTime
  type
  rawHTML

  constructor(lineIDs, id, startTime, endTime, modifiedTime, type, html) {
    this.lineNames = Object.keys(lineIDs.reduce((acc, lineID) => {
      acc[notifyLines[lineID]] = 1
      return acc
    }, {}))
    this.rawID = id
    this.startTime = new Date(startTime * 1000)
    this.endTime = new Date(endTime * 1000)
    this.modifiedTime = new Date(modifiedTime * 1000)
    this.type = type
    this.rawHTML = html.trim()

    this.html = sanitiseHTML(html).trim()
    this.text = sanitiseHTML(html, {
      allowedTags: [],
      allowedAttributes: {}
    }).replace(/\n+/g, '\n').trim()

    this.id = sha256(id + type + this.text)
  }

  static fromData(data) {
    return new MetroNotifyAlert(
      data.lineIDs,
      data.alert_id,
      parseInt(data.from_date),
      parseInt(data.to_date),
      parseInt(data.modified),
      data.alert_type,
      data.alert_text
    )
  }

}