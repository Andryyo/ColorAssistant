import Dexie from 'dexie';

export const db = new Dexie('colors');
db.version(2).stores({
  colors: '[collection+name+hex], collection, name, hex, owned, *bases'
});
