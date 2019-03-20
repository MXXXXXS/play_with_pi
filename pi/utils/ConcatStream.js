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

    async function pipe(dest, index) {
      if (!stop && index <= end) {
        let pipeline = new Promise((res, rej) => {
          let writeable
          if (index === end) {
            writeable = streams[index].pipe(dest, {
              end: true
            })
          } else {
            writeable = streams[index].pipe(dest, {
              end: false
            })
          }

          streams[index].on('error', err => {
            rej(err)
          })

          streams[index].on('end', () => {
            res(writeable)
          })
        }).catch((err) => {
          stop = true
          console.error('Error on stream' + index + '\n' + err)
        })

        pipe(await pipeline, ++index)
      }
    }
    pipe(dest, index)
  }
}

module.exports = ConcatStream