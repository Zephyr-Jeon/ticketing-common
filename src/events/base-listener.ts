import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

export interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  /* Name of the channel this listener is going to listen to */
  abstract subject: T['subject'];
  /* Name of the queue group this listener will join */
  /* Queue group makes sure multiple instances of the same service are not all going to recevice the same event */
  abstract queueGroupName: string;
  /* Code to set up the subscription */
  abstract onMessage(data: T['data'], msg: Message): void;
  /* Pre-initialized NATS client */
  protected client: Stan;
  /* Number of seconds this listener has to ack a message */
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  /* Default subscription options */
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDeliverAllAvailable()
      .setDurableName(this.queueGroupName); // when subsriber
  }

  /* Function to run when a message is reveiced */
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName, // 1. only one of subscribers with the same queue group name is going to receive each event, 2. along with setDeliverAllAvailable, setDurableName options, makes sure not to remove the durable subscription when disconnected
      this.subscriptionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  /* Helper function to parse a message */
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
