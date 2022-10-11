/* eslint-disable no-undef */
import vallejoGame from './VallejoGame';
import vallejoModel from './VallejoModel';
import citadel from './Citadel';
import armyPainter from './ArmyPainter';
import mixbox from 'mixbox';
import { db } from 'db.js';
import * as culori from 'culori';
import { ColorsMessage } from 'ColorsMessage';

const difference = culori.differenceCiede2000();

var colors = [];

const createColor = (collection, name, hex, owned) => {
  const color = culori.lab65(hex);
  const hsv = culori.hsv(color);

  return {
    collection: collection,
    name: name,
    hex: hex,
    color: color,
    H: Math.round(hsv.h || 0),
    S: Math.round(hsv.s * 100),
    V: Math.round(hsv.v * 100),
    owned: owned
  };
};

const updateMinDelta = () => {
  const baseColors = colors.filter((color) => color.bases?.length === 0);
  for (let color1 of baseColors) {
    const deltas = baseColors
      .filter((c) => c !== color1 && c.owned)
      .map((color2) => {
        const delta = Math.round(difference(color1.color, color2.color));
        return delta;
      });

    color1.minDelta = Math.min(...deltas);
  }
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

const colorToBase = (color, index) => index;

(async () => {
  const savedBuffer = await db.data.get('colors');

  if (savedBuffer) {
    console.log(savedBuffer);

    const transferBuffer = new Uint8Array(savedBuffer.data);
    postMessage({ type: 'colorsUpdated', data: transferBuffer }, [
      transferBuffer.buffer
    ]);

    try {
      colors = ColorsMessage.decode(savedBuffer.data).colors;
    } catch (err) {
      console.log(err);
    }
    if (colors && colors.length > 0) {
      return;
    }
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
      const ratios = [0.25, 0.5, 0.75];

      for (const ratio of ratios) {
        const mix = mixbox.lerp(baseColors[i].hex, baseColors[j].hex, ratio);
        const code = culori.formatHex({
          mode: 'rgb',
          r: mix[0] / 256,
          g: mix[1] / 256,
          b: mix[2] / 256
        });

        const color = createColor(null, null, code, false);

        mixes.push({
          ...color,
          bases: [colorToBase(baseColors[i], i), colorToBase(baseColors[j], j)],
          ratio: ratio
        });
      }
    }

    if (i % step == 0) {
      postMessage({ type: 'progressUpdate', value: i / step });
    }
  }

  colors = colors.concat(mixes);

  postMessage({ type: 'progressUpdate', value: 95 });

  console.log('Saving colors', colors.length);
  const buffer = ColorsMessage.encode({ colors: colors }).finish();
  await db.data.put({ id: 'colors', data: buffer });
  console.log('Saved colors');

  postMessage({ type: 'progressUpdate', value: 100 });
  postMessage({ type: 'colorsUpdated', data: buffer }, [buffer.buffer]);
})();

self.onmessage = async (message) => {
  if (message.data.type === 'updateOwned') {
    postMessage({ type: 'progressUpdate', value: 0 });

    const colorIndex = colors.findIndex(
      (color) =>
        color.collection === message.data.color.collection &&
        color.name === message.data.color.name &&
        color.hex === message.data.color.hex
    );

    colors[colorIndex].owned = message.data.color.owned;

    const mixes = colors
      .filter((color) => color.bases?.length > 0)
      .filter((color) =>
        color.bases.some(
          (b) =>
            colors[b].collection === message.data.color.collection &&
            colors[b].name === message.data.color.name &&
            colors[b].hex === message.data.color.hex
        )
      );

    mixes.forEach(
      (color) =>
        (color.owned = color.bases.every((base) => {
          return colors[base].owned;
        }))
    );
    updateMinDelta();

    const buffer = ColorsMessage.encode({ colors: colors }).finish();
    await db.data.put({ id: 'colors', data: buffer });
    const transferBuffer = new Uint8Array(buffer);
    postMessage({ type: 'colorsUpdated', data: transferBuffer }, [
      transferBuffer.buffer
    ]);
    postMessage({ type: 'progressUpdate', value: 100 });
  }
};
