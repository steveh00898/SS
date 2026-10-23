import {sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const items=sqliteTable('items',{id:text('id').primaryKey(),data:text('data').notNull()});
export const catalogMeta=sqliteTable('catalog_meta',{key:text('key').primaryKey(),value:text('value').notNull()});
// SKU practice: one row per answered field; id is "<user>:<record id>", data is the JSON record.
export const practiceAttempts=sqliteTable('practice_attempts',{id:text('id').primaryKey(),userId:text('user_id').notNull(),at:text('at').notNull(),data:text('data').notNull()},t=>[index('practice_attempts_user_at').on(t.userId,t.at)]);
// One row per learner: shown to the admin in the Accounts view. Email only when the platform sends it; name is chosen by the learner.
export const practiceUsers=sqliteTable('practice_users',{userId:text('user_id').primaryKey(),email:text('email'),name:text('name').notNull().default(''),firstSeen:text('first_seen').notNull(),lastSeen:text('last_seen').notNull()});
