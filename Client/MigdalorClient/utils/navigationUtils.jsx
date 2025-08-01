import { getDistance } from 'geolib';

/**
 * Creates a graph representation of the map for pathfinding.
 * @param {Array} nodes - The array of all map nodes from the API.
 * @param {Array} segments - The static array of polylines (paths).
 * @returns {Object} An adjacency list representing the graph, with weights as distances.
 */
export const createGraph = (nodes, segments) => {
  const graph = {};
  nodes.forEach(node => {
    graph[node.nodeID] = {};
  });

  segments.forEach(seg => {
    // Use a regex to reliably extract node IDs from the 'pair' property.
    // e.g., "// Vertice between nodes 1 and 2" -> ["1", "2"]
    const match = seg.pair?.match(/nodes (\d+) and (\d+)/);
    if (match) {
      const [_, node1Id, node2Id] = match;
      const startNode = nodes.find(n => n.nodeID == node1Id);
      const endNode = nodes.find(n => n.nodeID == node2Id);

      if (startNode && endNode) {
        // Calculate the real-world distance between the two nodes in meters.
        const distance = getDistance(
          { latitude: startNode.latitude, longitude: startNode.longitude },
          { latitude: endNode.latitude, longitude: endNode.longitude }
        );
        // Add the connection in both directions for a two-way path.
        graph[node1Id][node2Id] = distance;
        graph[node2Id][node1Id] = distance;
      }
    }
  });
  return graph;
};

/**
 * Implements Dijkstra's algorithm to find the shortest path from a single source.
 * @param {Object} graph - The graph generated by createGraph.
 * @param {String|Number} startNodeId - The ID of the starting node.
 * @returns {Object} An object containing distances to all nodes and the previous node in the path.
 */

export const dijkstra = (graph, startNodeId) => {
    const distances = {};
    const prev = {};
    const pq = new Set();

    for (let nodeId in graph) {
        distances[nodeId] = Infinity;
        prev[nodeId] = null;
        pq.add(String(nodeId));
    }

    distances[String(startNodeId)] = 0;

    while (pq.size > 0) {
        let minNode = null;
        pq.forEach(nodeId => {
            if (minNode === null || distances[nodeId] < distances[minNode]) {
                minNode = nodeId;
            }
        });
        
        if (minNode === null || distances[minNode] === Infinity) break;
        
        pq.delete(minNode);

        for (let neighbor in graph[minNode]) {
            let alt = distances[minNode] + graph[minNode][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = minNode;
            }
        }
    }
    return { distances, prev };
};

/**
 * Reconstructs the shortest path from the output of Dijkstra's algorithm.
 * @param {Object} prev - The 'previous' object from the dijkstra result.
 * @param {String|Number} startNodeId - The ID of the starting node.
 * @param {String|Number} targetNodeId - The ID of the target node.
 * @returns {Array} An array of node IDs representing the shortest path.
 */
export const getPath = (prev, startNodeId, targetNodeId) => {
    const path = [];
    let u = String(targetNodeId);
    const start = String(startNodeId);
    while (u !== null && prev[u] !== undefined) {
        path.unshift(u);
        if (u === start) break;
        u = prev[u];
    }
    if (path[0] === start) {
        return path;
    }
    return []; // Return empty array if no path is found
};


/**
 * Finds the closest walkable map node to the user's current location.
 * @param {Object} userLocation - An object with latitude and longitude.
 * @param {Array} walkableNodes - An array of map nodes that are part of walkable paths.
 * @returns {Object|null} The closest node object or null.
 */

export const findClosestWalkableNode = (userLocation, walkableNodes) => {
    if (!userLocation || !walkableNodes || walkableNodes.length === 0) return null;
    
    let closestNode = null;
    let minDistance = Infinity;

    walkableNodes.forEach(node => {
        const distance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: node.latitude, longitude: node.longitude }
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestNode = node;
        }
    });
    return closestNode;
};
