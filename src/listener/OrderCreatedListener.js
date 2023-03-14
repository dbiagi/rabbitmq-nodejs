import debug from 'debug'

const info = debug('info:order:created')

export class OrderCreatedListener {
    constructor() {
        this.orderService = null
    }

    async onOrderCreated(msg) {
        const order = msg.content.toString()
        info('order created', order)
    }
}