"use server";

import Keyword from "@/lib/types/Keyword";

type AMEdge = { source: string; target: string; weight: number };

export default async function generateChordData(data: Keyword[]) {
  const MIN_THRESHOLD = 2; // Minimum co-occurrence count to include a pair

  const pairCounts: { [pair: string]: number } = {};

  // Count co-occurrences
  data.forEach((row) => {
    try {
      // Handle both cases: when keywords is a string or an array
      const keywordsArray = Array.isArray(row.keywords) 
        ? row.keywords 
        : (typeof row.keywords === 'string' ? JSON.parse(row.keywords) : []);
      
      if (Array.isArray(keywordsArray)) {
        const keywords = [...new Set(keywordsArray)].sort(); // Unique and sorted
        keywords.forEach((keyword1, i) => {
          keywords.slice(i + 1).forEach((keyword2) => {
            const pairKey = `${keyword1}|${keyword2}`;
            pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
          });
        });
      }
    } catch (error) {
      console.error("Error processing keywords for row:", row, error);
    }
  });

  // Convert pair counts to an edge list with filtering
  let edgeList: AMEdge[] = Object.entries(pairCounts)
    .filter(([, count]) => count >= MIN_THRESHOLD)
    .map(([pairKey, weight]) => {
      const [source, target] = pairKey.split("|");
      return { source, target, weight };
    });

  // Build an adjacency map to count the degree of each node
  const adjacencyMap: { [node: string]: number } = {};
  edgeList.forEach(({ source, target }) => {
    adjacencyMap[source] = (adjacencyMap[source] || 0) + 1;
    adjacencyMap[target] = (adjacencyMap[target] || 0) + 1;
  });

  // Filter out nodes with only one connection
  const validNodes = new Set(
    Object.keys(adjacencyMap).filter((node) => adjacencyMap[node] > 1)
  );

  // Filter the edge list to only include edges between valid nodes
  edgeList = edgeList.filter(
    ({ source, target }) => validNodes.has(source) && validNodes.has(target)
  );

  // Create a sorted list of unique nodes based on the filtered edges
  const uniqueNodes = Array.from(
    new Set(edgeList.flatMap(({ source, target }) => [source, target]))
  ).sort();

  // Create a node-to-index map
  const nodeIndexMap: { [node: string]: number } = {};
  uniqueNodes.forEach((node, index) => {
    nodeIndexMap[node] = index;
  });

  // Initialize a square matrix filled with 0s
  const size = uniqueNodes.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Populate the matrix with weights from the filtered edge list
  edgeList.forEach(({ source, target, weight }) => {
    const sourceIndex = nodeIndexMap[source];
    const targetIndex = nodeIndexMap[target];
    matrix[sourceIndex][targetIndex] = weight;
    matrix[targetIndex][sourceIndex] = weight; // Ensure symmetry
  });

  return { nodes: uniqueNodes, matrix };
}