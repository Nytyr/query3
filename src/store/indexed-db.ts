import { WhereCondition, OrderBy } from '../filters';
import { Store } from './store';
import * as minimongo from 'minimongo';

export class IndexedDb implements Store {

    public db;

    constructor(implementation: 'IndexedDb' | 'MemoryDb' = 'IndexedDb') {
        this.db = new minimongo[implementation]({namespace: 'Query3'}, undefined, undefined);
        this.populateCollections();
    }

    async setLastSync(eventName: string, block: number): Promise<void> {
        await this.db.query3.upsert({key: "last_sync_"+eventName, value: block});
    }

    async getLastSync(eventName: string): Promise<number> {
        const res = await this.db.query3.findOne({key: "last_sync_"+eventName});
        if (!res) {
            return null;
        }
        return res.value;
    }

    async saveEvents(eventName: string, events: any[]): Promise<void> {
        if (!this.db[eventName.toLowerCase()]) {
            await this.db.addCollection(eventName.toLowerCase());
        }
        await this.db[eventName.toLowerCase()].upsert(events);
        
    }

    async getEvents(eventName: string, conditions: WhereCondition[], orderBy: OrderBy, limit: number, offset: number): Promise<any[]> {
        if (!this.db[eventName.toLowerCase()]) {
            throw new Error('Event not found on db');
        }
        let sort = [];
        if (orderBy) {
            sort = [[orderBy.field, orderBy.strategy.toLowerCase()]]
        }
        const where = {};
        for (const condition of conditions) {
            if (condition.comparator === '=') {
                where[condition.key] = condition.value;
            }
            if (condition.comparator === '>') {
                where[condition.key] = { $gt: condition.value };
            }
            if (condition.comparator === '<') {
                where[condition.key] = { $lt: condition.value };
            }
            if (condition.comparator === '!=') {
                where[condition.key] = { $ne: condition.value };
            }
        }
        return await this.db[eventName.toLowerCase()].find(where, {
            limit, skip: offset, sort
        }).fetch();
    }
    
    private async populateCollections(): Promise<void> {
        await this.db.addCollection("query3");
    }
}