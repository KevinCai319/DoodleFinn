import ArrayUtils from "./ArrayUtils";

//TODO: make implementation an binary heap.
export default class PriorityQueue<T> {
    items: Array<{element:T,priority:number}>;

    // An array is used to implement priority
    constructor()
    {
        this.items = [];
    }
    //n+logn->O(n)
    enqueue(element:T, priority:number) :void {
        // creating object from queue element
        let qElement = {element, priority};
        //find good locations based on priority.
        let idx = ArrayUtils.binarySearch(this.items,
                                            qElement,
                                            (arg0 :{element:T,priority:number}, arg1 :{element:T,priority:number})=>{
                                                return arg0.priority - arg1.priority;
                                            });

        if(idx === -1) return;
        if(idx !== this.items.length){
            this.items.splice(idx, 0, qElement)
        }else{
            this.items.push(qElement);
        }
    }
    printItems(){
        let out = "";
        for(let i =0; i < this.items.length;i++){
            out += this.items[i].priority+",";
        }
        console.log("{"+out+"}");
    }
    dequeue(): T{
        if (this.isEmpty())
            return null;
        return this.items.shift().element;
    }
    front(): T{
        if (this.isEmpty())
            return null;
        return this.items[0].element;
    }
    front_priority(): number{
        if (this.isEmpty())
            return null;
        return this.items[0].priority;
    }
    isEmpty(): boolean{
        return this.items.length === 0;
    }
}