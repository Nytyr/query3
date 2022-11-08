export class LogUtils {
    private web3Utils;

    constructor() {
        this.web3Utils = require('web3-utils');
    }

    eventToTopics(eventName: string, abi: any[]): string[] {
        let argumentTypes = [];
        for (const abiElement of abi) {
            if (abiElement.type === 'event' && abiElement.name === eventName) {
                for (const arg of abiElement.inputs) {
                    argumentTypes.push(arg.type);
                }
                break;
            }
        }
        return [this.web3Utils.sha3(eventName+"("+argumentTypes.join(',')+")")]
    }

    numberToHex(a: number): string {
        return this.web3Utils.numberToHex(a);
    }
    

    hexToNumber(a: string): number {
        return this.web3Utils.hexToNumber(a);
    }
}