import { RpcProvider } from './rpc-provider';

export enum AlchemyNetwork {
    ETH_MAINNET = 'eth-mainnet',
    ETH_GOERLI = 'eth-goerli',
    OPT_MAINNET = 'opt-mainnet',
    OPT_GOERLI = 'opt-goerli',
    ARB_MAINNET = 'arb-mainnet',
    ARB_GOERLI = 'arb-goerli',
    MATIC_MAINNET = 'polygon-mainnet',
    MATIC_MUMBAI = 'polygon-mumbai',
    ASTAR_MAINNET = 'astar-mainnet'
}

export class AlchemyProvider extends RpcProvider {
    constructor(
        network: AlchemyNetwork | string, 
        apiKey: string
    ) {
        super("https://"+network+".g.alchemy.com/v2/"+apiKey);
    }
}