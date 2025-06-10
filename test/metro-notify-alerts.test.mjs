import { StubAPI } from '../stub-api.mjs'
import { expect } from 'chai'
import stubNotifyData from './metro-site-mock-data/flemington-alert.json' with { type: 'json' }
import stubGeneralAlert from './metro-site-mock-data/general-alert.json' with { type: 'json' }
import stubServiceAlert from './metro-site-mock-data/service-alert.json' with { type: 'json' }
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
      expect(flemington.lineNames).to.have.members(['Flemington Racecourse'])
      expect(flemington.startTime.toISOString()).to.equal('2025-02-14T09:57:00.000Z')
      expect(flemington.endTime.toISOString()).to.equal('2025-02-14T11:40:00.000Z')
      expect(flemington.modifiedTime.toISOString()).to.equal('2025-02-14T09:57:31.000Z')
      expect(flemington.type).to.equal('major')
      expect(flemington.rawHTML).to.equal('<p>Delays up to 25 minutes due to police attending to trespassers in the Racecourse area.<\/p>\n<ul>\n<li>Trains may be held at available platforms.<\/li>\n<li>Trains may terminate\/originate at intermediate stations.<\/li>\n<\/ul>\n<p>Check information displays and listen for announcements as services may be altered at short notice.<\/p>')
      expect(flemington.html).to.equal('<p>Delays up to 25 minutes due to police attending to trespassers in the Racecourse area.<\/p>\n<ul>\n<li>Trains may be held at available platforms.<\/li>\n<li>Trains may terminate\/originate at intermediate stations.<\/li>\n<\/ul>\n<p>Check information displays and listen for announcements as services may be altered at short notice.<\/p>')
      expect(flemington.text).to.equal('Delays up to 25 minutes due to police attending to trespassers in the Racecourse area.\nTrains may be held at available platforms.\nTrains may terminate\/originate at intermediate stations.\nCheck information displays and listen for announcements as services may be altered at short notice.')
    })

    it('Should combine alerts for multiple lines into one', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubNotifyData ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let alerts = await ptvAPI.metroSite.getNotifyData()

      let hoppers = alerts.find(alert => alert.rawID === '629186')
      expect(hoppers.lineNames).to.have.members(['Werribee', 'Williamstown'])
      expect(hoppers.startTime.toISOString()).to.equal('2025-02-14T09:42:00.000Z')
      expect(hoppers.endTime.toISOString()).to.equal('2025-02-14T11:50:00.000Z')
      expect(hoppers.modifiedTime.toISOString()).to.equal('2025-02-14T09:49:34.000Z')
      expect(hoppers.type).to.equal('major')
      expect(hoppers.rawHTML).to.equal('<p>Delays up to 40 minutes after police attended to a trespasser in the Hoppers Crossing area.<\/p>\n<ul>\n<li>Trains may terminate\/originate at intermediate stations while we recover the timetable.<\/li>\n<\/ul>\n<p>Check information displays and listen for announcements as services may be altered at short notice.<\/p>')
      expect(hoppers.html).to.equal('<p>Delays up to 40 minutes after police attended to a trespasser in the Hoppers Crossing area.<\/p>\n<ul>\n<li>Trains may terminate\/originate at intermediate stations while we recover the timetable.<\/li>\n<\/ul>\n<p>Check information displays and listen for announcements as services may be altered at short notice.<\/p>')
      expect(hoppers.text).to.equal('Delays up to 40 minutes after police attended to a trespasser in the Hoppers Crossing area.\nTrains may terminate\/originate at intermediate stations while we recover the timetable.\nCheck information displays and listen for announcements as services may be altered at short notice.')
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
      
      let updatedAlerts = await ptvAPI.metroSite.getNotifyData()
      let updatedAlert = updatedAlerts.find(alert => alert.rawID === '629190')

      expect(initialAlert.id).to.not.equal(updatedAlert.id)
    })

    it('Should return general alerts together with the data', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubGeneralAlert ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let alerts = await ptvAPI.metroSite.getNotifyData()
      let general = alerts.find(alert => alert.type === 'general')
      expect(general.lineNames).to.have.members([
        'Alamein',               'Belgrave',
        'Craigieburn',           'Cranbourne',
        'Frankston',             'Glen Waverley',
        'Hurstbridge',           'Lilydale',
        'Pakenham',              'Sandringham',
        'Mernda',                'Stony Point',
        'Sunbury',               'Upfield',
        'Werribee',              'Williamstown',
        'Flemington Racecourse'
      ])
      expect(general.startTime.toISOString()).to.equal('2024-06-04T18:45:00.000Z')
      expect(general.endTime.toISOString()).to.equal('2024-06-05T00:45:00.000Z')
      expect(general.type).to.equal('general')
      expect(general.rawHTML).to.equal('<h1>Melbourne Central Station Closed</h1>\n<p>Melbourne Central station is currently closed due to a water leak.</p>\n<p>We are currently working to restore access to the station.</p>\n<p>Passengers wanting to travel to/from the Melbourne Central area may use either Flagstaff or Parliament stations or access other stations via Yarra Trams services.</p>')
      expect(general.html).to.equal('<h1>Melbourne Central Station Closed</h1>\n<p>Melbourne Central station is currently closed due to a water leak.</p>\n<p>We are currently working to restore access to the station.</p>\n<p>Passengers wanting to travel to/from the Melbourne Central area may use either Flagstaff or Parliament stations or access other stations via Yarra Trams services.</p>')
      expect(general.text).to.equal('Melbourne Central Station Closed\nMelbourne Central station is currently closed due to a water leak.\nWe are currently working to restore access to the station.\nPassengers wanting to travel to/from the Melbourne Central area may use either Flagstaff or Parliament stations or access other stations via Yarra Trams services.')
    })

    it('Should return TDNs for service alerts', async () => {
      let stubAPI = new StubAPI()
      stubAPI.setResponses([ stubServiceAlert ])
      stubAPI.skipErrors()

      let ptvAPI = new PTVAPI(stubAPI)
      ptvAPI.addMetroSite(stubAPI)

      let alerts = await ptvAPI.metroSite.getNotifyData()
      let general = alerts.find(alert => alert.rawID === '647069')
      expect(general.lineNames).to.have.members(['Mernda'])
      expect(general.type).to.equal('service')
      expect(general.rawHTML).to.equal('<p>The 8:46am Flinders Street to Epping service is currently running up to 10 minutes late.</p>')
      expect(general.text).to.equal('The 8:46am Flinders Street to Epping service is currently running up to 10 minutes late.')
      expect(general.runID).to.equal('1653')
    })
  })
})