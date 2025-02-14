import { DateTime } from 'luxon'

let melbourneTime = 'Australia/Melbourne'

// Note: Need to allow for SA time as PTV does not handle cross border times well... or at all
export function parseISOTime(time) {
  return DateTime.fromISO(time, { zone: melbourneTime })
}

export function parseMSTime(time) {
  return DateTime.fromMillis(time, { zone: melbourneTime })
}

export function parseDate(date) {
  let formats = ['yyyy-MM-dd', 'yyyy-MM-dd']
  for (let format of formats) {
    let parsed = DateTime.fromFormat(date, format, { zone: melbourneTime }) 
    if (!parsed.invalid) return parsed
  }
  return null
}

export function dateLikeToISO(date) {
  if (date instanceof Date) return date.toISOString()
  if (date instanceof DateTime) return date.toUTC().toISO()

  let parsed = parseISOTime(date)
  if (parsed.isValid) return parsed.toUTC().toISO()

  throw new RangeError(`${date} is not a valid time string!`)
}


let fakeDate = null

export function stubDate(target) {
  fakeDate = new Date(target)
}

export function unstubDate() {
  fakeDate = null
}

export function getDateNow() {
  return fakeDate || new Date()
}