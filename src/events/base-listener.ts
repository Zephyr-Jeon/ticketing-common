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
  abstract queueGroupName: string;
  /* Code to set up the subscription */
  abstract onMessage(data: T['data'], msg: Message): void;
  /* Pre-initialized NATS client */
  private client: Stan;
  /* Number of seconds this listener has to ack a message */
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  /* Default subscription options */
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  /* Function to run when a message is reveiced */
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
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
