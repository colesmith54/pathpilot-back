import graph from "../data/graph.json";
import { reduce } from "lodash";

type Marker = {
  latLng: google.maps.LatLngLiteral;
  placeId: string;
  address: string;
};

const calculateAngle = (start: any, end: any) => {
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;

  let angle = (Math.atan2(lat2 - lat1, lon2 - lon1) * 180) / Math.PI;

  if (angle < 0) {
    angle += 360;
  }

  return angle;
};

const getDistance = (
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
) => {
  const toRadian = (angle: number) => (Math.PI / 180) * angle;
  const R = 6371;

  // graph has flipped order of lat and lng
  const dLat = toRadian(coords2.lng - coords1.lat);
  const dLng = toRadian(coords2.lat - coords1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(coords1.lat)) *
      Math.cos(toRadian(coords2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const snapToPoints = (start: Marker, end: Marker, mid: Marker | undefined) => {
  const graphArray = Object.keys(graph).map((key) => {
    const [lat, lng] = key.slice(1, -1).split(", ").map(Number);
    return { lat, lng };
  });

  const closestStart = reduce(graphArray, (prev: any, curr: any) => {
    return getDistance(start.latLng, curr) < getDistance(start.latLng, prev)
      ? curr
      : prev;
  });

  const closestMid = mid ? reduce(graphArray, (prev: any, curr: any) => {
    return getDistance(mid.latLng, curr) < getDistance(mid.latLng, prev)
      ? curr
      : prev;
  }) : null;

  const closestEnd = reduce(graphArray, (prev: any, curr: any) => {
    return getDistance(end.latLng, curr) < getDistance(end.latLng, prev)
      ? curr
      : prev;
  });

  return { closestStart, closestEnd, closestMid };
};

export { getDistance, snapToPoints };
