export interface EventParser {
    parse(eventName: string, log: any): Promise<any>;
}