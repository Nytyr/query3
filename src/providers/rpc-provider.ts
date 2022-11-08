import { LogProvider } from './log-provider';
import { LogResponse } from './log-response';
import { LogUtils } from './log-utils';
import fetch from 'node-fetch';
import { Observable, Subscriber } from 'rxjs';

export class RpcProvider implements LogProvider {

    private readonly utils = new LogUtils();

    constructor(private readonly serverURL: string) {
    }

    async getLogs(address: string, eventName: string, abi: any[], startBlock: number = 0): Promise<Observable<LogResponse>> {
        const lastBlock = await this.getLastBlock();
        return new Observable<LogResponse>((subscriber: Subscriber<LogResponse>) => {
            this.readEventsRange(address, this.utils.eventToTopics(eventName, abi),  startBlock, lastBlock, subscriber, lastBlock);
        });
    }

    private async getLastBlock(): Promise<number> {
        const response = await this.queryNode('eth_getBlockByNumber', ["latest", false]);
        if (response.error) {
            throw new Error(response.error);
        }
        return this.utils.hexToNumber(response.result.number);
    }

    private async getRawLogs(address: string, topics: string[], fromBlock: number, toBlock: number | string): Promise<any> {
        return await this.queryNode('eth_getLogs', [{fromBlock: this.utils.numberToHex(fromBlock),
            toBlock: toBlock == 'latest' ? toBlock : this.utils.numberToHex(Number(toBlock)),
            topics,
            address,
        }]);
    }

    private runningJobs = 0;

    private async readEventsRange(
        address: string, topics: string[], start: number, end: number, subscriber: Subscriber<LogResponse>, lastBlockChecked: number
    ) {
        this.runningJobs += 1;
        const events = await this.getRawLogs(address, topics, start, end);
        this.runningJobs -= 1;
        if (events.error) {
            if (events.error.code === -32005) { // Rate exceed
                const middle = Math.round((start + end) / 2);
                this.readEventsRange(address, topics, start, middle, subscriber, lastBlockChecked);
                this.readEventsRange(address, topics, middle + 1, end, subscriber, lastBlockChecked);
            } else {
                throw new Error(events.error);
            }
        } else {
            subscriber.next({
                logs: events,
                hasEndedSyncing: this.runningJobs === 0,
                lastBlock: lastBlockChecked
            });
        }
    }
    
    private async queryNode(method: string, params: any[]): Promise<any> {
        return await (await fetch(this.serverURL, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: + new Date(),
                method,
                params: params,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })).json();
    }
}