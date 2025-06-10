export class MetroNotifyAlerts extends Array {

  constructor(websiteData) {
    super()
    for (let line of Object.keys(websiteData)) {
      if (!line.match(/^\d+$/)) continue
      let lineData = websiteData[line]
      let alerts = lineData.alerts
      if (typeof alerts === 'string') continue
      for (let alert of alerts) this.push(MetroNotifyAlert.fromData(alert))
    }
  }

}

export class MetroNotifyAlert {

  rawID
  startTime
  endTime
  modifiedTime
  type
  rawHTML

  constructor(id, startTime, endTime, modifiedTime, type, html) {
    this.rawID = id
    this.startTime = new Date(startTime * 1000)
    this.endTime = new Date(endTime * 1000)
    this.modifiedTime = new Date(modifiedTime * 1000)
    this.type = type
    this.rawHTML = html
  }

  static fromData(data) {
    return new MetroNotifyAlert(
      data.alert_id,
      parseInt(data.from_date),
      parseInt(data.to_date),
      parseInt(data.modified),
      data.alert_type,
      data.alert_text
    )
  }

}