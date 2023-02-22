import { RabbitClient } from '../config/rabbitmq.js'
import { OrderCreatedListener } from './OrderCreatedListener.js'
import {QUEUES, EXCHANGES, ROUTING_KEYS} from '../config/bindings.js'

const rabbitConfig = new RabbitClient
const listeners = {
    orderCreatedListener: new OrderCreatedListener()
}

const setupQueues =  async _ => {
    return Promise.all([
        rabbitConfig.topic(EXCHANGES.orderCreated, QUEUES.orderCreated, ROUTING_KEYS.orderCreated)
    ])
}

const setupConsumers = async _ => {
    return Promise.all([
        rabbitConfig.channel.consume(QUEUES.orderCreated, msg => rabbitConfig.consume(msg, listeners.orderCreatedListener.onOrderCreated))
    ])
}

export class ListenerConfig {
    static async init() {
        await rabbitConfig.connect()
        await setupQueues()
        setupConsumers()
    }
}
