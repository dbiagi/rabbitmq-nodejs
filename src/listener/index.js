import { rabbitClient } from '../config/rabbitmq.js'
import { OrderCreatedListener } from './OrderCreatedListener.js'
import { QUEUES, EXCHANGES, ROUTING_KEYS } from '../config/bindings.js'

const listeners = {
    orderCreatedListener: new OrderCreatedListener()
}

const setupQueues = async _ => {
    return Promise.all([
        rabbitClient.topic(EXCHANGES.orderCreated, QUEUES.orderCreated, ROUTING_KEYS.orderCreated)
    ])
}

const setupConsumers = async _ => {
    return Promise.all([
        rabbitClient.listen(QUEUES.orderCreated, listeners.orderCreatedListener.onOrderCreated)
    ])
}

export class ListenerConfig {
    static async init() {
        await setupQueues()
        setupConsumers()
    }
}
