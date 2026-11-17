// For v3 (Market Sizing). Expected values come from the spreadsheet's
// Market Sizing tab, using the EXAMPLE row (Washington County, VT).
import { describe, it, expect } from "vitest";
import { distanceMiles, sizeArea, type Resort } from "./marketSizing";

const RESORTS: Resort[] = [
  { name: "Sugarbush (Lincoln Peak), VT", lat: 44.136, lon: -72.894 },
  { name: "Pico Mountain, VT", lat: 43.661, lon: -72.842 },
  { name: "Bolton Valley, VT", lat: 44.421, lon: -72.85 },
  { name: "Loon Mountain, NH", lat: 44.036, lon: -71.621 },
  { name: "Windham Mountain, NY", lat: 42.296, lon: -74.256 },
];

describe("distanceMiles (spherical law of cosines, R = 3959 mi)", () => {
  it("matches spreadsheet distances from Washington County, VT", () => {
    const d = (r: Resort) => distanceMiles(44.27, -72.61, r.lat, r.lon);
    expect(d(RESORTS[0])).toBeCloseTo(16.8413, 3);
    expect(d(RESORTS[1])).toBeCloseTo(43.6336, 3);
    expect(d(RESORTS[2])).toBeCloseTo(15.7958, 3);
    expect(d(RESORTS[3])).toBeCloseTo(51.6277, 3);
    expect(d(RESORTS[4])).toBeCloseTo(159.5527, 3);
  });

  it("same point is 0 miles", () => {
    expect(distanceMiles(44, -72, 44, -72)).toBeCloseTo(0, 6);
  });
});

describe("sizeArea", () => {
  const area = {
    name: "Washington County (EXAMPLE)",
    lat: 44.27,
    lon: -72.61,
    eligibleTeens: 1500,
    kids5to17Total: 9000,
    kids5to17WithDisability: 600,
  };

  it("finds nearest resort and counts teens within 60 miles", () => {
    const r = sizeArea(area, RESORTS, 60);
    expect(r.nearestResort).toBe("Bolton Valley, VT");
    expect(r.nearestMiles).toBeCloseTo(15.7958, 3);
    expect(r.withinRange).toBe(true);
    expect(r.eligibleInRange).toBe(1500);
    expect(r.adaptiveInRange).toBeCloseTo(100, 6);
  });

  it("counts nothing when outside the radius", () => {
    const r = sizeArea(area, RESORTS, 10);
    expect(r.withinRange).toBe(false);
    expect(r.eligibleInRange).toBe(0);
    expect(r.adaptiveInRange).toBe(0);
  });
});
