/* eslint-disable no-undef */
import vallejoGame from './VallejoGame';
import vallejoModel from './VallejoModel';
import citadel from './Citadel';
import armyPainter from './ArmyPainter';
import mixbox from 'mixbox';
import { db } from 'db.js';
import * as culori from 'culori';

const difference = culori.differenceCiede2000();

var colors = null;

const createColor = (collection, name, hex, owned) => {
  const color = culori.lab65(hex);
  const hsv = culori.hsv(color);

  return {
    collection: collection,
    name: name,
    hex: hex,
    color: color,
    H: Math.round(hsv.h || 0),
    S: Math.round(hsv.s),
    V: Math.round(hsv.v),
    owned: owned
  };
};

const updateMinDelta = async () => {
  await db.transaction('rw', db.colors, async () => {
    const colors = await db.colors
      .where('collection')
      .notEqual('Mix')
      .toArray();
    for (let color1 of colors) {
      const deltas = colors
        .filter((c) => c !== color1 && c.owned)
        .map((color2) => {
          const delta = Math.round(difference(color1.color, color2.color));
          return delta;
        });
      await db.colors.update([color1.collection, color1.name, color1.hex], {
        minDelta: Math.min(...deltas)
      });
    }
  });
};

const getCollection = (collection, data) => {
  return data
    .split('\n')
    .filter((s) => s)
    .map((s) => {
      const code = s.substring(s.indexOf('#'));
      const name = s.substring(0, s.indexOf('#') - 1);
      return createColor(collection, name, code, false);
    });
};

const colorToBase = (color) => {
  return [color.collection, color.name, color.hex];
};

(async () => {
  if ((await db.colors.count()) > 0) {
    return;
  }

  console.log('Starting generation');

  colors = [];
  let baseColors = [];
  getCollection('Vallejo Game Colors', vallejoGame).forEach((c) =>
    baseColors.push(c)
  );
  getCollection('Vallejo Model Colors', vallejoModel).forEach((c) =>
    baseColors.push(c)
  );
  getCollection('Citadel', citadel).forEach((c) => baseColors.push(c));
  getCollection('Army Painter', armyPainter).forEach((c) => baseColors.push(c));

  baseColors.forEach((c) => colors.push(c));

  let mixes = [];

  const step = Math.ceil(baseColors.length / 100);

  for (let i = 0; i < baseColors.length; i++) {
    for (let j = i + 1; j < baseColors.length; j++) {
      const mix = mixbox.lerp(baseColors[i].hex, baseColors[j].hex, 0.5);
      const code = culori.formatHex({
        mode: 'rgb',
        r: mix[0] / 256,
        g: mix[1] / 256,
        b: mix[2] / 256
      });

      const name =
        baseColors[i].collection +
        ' ' +
        baseColors[i].name +
        '+' +
        baseColors[j].collection +
        ' ' +
        baseColors[j].name;

      const color = createColor('Mix', name, code, false);

      mixes.push({
        ...color,
        bases: [colorToBase(baseColors[i]), colorToBase(baseColors[j])]
      });
    }

    if (i % step == 0) {
      postMessage({ type: 'progressUpdate', value: i / step });
    }
  }

  colors.push(...mixes);

  postMessage({ type: 'progressUpdate', value: 95 });

  console.log('Saving colors', colors.length);
  await db.colors.bulkAdd(colors);
  console.log('Saved colors');

  postMessage({ type: 'progressUpdate', value: 100 });
})();

self.onmessage = async (message) => {
  if (message.data.type === 'updateOwned') {
    postMessage({ type: 'progressUpdate', value: 0 });

    await db.transaction('rw', db.colors, async () => {
      await db.colors
        .where(['collection', 'name', 'hex'])
        .equals([
          message.data.color.collection,
          message.data.color.name,
          message.data.color.hex
        ])
        .modify((c) => {
          c.owned = message.data.color.owned;
          console.log('Update', c);
        });

      postMessage({ type: 'progressUpdate', value: 10 });

      const mixes = await db.colors
        .where('bases')
        .equals([
          message.data.color.collection,
          message.data.color.name,
          message.data.color.hex
        ])
        .toArray();

      postMessage({ type: 'progressUpdate', value: 20 });

      let i = 0;

      for (const mix of mixes) {
        const bases = await db.colors
          .where(['collection', 'name', 'hex'])
          .anyOf(mix.bases)
          .toArray();

        await db.colors.update([mix.collection, mix.name, mix.hex], {
          owned: bases.every((b) => b.owned)
        });

        postMessage({
          type: 'progressUpdate',
          value: 30 + Math.round((i++ * 10) / mixes.length)
        });
      }
    });

    postMessage({ type: 'progressUpdate', value: 40 });

    updateMinDelta();

    postMessage({ type: 'progressUpdate', value: 100 });
  }
};
