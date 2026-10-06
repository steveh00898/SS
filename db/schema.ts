import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const items=sqliteTable('items',{id:text('id').primaryKey(),data:text('data').notNull()});
export const catalogMeta=sqliteTable('catalog_meta',{key:text('key').primaryKey(),value:text('value').notNull()});
