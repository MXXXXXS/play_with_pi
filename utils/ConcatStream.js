class ConcatStream {
  constructor() {
    this.streams = []
  }

  push(readable) {
    this.streams.push(readable)
    return this
  }

  to(dest) {
    let streams = this.streams
    let index = 0
    let end = this.streams.length - 1
    let stop = false

    function pipe(dest) {
      if (!stop && index <= end) {
        console.log('ConcatStream start stream' + index)
        if (index === end) {
          streams[index].pipe(dest, {
            end: true
          })
        } else {
          streams[index].pipe(dest, {
            end: false
          })
        }

        streams[index].on('error', err => {
          stop = true
          console.error(`ConcatStream stream ${index} error`, err)
        })

        streams[index].on('end', () => {
          console.log(`ConcatStream stream ${index} end`)
          index++
          pipe(dest)
        })
      }
    }
    pipe(dest)
  }
}

module.exports = ConcatStream