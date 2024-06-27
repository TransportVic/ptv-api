import { expect } from 'chai'
import MetroRun from '../lib/metro/metro-run.mjs'

describe('The MetroRun class', () => {
  describe('The isViaLoop function', () => {
    describe('Non Dandenong group trains', () => {
      it('Should return false if 2nd digit is less than 5', () => {
        let viaLoopUp = MetroRun.isViaLoop('6000', 'Sunbury', 'Up')
        expect(viaLoopUp).to.be.false

        let viaLoopDown = MetroRun.isViaLoop('2321', 'Glen Waverley', 'Down')
        expect(viaLoopDown).to.be.false
      })

      it('Should return true if 2nd digit is greater than 5', () => {
        let viaLoopUp = MetroRun.isViaLoop('1800', 'Mernda', 'Up')
        expect(viaLoopUp).to.be.true

        let viaLoopDown = MetroRun.isViaLoop('7777', 'Craigieburn', 'Down')
        expect(viaLoopDown).to.be.true
      })
    })

    describe('Dandenong group trains operating with a Cxxx TDN', () => {
      it('Should return true for Up trains', () => {
        let viaLoopPKM = MetroRun.isViaLoop('C000', 'Pakenham', 'Up')
        expect(viaLoopPKM).to.be.true

        let viaLoopCBE = MetroRun.isViaLoop('C400', 'Cranbourne', 'Up')
        expect(viaLoopCBE).to.be.true
      })

      it('Should return false for Down trains', () => {
        let viaLoopPKM = MetroRun.isViaLoop('C001', 'Pakenham', 'Down')
        expect(viaLoopPKM).to.be.false

        let viaLoopCBE = MetroRun.isViaLoop('C401', 'Cranbourne', 'Down')
        expect(viaLoopCBE).to.be.false
      })
    })

    describe('Dandenong group trains operating with a 4xxx TDN', () => {
      it('Should return true for Up trains', () => {
        let viaLoopPKM = MetroRun.isViaLoop('4000', 'Pakenham', 'Up')
        expect(viaLoopPKM).to.be.true

        let viaLoopCBE = MetroRun.isViaLoop('4200', 'Cranbourne', 'Up')
        expect(viaLoopCBE).to.be.true
      })

      it('Should return false for Down trains', () => {
        let viaLoopPKM = MetroRun.isViaLoop('4001', 'Pakenham', 'Down')
        expect(viaLoopPKM).to.be.false

        let viaLoopCBE = MetroRun.isViaLoop('4201', 'Cranbourne', 'Down')
        expect(viaLoopCBE).to.be.false
      })
    })
  })
})