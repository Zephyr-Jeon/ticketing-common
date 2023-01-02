import { Event } from './base-listener';
import { Subjects } from './subjects';

export interface TicketUpdatedEvent extends Event {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    orderId?: string;
  };
}
