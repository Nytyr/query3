import { WhereCondition, OrderBy } from '../filters';

export interface Store {
    setLastSync(eventName: string, block: number): Promise<void>;
    getLastSync(eventName: string): Promise<number>;
    saveEvents(eventName: string, events: any[]): Promise<void>;
    getEvents(eventName: string, conditions: WhereCondition[], orderBy: OrderBy, limit: number, offset: number): Promise<any[]>;
}