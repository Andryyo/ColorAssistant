import vallejoGame from '../data/VallejoGame';
import vallejoModel from '../data/VallejoModel';
import citadel from '../data/Citadel';
import armyPainter from '../data/ArmyPainter';
import mixbox from 'mixbox';
import { db } from '../db/db';
import * as culori from 'culori';
import { ColorsMessage } from '../db/ColorsMessage';
import { ILabColor } from 'culori';
import { IColor, IDeltaOptions } from 'components/Options';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

const difference = culori.differenceCiede2000();

export interface ICompactColor {
  color: ILabColor,
  collection: string,
  name: string,
  hex: string,
  owned: boolean,
  bases?: number[],
  minDelta?: number,
  ratio?: number
}

let colors: ICompactColor[] = [];

let deltaOptions: IDeltaOptions = { farMixPenalty: 0.1 };

const createColor = (collection: string, name: string, hex: string, owned: boolean) => {
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
  const baseColors = colors.filter(
    (color) => !color.bases || color.bases.length === 0
  );
  for (const color1 of baseColors) {
    const deltas = colors
      .filter((c) => c !== color1 && c.owned)
      .map((color2) => {
        const delta = Math.round(difference(color1.color, color2.color));
        if (!color2.bases || color2.bases.length === 0) {
          return delta
        } else {
          const basesDiff = difference(colors[color2.bases[0]].color, colors[color2.bases[1]].color )
          return delta + deltaOptions.farMixPenalty * basesDiff
        }
      });

    color1.minDelta = Math.min(...deltas);
  }
};

const getCollection = (collection: string, data: string) => {
  return data
    .split('\n')
    .filter((s) => s)
    .map((s) => {
      const code = s.substring(s.indexOf('#'));
      const name = s.substring(0, s.indexOf('#') - 1);
      return createColor(collection, name, code, false);
    });
};

export interface IColorsUpdateMessage {
  type: 'colorsUpdated';
  data: Uint8Array;
}

export interface IProgressUpdateMessage {
  type: 'progressUpdate';
  value: number
}

export interface IGetColorsMessage {
  type: 'getColors';
}

export interface IUpdateOwnedMessage {
  type: 'updateOwned';
  colors: IColor[]
}

export interface IUpdateDeltaOptions {
  type: 'updateDeltaOptions'
  deltaOptions: IDeltaOptions
}

type Message = IColorsUpdateMessage | IGetColorsMessage | IUpdateOwnedMessage | IProgressUpdateMessage | IUpdateDeltaOptions;

void (async () => {
  const savedBuffer = await db.data.get('colors');

  if (savedBuffer) {
    const transferBuffer = new Uint8Array(savedBuffer.data);
    ctx.postMessage({ type: 'colorsUpdated', data: transferBuffer }, [
      transferBuffer.buffer
    ]);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  const baseColors : ICompactColor[] = [];
  getCollection('Vallejo Game Colors', vallejoGame).forEach((c) =>
    baseColors.push(c)
  );
  getCollection('Vallejo Model Colors', vallejoModel).forEach((c) =>
    baseColors.push(c)
  );
  getCollection('Citadel', citadel).forEach((c) => baseColors.push(c));
  getCollection('Army Painter', armyPainter).forEach((c) => baseColors.push(c));

  baseColors.forEach((c) => colors.push(c));

  ctx.postMessage({ type: 'progressUpdate', value: 95 });

  console.log('Saving colors', colors.length);
  const buffer = ColorsMessage.encode({ colors: colors }).finish();
  await db.data.put({ id: 'colors', data: buffer });
  console.log('Saved colors');

  ctx.postMessage({ type: 'progressUpdate', value: 100 });
  ctx.postMessage({ type: 'colorsUpdated', data: buffer }, [buffer.buffer]);
})();

onmessage = async (message: MessageEvent<Message>) => {
  const data = message.data;
  switch (data.type) {
    case 'getColors': {
      const buffer = ColorsMessage.encode({ colors: colors }).finish();
      await db.data.put({ id: 'colors', data: buffer });
      const transferBuffer = new Uint8Array(buffer);
      ctx.postMessage({ type: 'colorsUpdated', data: transferBuffer }, [
        transferBuffer.buffer
      ]);
      }
      break;
    case 'updateDeltaOptions': {
      if (!colors || colors.length === 0) {
        return;
      }

      deltaOptions = data.deltaOptions;
      updateMinDelta();
      const buffer = ColorsMessage.encode({ colors: colors }).finish();
      await db.data.put({ id: 'colors', data: buffer });
      const transferBuffer = new Uint8Array(buffer);
      ctx.postMessage({ type: 'colorsUpdated', data: transferBuffer }, [
        transferBuffer.buffer
      ]);
      }
      break;
    case 'updateOwned': {
      ctx.postMessage({ type: 'progressUpdate', value: 0 });

      data.colors.forEach(color => {
        const colorIndex = colors.findIndex(
          (c) =>
            c.collection === color.collection &&
            c.name === color.name &&
            c.hex === color.hex
        );
    
        if (colors[colorIndex].owned === color.owned) {
          ctx.postMessage({ type: 'progressUpdate', value: 100 });
          return;
        }
    
        colors[colorIndex].owned = color.owned;
    
        if (colors[colorIndex].owned) {
          const mixes = [];
    
          colors.forEach((c, i) => {
            if (colorIndex === i || !c.owned || c.bases?.length > 0) {
              return;
            }
    
            const ratios = [0.25, 0.5, 0.75];
    
            for (const ratio of ratios) {
              const mix = mixbox.lerp(colors[colorIndex].hex, c.hex, ratio);
              const code = culori.formatHex({
                mode: 'rgb',
                r: mix[0] / 255,
                g: mix[1] / 255,
                b: mix[2] / 255
              });
    
              const color = createColor(null, null, code, true);
    
              mixes.push({
                ...color,
                bases: [
                  colorIndex,
                  i
                ],
                ratio: ratio
              });
            }
          });
    
          colors = colors.concat(mixes);
        } else {
          colors = colors.filter(
            (c) => !c.bases || c.bases.every((b) => b !== colorIndex)
          );
        }
      });

      updateMinDelta();

      const buffer = ColorsMessage.encode({ colors: colors }).finish();
      await db.data.put({ id: 'colors', data: buffer });
      const transferBuffer = new Uint8Array(buffer);
      ctx.postMessage({ type: 'colorsUpdated', data: transferBuffer }, [
        transferBuffer.buffer
      ]);
      ctx.postMessage({ type: 'progressUpdate', value: 100 });
    }
    break;
}
};
