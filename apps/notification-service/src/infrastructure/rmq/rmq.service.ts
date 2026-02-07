import {Injectable} from '@nestjs/common';
import {RmqContext} from "@nestjs/microservices";

@Injectable()
export class RmqService {

    public ack(context: RmqContext): void {
        const channel = context.getChannelRef();
        const msg = context.getMessage();
        const tag = msg?.fields?.deliveryTag

        if (!tag) {
            return;
        }
        channel.ack(msg);
        console.log('ack: ' + context.getPattern() + " tag: " + tag);
    }

    public nack(context: RmqContext, requeue = false): void {
        const channel = context.getChannelRef();
        const msg = context.getMessage();
        const tag = msg?.fields?.deliveryTag
        if (!tag) {
            return;
        }

        channel.nack(msg, false, requeue);

        if (requeue) {
            console.log("NACK RESPONSE: pattern: " + context.getPattern() + " tag: " + tag);
        } else {
            console.log("NACK DROP: pattern: " + context.getPattern() + " tag: " + tag);
        }
    }

}
