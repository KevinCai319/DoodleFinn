import PositionGraph from "../../DataTypes/Graphs/PositionGraph";
import { TiledLayerData, TiledTilemapData } from "../../DataTypes/Tilesets/TiledData";
import Vec2 from "../../DataTypes/Vec2";
import OrthogonalTilemap from "./OrthogonalTilemap";
import Navmesh from "../../Pathfinding/Navmesh";
import AABB from "../../DataTypes/Shapes/AABB";
import Physical from "../../DataTypes/Interfaces/Physical";


/**
 * The representation of an orthogonal tilemap - i.e. a top down or platformer tilemap
 */
export default class DynamicTilemap extends OrthogonalTilemap {
    //TODO: make an more efficient map.
    navmesh: Navmesh;
    graph: PositionGraph;
    protected parseTilemapData(tilemapData: TiledTilemapData, layer: TiledLayerData): void {
        super.parseTilemapData(tilemapData,layer);
    }
    getTileBit(x: number, y:number):number{
        if(y < 0 || x < 0 || x>=this.numCols || y>= this.numRows)return 0;
        return (this.isTileCollidable(this.cvtIndex(x,y)))?0:1;
    }
    cvtIndex(x:number, y: number){
        return y * this.numCols + x;
    }

    //very bad but need a proof of concept soon
    badNavMesh():void{
        
        let graph = new PositionGraph();
        //map a certain index to index. (index of point in collisionmap , index in the position graph)
        let point = new Array<number>(this.getCollisionMapSize());
        //iterate through all the tiles.
        for(let y = 0; y< this.numRows;y++){
            for(let x =0;x< this.numCols;x++){
                if(this.getTileBit(x,y)){
                    let newpos =this.getTileWorldPosition(this.cvtIndex(x,y)).add(this.getTileSize().scaled(0.5));
                    point[this.cvtIndex(x,y)] = graph.addPositionedNode(newpos)-1;
                }else{
                    point[this.cvtIndex(x,y)] = -1;
                }
            }
        }
        //Add proper links based on neighboring edge data.
        for(let y = 0; y< this.numRows;y++){
            for(let x =0;x< this.numCols;x++){
                if(this.getTileBit(x,y)){
                    let toAdd = point[this.cvtIndex(x,y)];
                    //right,bottom, rightbottom, leftbottom.
                    if(this.getTileBit(x,y+1)){
                        graph.addEdge(point[this.cvtIndex(x,y+1)], toAdd);
                    }
                    if(this.getTileBit(x+1,y)){
                        graph.addEdge(point[this.cvtIndex(x+1,y)], toAdd);
                    }
                    if(this.getTileBit(x+1,y+1) && this.getTileBit(x+1,y)  && this.getTileBit(x,y+1)){
                        graph.addEdge(point[this.cvtIndex(x+1,y+1)], toAdd);
                    }
                    if(this.getTileBit(x-1,y+1) && this.getTileBit(x,y+1)  && this.getTileBit(x-1,y)){
                        graph.addEdge(point[this.cvtIndex(x-1,y+1)], toAdd);
                    }
                }
            }
        }
        this.graph = graph;
        // now that you are done adding the edges everything should be ok.
        //create the new navmesh using the graph.
        this.navmesh = new Navmesh(graph);
    }
    tile_to_number(x: number , y:number): number{
       return 8*this.getTileBit(x,y)+4*this.getTileBit(x+1,y)+2*this.getTileBit(x+1,y+1)+this.getTileBit(x,y+1);
    }

    isVisible(start:Vec2 ,end: Vec2): Vec2{
        let delta = end.clone().sub(start);

        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, end.x);
        let maxX = Math.max(start.x, end.x);
        let minY = Math.min(start.y, end.y);
        let maxY = Math.max(start.y, end.y);

        let minIndex = this.getColRowAt(new Vec2(minX, minY));
        let maxIndex = this.getColRowAt(new Vec2(maxX, maxY));

        let tileSize = this.getTileSize();
        let totalDistance = start.distanceSqTo(end);
        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (this.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);

                    // Create a collider for this tile
                    let collider = new AABB(tilePos, tileSize.scaled(1 / 2));

                    let hit = collider.intersectSegment(start, delta, Vec2.ZERO);

                    if (hit !== null) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }

        return end;
    }
    //Check if an AABB can move in direction point.
    canAABBgo(entity:AABB, point:Vec2):boolean{
        return (this.isVisible(entity.topLeft, entity.topLeft.clone().add(point)) !== null&&
        this.isVisible(entity.bottomLeft,  entity.bottomLeft.clone().add(point)) !== null&&
        this.isVisible(entity.topRight, entity.topRight.clone().add(point))   !== null&&
        this.isVisible(entity.bottomRight, entity.bottomRight.clone().add(point))!== null);
    }

    canAABBgoToPoint(entity:AABB, point:Vec2):boolean{
        return this.canAABBgo(entity, entity.center.vecTo(point));
    }

    // Inefficient implementation of adding a tile.
    badAddTile(location: Vec2,type:number){
        let colRow = this.getColRowAt(location);
        this.setTileAtRowCol(colRow,type);
        //add the tile, update navmesh accordingly.
        this.badNavMesh()
        
    }
    badRemoveTile(location: Vec2){
        let colRow = this.getColRowAt(location);
        this.setTileAtRowCol(colRow,0);
        //remove the tile, update navmesh accordingly.
        this.badNavMesh()
    }

    //this is because the existing physics engine does not work.
    public collideWithOrthogonalTilemap(node: Physical):boolean {
		// Get the min and max x and y coordinates of the moving node
		let min = new Vec2(node.sweptRect.left, node.sweptRect.top);
		let max = new Vec2(node.sweptRect.right, node.sweptRect.bottom);

        console.log(min.x, min.y, max.x, max.y);
		// Convert the min/max x/y to the min and max row/col in the tilemap array
		let minIndex = this.getColRowAt(min);
		let maxIndex = this.getColRowAt(max);

		let tileSize = this.getTileSize();

		// Loop over all possible tiles (which isn't many in the scope of the velocity per frame)
		for(let col = minIndex.x; col <= maxIndex.x; col++){
			for(let row = minIndex.y; row <= maxIndex.y; row++){
				if(this.isTileCollidable(col, row)){
					// Get the position of this tile
					let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);

					// Create a new collider for this tile
					let collider = new AABB(tilePos, tileSize.scaled(1/2));

					// Calculate collision area between the node and the tile
					let area = node.sweptRect.overlapArea(collider);
					if(area > 0){
						return true;
					}
				}
			}
		}
        return false;
	}

    //better implmentation not done yet.
    initializeNavMesh(): void {
        //convert the collision map 
        
        //iterate through all the tiles, and add links to neighboring nodes.
        let graph = new PositionGraph();
        // Do marching squares.
        // Do triangulation.
        // Create the graph.

        //create the new navmesh using the graph.
        this.navmesh = new Navmesh(graph);
    }
    
    debugRender(): void {
        
        
    }
}