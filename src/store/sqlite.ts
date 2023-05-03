import { Database, sqlite3 } from 'sqlite3';
import { WhereCondition, OrderBy } from '../filters';
import { Store } from './store';


export class SQLite implements Store {

    public static readonly SQLiteMemory = ':memory:';

    public db: Database;
    public connected = false;

    private createdTables = {};
    private path;

    constructor(directory = SQLite.SQLiteMemory, address, chainId) {
        let path = directory;
        if (path !== SQLite.SQLiteMemory) {
            path = directory + 'Query3_'+address+'_'+chainId+'.sql';
        }
        this.path = path;
    }

    async instanceDb(): Promise<void> {
        const sqlite3: sqlite3 = require('sqlite3').verbose();
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.path, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.connected = true;
                resolve();
            });

        });
    }

    async init(): Promise<void> {
        await this.instanceDb();
        await this.populateCollections();
    }

    async setLastSync(eventName: string, block: number): Promise<void> {
        if (!this.connected) {
            throw new Error('Db not opened');
        }
        await this.sqlRunAsync("INSERT INTO `syncs` (`name`, `block`) VALUES ($name, $block)", {
            $name: eventName,
            $block: block
        });
    }

    async getLastSync(eventName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM `syncs` WHERE `name` = $name', {
                $name: eventName
            }, (err, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                } else {
                    resolve(row.block);
                }
            })
        });
    }

    async saveEvents(eventName: string, events: any[]): Promise<void> {
        if (events.length == 0) {
            return;
        }
        const keys = Object.keys(events[0]);
        if (!this.createdTables[eventName.toLowerCase()]) {
            let tables = [];
            for (const key of keys) {
                let type = 'TEXT';
                if (typeof events[0][key] === 'number') {
                    type = 'INTEGER';
                }
                tables.push('`'+key + '` '+type+' NOT NULL');
            }
            await this.sqlRunAsync('CREATE TABLE IF NOT EXISTS `'+eventName.toLowerCase()+'` ('+tables.join(', ')+')', {});
            this.createdTables[eventName.toLowerCase()] = true;
        }
        this.db.run('begin transaction');
        events.map((event) => {
            this.db.run('INSERT INTO '+eventName.toLowerCase()+' VALUES ('+Object.values(event).map((value) => "'"+value+"'")+')');
        });
        return await this.sqlRunAsync('commit', {});

    }

    async getEvents(eventName: string, conditions: WhereCondition[], orderBy: OrderBy, limit: number, offset: number): Promise<any[]> {
        let orderBySQL = '';
        if (orderBy) {
            orderBySQL = 'ORDER BY `'+orderBy.field+'` '+orderBy.strategy;
        }
        let where = '';

        if (conditions.length > 0) {
            for (const condition of conditions) {
                if (where.length > 0) {
                    where += ' AND ';
                }
                where += '`' + condition.key + '` ' + condition.comparator + ' \''+ condition.value+'\'';
            }
            where = 'WHERE ' + where;
        }

        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM `'+eventName.toLowerCase()+'` '+where+' '+orderBySQL+' LIMIT '+ offset + ', '+limit, (err, rows) => {
                if (err) {
                    if (err.message.indexOf('no such table:') !== -1) {
                        resolve([]);
                        return;
                    }
                    reject(err);
                } else {
                    resolve(rows);
                }
            })

        });
    }
    
    private async populateCollections(): Promise<void> {
        await this.sqlRunAsync('CREATE TABLE IF NOT EXISTS `syncs` (name TEXT PRIMARY KEY, block INTEGER NOT NULL) WITHOUT ROWID', {});
    }

    private async sqlRunAsync<T>(sql: string, params: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (res, err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(res);
            })
        });
    }
}