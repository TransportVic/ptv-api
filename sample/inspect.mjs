import util from 'util'

export default function inspect(e) {
  console.log(util.inspect(e, { depth: null, colors: true, maxArrayLength: null }))
}