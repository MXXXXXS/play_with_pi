const Gpio = require('onoff').Gpio
const led = new Gpio(21, 'out')

const iv = setInterval(() => led.writeSync(led.readSync() ^ 1), 200)

setTimeout(() => {
  clearInterval(iv)
  led.unexport()
}, 5000)