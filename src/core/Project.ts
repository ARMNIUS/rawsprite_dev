import { LayerStack } from "./LayerStack";
import { ProjectData } from "../types.ts";

export class Project {

    width: number;
    height: number;
    layerStack: LayerStack;
    
    constructor(width:number, height:number) {
        
        if (width <= 0 || height <= 0) {
            throw new Error("Project dimensions must be positive");
        }

        this.width = width;
        this.height = height;
        this.layerStack = new LayerStack(width, height);
    }

    toJSON() {
        return {
            width: this.width,
            height: this.height,
            layerStack: this.layerStack.toJSON()
        };
    }

    static fromJSON(data: ProjectData) {
        const project = new Project(data.width, data.height);
        project.layerStack = LayerStack.fromJSON(data.layerStack);
        return project;
    }
}