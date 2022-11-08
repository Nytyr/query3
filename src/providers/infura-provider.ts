import { RpcProvider } from './rpc-provider';

export class InfuraProvider extends RpcProvider {
    constructor(
        network: "mainnet" | "goerli" | string, 
        apiKey: string
    ) {
        super("https://"+network+".infura.io/v3/"+apiKey);
    }
}