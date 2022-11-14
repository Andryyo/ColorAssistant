declare module "*.svg" {
    const content: string;
    export default content;
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

  export function formatHex(color: ILabColor) : string;
  export function lab65(color: string) : ILabColor;
  export function hsv(color: string) : IHsvColor;
  export function differenceCiede2000(): (c1: ILabColor, c2: ILabColor) => number;
}