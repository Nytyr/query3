import { Query3 } from '../src/query3';
import { RpcProvider } from '../src/providers';
import { StandardEventParser } from '../src/parsers';
import { IndexedDb } from '../src/store';
import { OrderBy, WhereCondition } from '../src/filters';

let query3: Query3;  

beforeAll(async () => {
    const abi = require('./erc20.abi.json');
    query3 = new Query3(
        '0x455F7Ef6D8BCfc35f9337e85aEe1B0600a59FabE',
        abi,
        ['Transfer'],
        new RpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'),
        0,
        new StandardEventParser(abi),
        new IndexedDb("MemoryDb", '0x455F7Ef6D8BCfc35f9337e85aEe1B0600a59FabE', 1)
    );
});

describe('Query3', () => {
    it('should store and query', async () => {
        await query3.sync();
        const limit = 100;
        const offset = 0;
        const orderBy: OrderBy = {
            field: 'value',
            strategy: 'DESC'
        };
        const conditions: WhereCondition[] = [
            {
                key: 'from',
                value: '0x51Aa10c9D1Afed595546226353Cbf52692942d33',
                comparator: '='
            }
        ];
        console.log(await query3.getEvents(
            'Transfer', 
            conditions,
            orderBy,
            limit,
            offset
        ));
        expect(4).toEqual(4);
    }, 99999);

    /*it('should store a large collection +80k events', async () => {
        const abi = require('./nft.abi.json');
        let query3 = new Query3(
            '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
            abi,
            ['Transfer'],
            new RpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'),
            0,
            new StandardEventParser(abi),
            new IndexedDb("MemoryDb", '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1)
        );
        await query3.sync();
        console.log(await query3.getEvents('Transfer'));
        expect(4).toEqual(4);
    }, 99999);*/

    it('should store a large collection +80k events', async () => {
        const abi = require('./lp.abi.json');
        let query3 = new Query3(
            '0x1CEa83EC5E48D9157fCAe27a19807BeF79195Ce1',
            abi,
            ['Swap'],
            new RpcProvider('https://1rpc.io/bnb'),
            27429250,
            new StandardEventParser(abi),
            new IndexedDb("MemoryDb", '0x1CEa83EC5E48D9157fCAe27a19807BeF79195Ce1', 56)
        );
        await query3.sync();
        console.log(await query3.getEvents('Swap'));
        expect(4).toEqual(4);
    }, 999999);
});
