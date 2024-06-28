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

  describe('The setVehicle function', () => {
    it('Should appropriately parse VehicleDescriptor data', () => {
      let run = new MetroRun(null, null, null, null, {
        "operator": "Metro Trains Melbourne",
        "id": "1312T-1429T-23M-24M-257M-258M",
        "low_floor": null,
        "air_conditioned": null,
        "description": "6 Car Xtrapolis",
        "supplier": "CIS - Metro Trains Melbourne",
        "length": "142"
      }, null, null, null, null)

      expect(run.vehicle.model).to.equal('Xtrapolis')
      expect(run.vehicle.cars).to.equal(6)
      expect(run.vehicle.motorCars).to.deep.equal(['23M', '24M', '257M', '258M'])
      expect(run.vehicle.trailerCars).to.deep.equal(['1312T', '1429T'])
    })

    it('Should handle HCMT data being formatted differently', () => {
      let run = new MetroRun(null, null, null, null, {
        "operator": "Metro Trains Melbourne",
        "id": "9032M-9932M",
        "low_floor": null,
        "air_conditioned": null,
        "description": "10-car HCMT",
        "supplier": "CIS - Metro Trains Melbourne",
        "length": "160"
      }, null, null, null, null)

      expect(run.vehicle.model).to.equal('HCMT')
      expect(run.vehicle.cars).to.equal(10)
      expect(run.vehicle.motorCars).to.deep.equal(['9032', '9932'])
      expect(run.vehicle.trailerCars).to.deep.equal([])
    })

    it('Should update the name Silver Hitachi to just Hitachi', () => {
      let run = new MetroRun(null, null, null, null, {
        "operator": "Metro Trains Melbourne",
        "id": "1946T-281M-282M",
        "low_floor": null,
        "air_conditioned": null,
        "description": "3 Car Silver Hitachi",
        "supplier": "CIS - Metro Trains Melbourne",
        "length": "71"
      }, null, null, null, null)

      expect(run.vehicle.model).to.equal('Hitachi')
      expect(run.vehicle.cars).to.equal(3)
      expect(run.vehicle.motorCars).to.deep.equal(['281M', '282M'])
      expect(run.vehicle.trailerCars).to.deep.equal(['1946T'])
    })
  })
})