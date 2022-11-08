import { LogUtils } from '../providers';
import { EventParser } from './event-parser';

export class StandardEventParser implements EventParser {
    private web3Abi;
    private cacheInputs = {};

    constructor(private readonly abi: any[]) {
        this.web3Abi = require('web3-eth-abi');
    }

    async parse(eventName: string, log: any): Promise<any> {
        let inputs = [];
        if (this.cacheInputs[eventName]) {
            inputs = this.cacheInputs[eventName];
        } else {
            for (const abiElement of this.abi) {
                if (abiElement.type === 'event' && abiElement.name === eventName) {
                    inputs = abiElement.inputs;
                    break;
                }
            }
        }
        log.topics.shift(); // Remove topics[0]
        const response = this.web3Abi.decodeLog(inputs, log.data, log.topics);
        delete response['__length__'];
        for (let i = 0; i < inputs.length; i++) {
            delete response[i.toString()];
        }
        return response;
    }
}