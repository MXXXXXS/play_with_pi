const {
  Readable
} = require(`stream`)

class BufStream extends Readable {
  constructor (buffer, opts) {
    super(opts)
    if (opts) {
      this.chunkSize = opts.highWaterMark / 4
    } else {
      this.chunkSize = 16384 / 4
    }
    this.start = 0
    this.end = this.start + this.chunkSize
    this.buf = buffer
    this.bufLength = buffer.length
    this.notDrained = true
  }

  _read () {
    let chunk
    const push = (chunk, isEnd = false) => {
      if (this.notDrained) {
        if (!isEnd) {
          this.start += this.chunkSize
          this.end += this.chunkSize
          this.notDrained = this.push(chunk)
        } else if (isEnd) {
          this.push(chunk)
          this.push(null)
        }
      }
    }
    if (this.start <= this.bufLength) {
      if (this.end > this.bufLength + 1) {
        chunk = this.buf.slice(this.start, this.bufLength + 1)
        push(chunk, true)
      } else {
        chunk = this.buf.slice(this.start, this.end)
        push(chunk)
      }
    }
  }
}

module.exports = BufStream