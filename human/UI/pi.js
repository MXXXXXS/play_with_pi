const pi = `ws://127.0.0.1:2333`
const ws = new WebSocket(pi)
ws.onopen = e => {
  console.log(`linked`)
  ws.send(`hello, pi`)
}

ws.onmessage = e => {
  console.log(`receieved: ` + e.data)
}