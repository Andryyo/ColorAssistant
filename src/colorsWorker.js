/* eslint-disable no-undef */
import cielabDifference from './difference.js';
import vallejoGame from './VallejoGame';
import vallejoModel from './VallejoModel';
import citadel from './Citadel';
import armyPainter from './ArmyPainter';
import { convert } from 'chromatism';
import mixbox from 'mixbox';
import { db } from 'db.js';

var colors = null;

const createColor = (collection, name, hex, owned) => {
  let color, H, S, V;

  if (hex === '#000000') {
    H = 0;
    S = 0;
    V = 0;
    color = { L: 0, a: 0, b: 0 };
  } else if (hex === '#ffffff') {
    H = 0;
    S = 0;
    V = 100;
    color = { L: 100, a: 0, b: 0 };
  } else {
    const hsv = convert(hex).hsv;
    H = hsv.h;
    S = hsv.s;
    V = hsv.v;
    color = convert(hex).cielab;
  }

  return {
    collection: collection,
    name: name,
    hex: hex,
    color: color,
    H: Math.round(H),
    S: Math.round(S),
    V: Math.round(V),
    owned: owned
  };
};

const updateMinDelta = async () => {
  const colors = await db.colors.where('collection').notEqual('Mix').toArray();
  for (let color1 of colors) {
    const deltas = colors
      .filter((c) => c !== color1 && c.owned)
      .map((color2) => {
        const delta = Math.round(
          cielabDifference(color1.color, color2.color, 2, 1)
        );
        return delta;
      });
    color1.minDelta = Math.min(...deltas);
  }

  await db.colors.bulkPut(colors);
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
      const code = convert({
        r: mix[0],
        g: mix[1],
        b: mix[2]
      }).hex;

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
  await db.colors.bulkPut(colors);
  console.log('Saved colors');

  postMessage({ type: 'progressUpdate', value: 100 });
})();

self.onmessage = async (message) => {
  if (message.data.type === 'updateOwned') {
    postMessage({ type: 'progressUpdate', value: 0 });

    await db.colors
      .where(['collection', 'name', 'hex'])
      .equals([
        message.data.color.collection,
        message.data.color.name,
        message.data.color.hex
      ])
      .modify((c) => {
        c.owned = message.data.color.owned;
      });
    const mixes = await db.colors
      .where('bases')
      .equals([
        message.data.color.collection,
        message.data.color.name,
        message.data.color.hex
      ])
      .toArray();

    for (const mix of mixes) {
      const bases = await db.colors
        .where(['collection', 'name', 'hex'])
        .anyOf(mix.bases)
        .toArray();

      mix.owned = bases.every((b) => b.owned);
    }

    await db.colors.bulkPut(mixes);
    await updateMinDelta();

    postMessage({ type: 'progressUpdate', value: 0 });
  }
};
