import debug from 'debug'

const info = debug('info:order:created')

export class OrderCreatedListener {
    constructor() {
        this.orderService = null
    }

    async onOrderCreated(order) {
        info('order created', order)
    }
}