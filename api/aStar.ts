import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";

interface LatLng {
  lat: number;
  lng: number;
}

interface INode {
  lat: number;
  lng: number;
  heuristic: number;
}

interface IGraph {
  [key: string]: {
    end: number[];
    weight: number;
  }[];
}

function extractLatLng(nodeKey: string): LatLng {
  const [lat, lng] = nodeKey.slice(1, -1).split(", ").map(Number);
  return { lat, lng };
}

function aStarRoute(graph: IGraph, start: LatLng, end: LatLng): LatLng[] {
  const compare = (a: INode, b: INode) => a.heuristic - b.heuristic;
  const queue = new PriorityQueue<INode>(compare);
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | undefined } = {};
  const visited: Set<string> = new Set();

  // Initialize distances and previous nodes
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = undefined;
  }

  // Set the distance of the start node to 0
  const startNode = `(${start.lat}, ${start.lng})`;
  distances[startNode] = 0;
  const startNodeHeuristic = calculateHeuristic(start, end);
  queue.enqueue({
    lat: start.lat,
    lng: start.lng,
    heuristic: startNodeHeuristic,
  });

  while (!queue.isEmpty()) {
    const { lat, lng, heuristic } = queue.dequeue();
    const currentNodeKey = `(${lat}, ${lng})`;

    if (visited.has(currentNodeKey)) {
      continue;
    }

    visited.add(currentNodeKey);

    if (currentNodeKey === `(${end.lat}, ${end.lng})`) {
      break;
    }

    const neighbors = graph[currentNodeKey];
    if (neighbors) {
      for (const neighbor of neighbors) {
        const neighborNode = `(${neighbor.end[0]}, ${neighbor.end[1]})`;
        const distance = distances[currentNodeKey] + neighbor.weight;
        if (distance < distances[neighborNode]) {
          distances[neighborNode] = distance;
          previous[neighborNode] = currentNodeKey;
          const neighborLatLng = extractLatLng(neighborNode);
          const currentToNeighborAngle = calculateHeuristic(
            { lat, lng },
            neighborLatLng
          );
          const currentToEndAngle = calculateHeuristic({ lat, lng }, end);
          const angleDifference = Math.abs(
            currentToNeighborAngle - currentToEndAngle
          );
          queue.enqueue({
            lat: neighbor.end[0],
            lng: neighbor.end[1],
            heuristic: distance
          });
        }
      }
    }
  }

  // Build the path from end to start
  const path: LatLng[] = [];
  let currentNodeKey: string | undefined = `(${end.lat}, ${end.lng})`;

  // If the end node is not visited, there is no path from start to end
  if (!visited.has(currentNodeKey)) {
    return path;
  }

  while (currentNodeKey !== undefined) {
    const currentNode = extractLatLng(currentNodeKey);
    path.unshift(currentNode);
    currentNodeKey = previous[currentNodeKey];
  }

  return path;
}

function calculateHeuristic(a: LatLng, b: LatLng): number {
  const R = 6371e3; // radius of Earth in metres
  const lat1Rad = a.lat * Math.PI/180; // convert degrees to radians
  const lat2Rad = b.lat * Math.PI/180;
  const deltaLat = (b.lat-a.lat) * Math.PI/180;
  const deltaLng = (b.lng-a.lng) * Math.PI/180;

  const aVal = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
               Math.cos(lat1Rad) * Math.cos(lat2Rad) *
               Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1-aVal));

  const distance = R * c; // in metres
  return distance;
}

export { aStarRoute };
