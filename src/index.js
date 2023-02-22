import _ from './config/env.js'
import { ListenerConfig } from './listener/index.js'
import debug from 'debug'
import express from 'express'

const logger = debug('info')
const app = express()

app.listen(process.env.PORT, _ => {
    logger('starting server on port ' + process.env.PORT)
})

ListenerConfig.init()