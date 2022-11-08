import { LogResponse } from './log-response';
import { Observable } from 'rxjs';

export interface LogProvider {

    /**
     * Obtain logs from the provider
     * @param address Contract address
     * @param logs Event name
     * @param abi JSON Abi
     */
    getLogs(address: string, eventName: string, abi: any[]): Promise<Observable<LogResponse>>;
}