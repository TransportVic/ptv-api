import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubNotifyData from './metro-site-mock-data/flemington-alert.json' with { type: 'json' }
import PTVAPI from '../lib/ptv-api.mjs'

let clone = o => JSON.parse(JSON.stringify(o))

describe('The MetroNotifyAlerts class', () => {
  describe('The fetch function', () => {
    it('Should return a list of MetroNotify alerts', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubNotifyData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let alerts = await ptvAPI.metroSite.getNotifyData()

      let flemington = alerts.find(alert => alert.rawID === '629190')
      expect(flemington.lineName).to.equal('Flemington Racecourse')
      expect(flemington.startTime.toISOString()).to.equal('2025-02-14T09:57:00.000Z')
      expect(flemington.endTime.toISOString()).to.equal('2025-02-14T11:40:00.000Z')
      expect(flemington.modifiedTime.toISOString()).to.equal('2025-02-14T09:57:31.000Z')
      expect(flemington.type).to.equal('major')
      expect(flemington.rawHTML).to.equal('<p>Delays up to 25 minutes due to police attending to trespassers in the Racecourse area.<\/p>\n<ul>\n<li>Trains may be held at available platforms.<\/li>\n<li>Trains may terminate\/originate at intermediate stations.<\/li>\n<\/ul>\n<p>Check information displays and listen for announcements as services may be altered at short notice.<\/p>')
      expect(flemington.html).to.equal('<p>Delays up to 25 minutes due to police attending to trespassers in the Racecourse area.<\/p>\n<ul>\n<li>Trains may be held at available platforms.<\/li>\n<li>Trains may terminate\/originate at intermediate stations.<\/li>\n<\/ul>\n<p>Check information displays and listen for announcements as services may be altered at short notice.<\/p>')
      expect(flemington.text).to.equal('Delays up to 25 minutes due to police attending to trespassers in the Racecourse area.\nTrains may be held at available platforms.\nTrains may terminate\/originate at intermediate stations.\nCheck information displays and listen for announcements as services may be altered at short notice.')
    })

    it('Should return a different ID if the alert text is changed', async () => {
      let stubAPI = new StubAPI()
      let updatedResponse = clone(stubNotifyData)
      updatedResponse[168307].alerts[0].alert_text = updatedResponse[168307].alerts[0].alert_text.replace('25', '50')

      stubAPI.setResponses([ stubNotifyData, updatedResponse ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let initialAlerts = await ptvAPI.metroSite.getNotifyData()
      
      let initialAlert = initialAlerts.find(alert => alert.rawID === '629190')
      expect(initialAlert.lineName).to.equal('Flemington Racecourse')
      
      let updatedAlerts = await ptvAPI.metroSite.getNotifyData()
      let updatedAlert = updatedAlerts.find(alert => alert.rawID === '629190')
      expect(updatedAlert.lineName).to.equal('Flemington Racecourse')
      expect(initialAlert.id).to.not.equal(updatedAlert.id)
    })
  })
})