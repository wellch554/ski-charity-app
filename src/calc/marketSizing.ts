// Market Sizing tab of the spreadsheet (roadmap v3).
//
// STUB: only the types are declared so that marketSizing.test.ts compiles.
// The functions are not implemented yet; their tests are skipped until they are.

export interface Resort {
  name: string;
  lat: number;
  lon: number;
}

export interface Area {
  name: string;
  lat: number;
  lon: number;
  eligibleTeens: number;
  kids5to17Total: number;
  kids5to17WithDisability: number;
}

export interface AreaSizing {
  nearestResort: string;
  nearestMiles: number;
  withinRange: boolean;
  eligibleInRange: number;
  adaptiveInRange: number;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function distanceMiles(
  _lat1: number,
  _lon1: number,
  _lat2: number,
  _lon2: number,
): number {
  throw new Error("distanceMiles is not implemented yet");
}

export function sizeArea(
  _area: Area,
  _resorts: Resort[],
  _radiusMiles: number,
): AreaSizing {
  throw new Error("sizeArea is not implemented yet");
}
/* eslint-enable @typescript-eslint/no-unused-vars */
