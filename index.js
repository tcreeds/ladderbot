var Handler = require('./app/Handler')

exports.handler = (event, context, callback) => { console.log(process.env); new Handler(process.env.API_BASE).handle(event, context, callback) }