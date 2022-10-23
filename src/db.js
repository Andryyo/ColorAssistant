import Dexie from 'dexie';

export const db = new Dexie('colors');
db.version(2).stores({
  colors: '[collection+name+hex], collection, name, hex, owned, *bases'
});

db.version(3).stores({
  data: 'id'
});

db.version(4).stores({
  data: 'id',
  gallery: '++id'
});
