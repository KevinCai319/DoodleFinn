import AABB from "../DataTypes/Shapes/AABB";
import Stack from "../DataTypes/Stack";
import Vec2 from "../DataTypes/Vec2";
import Debug from "../Debug/Debug";
import GameNode from "../Nodes/GameNode";
import { GraphicType } from "../Nodes/Graphics/GraphicTypes";
import DynamicTilemap from "../Nodes/Tilemaps/DynamicMap";
import Scene from "../Scene/Scene";
import Color from "../Utils/Color";
/**
 * A path that AIs can follow. Uses finishMove() in Physical to determine progress on the route
 */
export default class NavigationPath{
	/** The navigation path, stored as a stack of next positions */
	protected path: Stack<Vec2>;
	/** The current direction of movement */
	protected currentMoveDirection: Vec2;
	protected lastPos: Vec2;
	/** The distance a node must be to a point to consider it as having arrived */
	protected distanceThreshold: number;
	protected distanceTraveled: number = 0.0;
	protected startSize: number;
	/**
	 * Constructs a new NavigationPath
	 * @param path The path of nodes to take
	 */
	constructor(path: Stack<Vec2>){
		this.path = path;
		this.currentMoveDirection = Vec2.ZERO;
		this.distanceThreshold = 2;
		this.startSize = path.size();
		this.distanceTraveled = 0;
	}

	/**
	 * Returns the status of navigation along this NavigationPath
	 * @returns True if the node has reached the end of the path, false otherwise
	 */
	isDone(): boolean {
		return this.path.isEmpty();
	}

	getDistanceTraveled(): number{
		return this.distanceTraveled;
	}
	/**
	 * Gets the movement direction in the current position along the path
	 * @param node The node to move along the path
	 * @returns The movement direction as a Vec2
	 */
	getMoveDirection(node: GameNode): Vec2 {
		// Return direction to next point in the nav
		return node.position.dirTo(this.path.peek());
	}

	//shorten overall path to player.
	static AABBOptimization(navigationPath :NavigationPath, map:DynamicTilemap, boundary: AABB):NavigationPath{
		let start:Vec2= null;
		let end:Vec2 = null;
		let stack:Stack<Vec2> = new Stack<Vec2>(navigationPath.startSize);
		let dummyBox :AABB = null;
		let dummy: Vec2 = null;
		navigationPath.path.forEach((item: Vec2, index: number) => {
			if(end !== null){
				dummy = end.clone();
			}
			if(index == 0){
				start = item.clone();
				dummy = item.clone();
				dummyBox = new AABB(start,boundary.halfSize.clone());
				stack.push(item.clone());
			}else{
				end = item.clone();
			}
			//dummy is right before end.
		    if(start !== null && end !== null && dummy !== null){
				//On this line, check if end is visible to the start box.
				if(!map.canAABBgoToPoint(dummyBox,end)){
					//If it isn't, then you know that the previous node is needed in the path.
					dummyBox = new AABB(dummy,boundary.halfSize.clone());
					stack.push(dummy.clone());
					dummy = end.clone();
					start = end.clone();
				}
		    }
		});
		let result = new NavigationPath(stack)
		
		return result;
	}

	/**
	 * Updates this NavigationPath to the current state of the GameNode
	 * @param node The node moving along the path
	 */
	handlePathProgress(node: GameNode): void {
		if(this.lastPos != null){
			this.distanceTraveled+= node.position.distanceTo(this.lastPos);
		}
		this.lastPos = node.position;
		if(node.position.distanceSqTo(this.path.peek()) < this.distanceThreshold*this.distanceThreshold){
			// We've reached our node, move on to the next destination
			this.path.pop();
		}
	}

	getStackSize(): number{
		return this.path.size();
	}

	getStack(): Stack<Vec2>{
		return this.path;
	}

	waypointsPassed(): number{
		return this.startSize-this.path.size();
	}

	toString(): string {
		return this.path.toString()
	}

	// To be called by some AI debugRender()
    renderPath(offset:GameNode){
		let start:Vec2 = null;
		let end:Vec2 = null;
		this.path.forEach((item: Vec2, index: number) => {
			if(index < this.path.size()){
				if(start !== null)end = start.clone();
				start = item.clone();
			}
			if(start !== null && end !== null){
				Debug.drawRay((offset.inRelativeCoordinates(start)),(offset.inRelativeCoordinates(end)),Color.GREEN)
			}
		});
    }
	
	drawPath(Scene: Scene){
		let test = this.path;
		let t_destroy = Scene.getLayer("graph_debug").getItems();
		for(let i = 0; i < t_destroy.length;i++){
			Scene.remove(t_destroy[i]);
		}

		let start:Vec2 = null;
		let end:Vec2 = null;
		test.forEach((item: Vec2, index: number) => {
			if(index < test.size()){
				if(start !== null)end = start.clone();
				start = item.clone();
			}
			if(start !== null && end !== null){
				if(Scene.getViewport().getView().intersectPoint(start) && Scene.getViewport().getView().intersectPoint(end)){
					return;
				}
				let nstart = start.vecTo((Scene.getViewport().getCenter()));
				let nend = end.vecTo((Scene.getViewport().getCenter()));
				let dim =  Scene.getViewport().getHalfSize().clone();
				if(nstart.y > dim.y)nstart.y=dim.y;
				if(nstart.x > dim.x)nstart.x=dim.x;
				if(nstart.y < dim.y)nstart.y=dim.y;
				if(nstart.x < dim.x)nstart.x=dim.x;
				if(nend.y > dim.y)nend.y=dim.y;
				if(nend.x > dim.x)nend.x=dim.x;
				if(nend.y < dim.y)nend.y=dim.y;
				if(nend.x < dim.x)nend.x=dim.x;
				Scene.add.graphic(GraphicType.LINE, "graph_debug", {start:nstart.clone(), end: nend.clone()});
			}
		});
	}
}