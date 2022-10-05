/* eslint-disable no-undef */
importScripts('/ColorAssistant/mixbox.js');
importScripts('/ColorAssistant/chromatism.umd.js');
importScripts('/ColorAssistant/Citadel.js');
importScripts('/ColorAssistant/ArmyPainter.js');
importScripts('/ColorAssistant/VallejoGame.js');
importScripts('/ColorAssistant/VallejoModel.js');
importScripts('/ColorAssistant/difference.js');

console.log('Started colors worker');
var colors = null;

const createColor = (collection, name, id, owned) => {
  let color, H, S, V;

  if (id === '#000000') {
    H = 0;
    S = 0;
    V = 0;
    color = { L: 0, a: 0, b: 0 };
  } else if (id === '#ffffff') {
    H = 0;
    S = 0;
    V = 100;
    color = { L: 100, a: 0, b: 0 };
  } else {
    const hsv = chromatism.convert(id).hsv;
    H = hsv.h;
    S = hsv.s;
    V = hsv.v;
    color = chromatism.convert(id).cielab;
  }

  return {
    collection: collection,
    name: name,
    id: id,
    color: color,
    H: Math.round(H),
    S: Math.round(S),
    V: Math.round(V),
    owned: owned
  };
};

const getCollection = (collection, data, ownedColors) => {
  return data
    .split('\n')
    .filter((s) => s)
    .map((s) => {
      const code = s.substring(s.indexOf('#'));
      const name = s.substring(0, s.indexOf('#') - 1);
      return createColor(
        collection,
        name,
        code,
        ownedColors ? ownedColors.includes(name) : false
      );
    });
};

self.onmessage = (message) => {
  if (message.data.type === 'init') {
    if (colors) {
      postMessage({ type: 'init', colors: colors });
      return;
    }

    colors = [];
    let baseColors = [];
    getCollection(
      'Vallejo Game Colors',
      vallejoGame,
      message.data.ownedColors
    ).forEach((c) => baseColors.push(c));
    getCollection(
      'Vallejo Model Colors',
      vallejoModel,
      message.data.ownedColors
    ).forEach((c) => baseColors.push(c));
    getCollection('Citadel', citadel, message.data.ownedColors).forEach((c) =>
      baseColors.push(c)
    );
    getCollection(
      'Army Painter',
      armyPainter,
      message.data.ownedColors
    ).forEach((c) => baseColors.push(c));

    baseColors.forEach((c) => colors.push(c));

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

    const step = Math.round(baseColors.length / 100);

    for (let i = 0; i < baseColors.length; i++) {
      for (let j = i + 1; j < baseColors.length; j++) {
        const mix = mixbox.lerp(baseColors[i].id, baseColors[j].id, 0.5);
        const code = chromatism.convert({
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

        const color = createColor(
          'Mix',
          name,
          code,
          message.data.ownedColors
            ? message.data.ownedColors.includes(baseColors[i].name) &&
                message.data.ownedColors.includes(baseColors[j].name)
            : false
        );

        colors.push({
          ...color,
          bases: [baseColors[i].id, baseColors[j].id],
          baseCollections: [baseColors[i].collection, baseColors[j].collection]
        });
      }

      if (i % step == 0) {
        postMessage({ type: 'progressUpdate', value: i / step });
      }
    }

    postMessage({ type: 'init', colors: colors });
  } else if (message.data.type === 'updateSelectedColor') {
    console.log('Updating deltas');
    const result = colors.map((c) => {
      const delta = message.data.selectedColor
        ? Math.round(
            cielabDifference(c.color, message.data.selectedColor, 2, 1)
          )
        : null;
      return { ...c, delta };
    });
    console.log('Updated deltas');

    postMessage({ type: 'updateSelectedColor', colors: result });
  }
};
