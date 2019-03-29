const testEvent = require('./testEvent')
const handler = require('./')
process.env.API_BASE = 'http://localhost:8000'
handler.handler(testEvent.module, '', (dunno, res) => {
    console.log(res)
})