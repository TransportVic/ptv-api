import { expect } from 'chai'
import { parseISOTime } from '../lib/date-utils.mjs'

describe('The Melbourne time parser', () => {
  it('Should take a relative timezone timestamp and convert it to a UTC timestamp, across DST periods', () => {
    expect(parseISOTime('2024-07-13T08:12:00').toUTC().toISO()).to.equal('2024-07-12T22:12:00.000Z')
    expect(parseISOTime('2024-02-13T08:12:00').toUTC().toISO()).to.equal('2024-02-12T21:12:00.000Z')
  })
})