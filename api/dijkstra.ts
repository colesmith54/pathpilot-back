import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";

interface LatLng {
  lat: number;
  lng: number;
}

interface INode {
  node: LatLng;
  distance: number;
}

interface IGraph {
  [key: string]: {
    end: number[];
    weight: number;
  }[];
}

const extractLatLng = (node: string): LatLng => {
  const [lat, lng] = node.slice(1, -1).split(", ");
  return { lat: parseFloat(lat), lng: parseFloat(lng) };
};

function dijkstraRoute(graph: IGraph, start: LatLng, end: LatLng): LatLng[] {
  const compare: ICompare<INode> = (a, b) => a.distance - b.distance;
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | undefined } = {};
  const queue = new PriorityQueue<INode>(compare);
  const visited: Set<string> = new Set();

  // Initialize distances and previous nodes
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = undefined;
  }

  // Set the distance of the start node to 0
  const startNode = `(${start.lat}, ${start.lng})`;
  distances[startNode] = 0;
  queue.enqueue({ node: start, distance: 0 });

  while (!queue.isEmpty()) {
    const { node: currentNode } = queue.dequeue();
    const currentNodeKey = `(${currentNode.lat}, ${currentNode.lng})`;

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
          queue.enqueue({ node: extractLatLng(neighborNode), distance });
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

export { dijkstraRoute };
