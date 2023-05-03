# 🔎 ⛓ Query3.js

[![](https://badgen.net/npm/v/query3)](https://www.npmjs.com/package/query3) 

Query3 is a javascript library for storing smart contract events locally and do complex queries, like sorting, conditions and more.

It features two storage implementations, IndexedDB for running the library on the browser and SQLite when running it server-side.

## 🛠 Installation

```bash
npm install query3 --save
```

## ⭐️ Features
* **Event syncing**: Stores events locally, continue the syncing where you paused.
* **Multi chain**: Chain agnostinc. 
* **Multiple storage implementations**: Use our IndexedDB, SQLite implementation or create your own one.
* **Fast sync**

## 👨‍🚀 Example

```ts
const query3 = new Query3(
    erc20Address,
    erc20Abi,
    ['Transfer', 'Approve'],
    new InfuraProvider('mainnet', infuraApiKey),
    startBlock
);
await query3.sync();
const events = await query3.getEvents('Transfer');
```

You can find more examples on the "demos" folder. 

### 📖 Complex queries

```ts
const query3 = new Query3(
    erc20Address,
    erc20Abi,
    ['Transfer', 'Approve'],
    new InfuraProvider('mainnet', infuraApiKey)
);
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
        value: '0x000',
        comparator: '='
    }
];
const events = await query3.getEvents(
    'Transfer', 
    conditions,
    orderBy,
    limit,
    offset
);
```


### ⚙️ Full Config

```ts
const query3 = new Query3(
    address,
    abi,
    ['Transfer'],
    new RpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'),
    startBlock,
    new StandardEventParser(abi),
    new IndexedDb("IndexedDb")
)
```

## Stay in touch
- Author - [Nytyr](https://keybase.io/nytyr)
