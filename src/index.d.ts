declare module "*.svg" {
    const content: string;
    export default content;
  }

declare module "mixbox" {
    export function lerp(c1: string, c2: string, ratio: number) : number
}

declare module "culori" {
  export interface ILabColor {
    mode: 'lab65',
    l: number,
    a: number,
    b: number
  }

  export interface IHsvColor {
    mode: 'hsv',
    h: number,
    s: number,
    v: number
  }

  export interface IRgbColor {
    mode: 'rgb',
    r: number,
    g: number,
    b: number
  }

  export function formatHex(color: string | ILabColor | IRgbColor | IHsvColor) : string;
  export function lab65(color: string | IRgbColor | IHsvColor) : ILabColor;
  export function hsv(color: string| IRgbColor | ILabColor) : IHsvColor;
  export function rgb(color: string| IRgbColor | ILabColor) : IRgbColor;
  export function differenceCiede2000(): (c1: ILabColor, c2: ILabColor) => number;
}