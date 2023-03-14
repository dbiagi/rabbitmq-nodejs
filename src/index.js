import _ from './config/env.js'
import { ListenerConfig } from './listener/index.js'
import { rabbitClient } from './config/rabbitmq.js'
import debug from 'debug'
import express from 'express'
import {EXCHANGES, ROUTING_KEYS} from './config/bindings.js'

const DEFAULT_PORT = 8080
const info = debug('info')
const app = express()
app.use(express.json())

app.listen(process.env.PORT || DEFAULT_PORT, _ => {
    info('starting server on port ' + process.env.PORT)
})

app.post('/send', (req, res) => {
    info('sending msg to queue with payload=%s', req.body)
    rabbitClient.send(EXCHANGES.orderCreated, ROUTING_KEYS.orderCreated, req.body) 
    res.json({'status': 'sending'})
})

ListenerConfig.init()