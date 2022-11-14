import Dexie from 'dexie';

interface IData {
  id?: string,
  data?: Uint8Array
}

export interface IGalleryItem {
  id?: number,
  data?: Blob,
  preview?: Blob
}

class ColorsDatabase extends Dexie {

  data!: Dexie.Table<IData, string>;
  gallery!: Dexie.Table<IGalleryItem, number>;

  constructor() {
    super('colors');

    this.version(2).stores({
      colors: '[collection+name+hex], collection, name, hex, owned, *bases'
    });
    
    this.version(3).stores({
      data: 'id'
    });
    
    this.version(4).stores({
      data: 'id',
      gallery: '++id'
    });
    
  }

}

export const db = new ColorsDatabase();
