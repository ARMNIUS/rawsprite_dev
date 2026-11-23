import { Tool, ToolContext } from "./Tool";
import { Point } from "../types";
import { ToolManager } from "./ToolManager";

export class Picker implements Tool {

    onPointerDown(context: ToolContext, p: Point): void {
        const canvas = context.activeLayer.canvas;

        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        
        const pickedColor = canvas.getPixel(x, y);
        if (pickedColor === null) return;
        context.setColor(pickedColor);
    }

    onPointerMove(context: ToolContext, p: Point): void {

    }

    onPointerUp(context: ToolContext, p: Point): void {

    }

    onPointerLeave(context: ToolContext): void {

    }
}