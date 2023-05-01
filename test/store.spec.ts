import { IndexedDb, Store } from '../src/store';
import { OrderBy, WhereCondition } from '../src/filters';

let stores: Store[];
const events = ['Event1', 'Event2'];

beforeAll(async () => {
    stores = [
        new IndexedDb("MemoryDb", '0x455F7Ef6D8BCfc35f9337e85aEe1B0600a59FabE', 1)
    ];
});

describe('Query3 Store', () => {
    it('should store and query last sync', async () => {
        for (const store of stores) {
            for (const event of events) {
                expect(await store.getLastSync(event)).toBe(null);
                const random = parseInt((Math.random() * 1000).toString());
                const lastBlock = 4000 + random;
                await store.setLastSync(event, lastBlock);
                expect(await store.getLastSync(event)).toBe(lastBlock);
            }
        }
    });

    it('should store and query events', async () => {
        for (const store of stores) {
            for (const event of events) {
                
                const basicQuery = async () => {
                    return await store.getEvents(event, [], {field: 'created', strategy: 'ASC'}, 1000, 0);
                }

                try {
                    await basicQuery();
                    expect(true).toBe(false);
                } catch (e) {
                    expect(e).toStrictEqual(new Error('Event not found on db'));
                }

                await store.saveEvents(event, []);
                expect(await basicQuery()).toStrictEqual([]);
                
                const eventsData = [
                    {
                        id: '1',
                        name: 'foo',
                        amount: '125000000000000000000',
                        created: 1677654574
                    },
                    {
                        id: '2',
                        name: 'bar',
                        amount: '126000000000000000000',
                        created: 1677658174
                    },
                    {
                        id: '3',
                        name: 'foo',
                        amount: '127000000000000000000',
                        created: 1677661774
                    },
                    {
                        id: '4',
                        name: ' bar2',
                        amount: '128000000000000000000',
                        created: 1677665374 
                    }
                ];

                await store.saveEvents(event, eventsData);

                const allEvents = await basicQuery();
                expect(allEvents.length).toBe(4);
                expect(allEvents).toEqual(eventsData);

                const eventsWithLimit = await store.getEvents(event, [], {field: 'created', strategy: 'ASC'}, 2, 2);
                expect(eventsWithLimit.length).toBe(2);
                expect(eventsWithLimit).toEqual([eventsData[2], eventsData[3]]);


                const eventsWithSort = await store.getEvents(event, [], {field: 'created', strategy: 'DESC'}, 100, 0);
                expect(eventsWithSort.length).toBe(4);
                const sortedEventsData = [...eventsData].sort((a, b) => a.created < b.created ? 1 : -1);
                expect(eventsWithSort).toEqual(sortedEventsData);
                
                const eventsWithWhereEq = await store.getEvents(event, [{key: 'name', value: 'foo', comparator: '='}], {field: 'created', strategy: 'ASC'}, 100, 0);
                expect(eventsWithWhereEq.length).toBe(2);
                expect(eventsWithWhereEq).toEqual([eventsData[0], eventsData[2]]);

                const eventsWithMultipleWhere = await store.getEvents(event, [{key: 'name', value: 'foo', comparator: '='}, {key: 'created', value: 1677658170, comparator: '>'}], {field: 'created', strategy: 'ASC'}, 100, 0);
                expect(eventsWithMultipleWhere.length).toBe(1);
                expect(eventsWithMultipleWhere).toEqual([eventsData[2]]);
            }
        }
    });
});