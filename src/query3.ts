import { OrderBy, WhereCondition } from './filters';
import { EventParser, StandardEventParser } from './parsers';
import { AlchemyProvider, InfuraProvider, LogProvider, LogResponse, LogUtils } from './providers';
import { RpcProvider } from './providers/rpc-provider';
import { IndexedDb, Store } from './store';
import { Observable } from 'rxjs';

export class Query3 {

    public isSyncing = false;

    constructor(
        private readonly address: string,
        private readonly abi: any[],
        private readonly events: string[],
        private readonly provider: AlchemyProvider | InfuraProvider | RpcProvider | LogProvider,
        private readonly startBlock: number = 0,
        private readonly parser: EventParser = new StandardEventParser(abi),
        private readonly store: IndexedDb | Store = new IndexedDb(),
    ) {
    }

    async sync() {
        return new Promise<void>(async (resolve) => {
            this.isSyncing = true;
            for (const event of this.events) {
                let startBlock = await this.store.getLastSync(event);
                if (!startBlock) {
                    startBlock = this.startBlock;
                }
                
                const events: Observable<LogResponse> = await this.provider.getLogs(this.address, event, this.abi, startBlock);
                events.subscribe(async (eventResponse: LogResponse) => {
                    if (!eventResponse.logs.result || eventResponse.logs.result.length == 0) {
                        return;
                    }
                    const parsedEvents = [];
                    for (const log of eventResponse.logs.result) {
                        parsedEvents.push(await this.parser.parse(event, log));
                    }
                    await this.store.saveEvents(event, parsedEvents);
                    if (eventResponse.hasEndedSyncing) {
                        await this.store.setLastSync(event, eventResponse.lastBlock);
                        this.isSyncing = false;
                        resolve();
                    }
                });
            }
        });
    }

    async getLastSync(eventName: string): Promise<number> {
        return this.store.getLastSync(eventName);
    }

    getStore(): Store {
        return this.store;
    }

    async getEvents(eventName: string, conditions: WhereCondition[] = [], orderBy: OrderBy = null, limit: number = 500, offset: number = 0): Promise<any[]> {
        return this.store.getEvents(eventName, conditions, orderBy, limit, offset);
    }

}
