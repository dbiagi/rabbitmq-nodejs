import amqp from 'amqplib';
import debug from 'debug'

const info = debug('rabbitmq:info')
const error = debug('rabbitmq:error')

const connectionConfig = {
    host: process.env.RABBIT_HOST,
    port: process.env.RABBIT_PORT,
    user: process.env.RABBIT_USER,
    password: process.env.RABBIT_PASSWORD
}

const DLX_PREFIX = 'dlx'
const DLQ_PREFIX = 'dlq'
const HEADERS = {
    queueMode: 'x-queue-mode'
}
const defaultExchangeConfig = {
    durable: true
}
const defaultQueueConfig = {
    durable: true,
    arguments: {
        [HEADERS.queueMode]: 'lazy'
    }
}

class RabbitClient {
    constructor() {
        this.conn = null
        this.channel = null
    }

    async _connect() {
        const url = `amqp://${connectionConfig.user}:${connectionConfig.password}@${connectionConfig.host}:${connectionConfig.port}/`
        this.conn = await amqp.connect(url)
            .then(conn => {
                info('connected to rabbitmq')
                return conn
            })
            .catch(err => {
                error(`cannot connect to rabbitmq on host ${connectionConfig.host}:${connectionConfig.port} with user ${connectionConfig.user}`)
                throw err
            })

        this.channel = await this.conn.createChannel()
        this.channel.prefetch(1)
    }

    async topic(exchangeName, queueName, routingKey) {
        const exchange = exchangeName
        const queue = queueName
        const dlx = DLX_PREFIX + '.' + exchangeName
        const dlq = DLQ_PREFIX + '.' + queueName

        const queueConfig = {
            ...defaultQueueConfig,
            deadLetterExchange: dlx
        }

        await Promise.all([
            this.channel.assertExchange(exchange, 'topic', defaultExchangeConfig),
            this.channel.assertExchange(dlx, 'topic', defaultExchangeConfig),
            this.channel.assertQueue(dlq, defaultQueueConfig),
            this.channel.assertQueue(queue, queueConfig)
        ])


        await Promise.all([
            this.channel.bindQueue(queue, exchange, routingKey),
            this.channel.bindQueue(dlq, dlx, queue)
        ])
    }

    async consume(msg, consumer) {
        consumer(msg)
            .then(_ => this.channel.ack(msg))
            .catch(err => {
                error('message rejected error=%s, payload=%s', JSON.stringify(err), msg.content.toString())
                this.channel.reject(msg, false)
            })
    }

    /**
     * Send message to exchange
     * 
     * @param {String} exchange 
     * @param {String} routingKey 
     * @param {Object} payload 
     */
    async send(exchange, routingKey, payload) {
        this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
            contentType: 'application/json'
        })
    }

    /**
     * Listen to queue
     * 
     * @param {String} queue 
     * @param {Function} listener 
     */
    async listen(queue, listener) {
        this.channel.consume(queue, msg => this.consume(msg, listener))
    }
}

const rabbitClient = new RabbitClient
await rabbitClient._connect()

export { rabbitClient }