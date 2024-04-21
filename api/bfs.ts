interface LatLng{
    lat: number;
    lng: number;
}

interface INode{
    lat: number;
    lng: number;
}

interface IGraph{
    [key: string]: {
        end: number[];
        weight: number;
    }[];
};

const extractLatLng = (node: string): LatLng => {
    const [lat, lng] = node.slice(1, -1).split(", ");
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
};

function bfsRoute(graph: IGraph, start: LatLng, end: LatLng): LatLng[] {
    const queue: string[] = [];
    const visited: Set<string> = new Set();
    const previous: {[key: string]: string | undefined} = {};
    const startNode = `(${start.lat}, ${start.lng})`;
    const endNode = `(${end.lat}, ${end.lng})`;
    queue.push(startNode);
    visited.add(startNode);

    while (queue.length > 0) {
        const currentNodeKey = queue.shift()!;
        if (currentNodeKey === endNode) {
            const path: LatLng[] = [];
            let node = currentNodeKey;
            while (node !== undefined) {
                path.unshift(extractLatLng(node));
                node = previous[node]!;
            }
            return path;
        }
        const neighbors = graph[currentNodeKey];
        if (neighbors) {
            for (const neighbor of neighbors) {
                const neighborNode = `(${neighbor.end[0]}, ${neighbor.end[1]})`;
                if (!visited.has(neighborNode)) {
                    visited.add(neighborNode);
                    previous[neighborNode] = currentNodeKey;
                    queue.push(neighborNode);
                }
            }
        }
    }
    return [];
}

export {bfsRoute};