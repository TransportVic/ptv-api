import { expect } from 'chai'
import MetroUtils from '../lib/metro/metro-utils.mjs'

describe('The MetroUtils class', () => {
  describe('The getTDNFromRunRef function', () => {
    it('Should correctly convert a numeric 9XXYYY run reference to a metro TDN', async () => {
      let tdn = MetroUtils.getTDNFromRunRef('949234')
      expect(tdn).to.equal('1234')
    })

    it('Should correctly convert a alphanumeric 9XXYYY run reference to a metro TDN', async () => {
      let tdn = MetroUtils.getTDNFromRunRef('967234')
      expect(tdn).to.equal('C234')
    })
  })

  describe('The getRunRefFromTDN function', () => {
    it('Should correctly convert a numeric metro TDN to a run reference', async () => {
      let runRef = MetroUtils.getRunRefFromTDN('0800')
      expect(runRef).to.equal('948800')
    })

    it('Should correctly convert a alphanumeric metro TDN to a run reference', async () => {
      let runRef = MetroUtils.getRunRefFromTDN('Z999')
      expect(runRef).to.equal('990999')
    })
  })
})