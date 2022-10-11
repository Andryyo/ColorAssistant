/* eslint-disable no-undef */
import vallejoGame from './VallejoGame';
import vallejoModel from './VallejoModel';
import citadel from './Citadel';
import armyPainter from './ArmyPainter';
import mixbox from 'mixbox';
import { db } from 'db.js';
import * as culori from 'culori';

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
  const baseColors = colors.filter((color) => color.collection !== 'Mix');
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

const colorToBase = (color) => {
  return { collection: color.collection, name: color.name, hex: color.hex };
};

(async () => {
  const savedColors = await db.data.get('colors');

  if (savedColors) {
    colors = JSON.parse(savedColors.data);
    postMessage({ type: 'colorsUpdated', colors: colors });
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
      const ratios = [
        { value: 0.25, name: '3 to 1' },
        { value: 0.5, name: '1 to 1' },
        { value: 0.75, name: '1 to 3' }
      ];

      for (const ratio of ratios) {
        const mix = mixbox.lerp(
          baseColors[i].hex,
          baseColors[j].hex,
          ratio.value
        );
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
          ' + ' +
          baseColors[j].collection +
          ' ' +
          baseColors[j].name +
          ' ' +
          ratio.name;

        const color = createColor('Mix', name, code, false);

        mixes.push({
          ...color,
          bases: [colorToBase(baseColors[i]), colorToBase(baseColors[j])]
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
  await db.data.put({ id: 'colors', data: JSON.stringify(colors) });
  console.log('Saved colors');

  postMessage({ type: 'progressUpdate', value: 100 });
  postMessage({ type: 'colorsUpdated', colors: colors });
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
      .filter((color) => color.collection === 'Mix')
      .filter((color) =>
        color.bases.some(
          (b) =>
            b.collection === message.data.color.collection &&
            b.name === message.data.color.name &&
            b.hex === message.data.color.hex
        )
      );

    mixes.forEach(
      (color) =>
        (color.owned = color.bases.every((base) => {
          const baseIndex = colors.findIndex(
            (color) =>
              color.collection === base.collection &&
              color.name === base.name &&
              color.hex === base.hex
          );

          return colors[baseIndex].owned;
        }))
    );
    updateMinDelta();

    await db.data.put({ id: 'colors', data: JSON.stringify(colors) });
    postMessage({ type: 'colorsUpdated', colors: colors });
    postMessage({ type: 'progressUpdate', value: 100 });
  }
};
