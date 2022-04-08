import Graph from "../DataTypes/Graphs/Graph";
import EdgeNode from "../DataTypes/Graphs/EdgeNode";
import PositionGraph from "../DataTypes/Graphs/PositionGraph";
import Vec2 from "../DataTypes/Vec2";
import PriorityQueue from "./PriorityQueue";


/** A class to provides some utility functions for graphs */
export default class GraphUtils {

	/**
	 * An implementation of Djikstra's shortest path algorithm based on the one described in The Algorithm Design Manual.
	 * @param g The graph
	 * @param start The number to start the shortest path from
	 * @returns An array containing the parent of each node of the Graph in the shortest path.
	 */
	static djikstra(g: Graph, start: number): Array<number> {
		let i: number;		// Counter
		let p: EdgeNode;	// Pointer to edgenode
		let inTree: Array<boolean> = new Array(g.numVertices);
		let distance: Array<number> = new Array(g.numVertices);
		let parent: Array<number> = new Array(g.numVertices);
		let v: number;		// Current vertex to process
		let w: number; 		// Candidate for next vertex
		let weight: number;	// Edge weight
		let dist;			// Best current distance from start

		for(i = 0; i < g.numVertices; i++){
			inTree[i] = false;
			distance[i] = Infinity;
			parent[i] = -1;
		}

		distance[start] = 0;
		v = start;

		while(!inTree[v]){
			inTree[v] = true;
			p = g.edges[v];

			while(p !== null){
				w = p.y;
				weight = p.weight;

				if(distance[w] > distance[v] + weight){
					distance[w] = distance[v] + weight;
					parent[w] = v;
				}

				p = p.next;
			}

			v = 0;

			dist = Infinity;

			for(i = 0; i <= g.numVertices; i++){
				if(!inTree[i] && dist > distance[i]){
					dist = distance;
					v = i;
				}
			}
		}

		return parent;

	}

	static aStar(g: PositionGraph, start: number, end: number): Array<number> {
		let currentNode: number;
		let p: EdgeNode;
		let parent_f: number;
		let goalPos: Vec2 = g.getNodePosition(end);
		// open list.
		let toConsider = new PriorityQueue<number>();
		// closed list + parents.
		let parents : Array<number> = new Array(g.numVertices).fill(-1);
		let closed : Array<number> = new Array(g.numVertices).fill(-1);
		let g_cost : Array<number> = new Array(g.numVertices).fill(Infinity);
		g_cost[start]=0;
		toConsider.enqueue(start,0);
		currentNode = start;
		if(currentNode == null)return null
		// Go through all the nodes that can be considered.
		while(!toConsider.isEmpty()){
			parent_f = toConsider.front_priority();
			currentNode = toConsider.dequeue();
			p = g.getEdges(currentNode);
			while(p !== null){

				if(currentNode === end){
					// build up the path.
					return parents;
				}
				if(p == null || p.y == null)return null
				//raw distance in path so far.
				let g_value = g_cost[currentNode] + g.getNodePosition(p.y).distanceTo(g.getNodePosition(currentNode));
				let h_value  = g.getNodePosition(p.y).distanceTo(goalPos);
				let f_value = g_value + h_value;

				let skip = false;
				//check if the node is already in open list.
				for(let i =0; i< toConsider.items.length;i++){
					if(toConsider.items[i].element=== p.y && toConsider.items[i].priority <= f_value){
						skip = true;
						break;
					}
				}
				// If a node was closed, but 
				if(closed[p.y] !== -1 && closed[p.y] <= f_value){
					skip = true;
				}
				// if it is not closed, add to open list.
				if(skip){
					p=p.next;
					continue;
				}
				g_cost[p.y] = g_value;
				parents[p.y]= currentNode;
				toConsider.enqueue(p.y,f_value);
				p = p.next;
			}
			closed[currentNode] = parent_f;
		}
		return null;
	}
}