import { Tool, ToolContext } from "./Tool";
import { Point } from "../types";
export class ToolManager {
    private activeTool: Tool;

    constructor(initialTool: Tool) {
        this.activeTool = initialTool;
    }

    setTool(tool: Tool): void {
        this.activeTool = tool;
    }

    onPointerDown(context: ToolContext, p: Point): void {
        this.activeTool.onPointerDown(context, p);
    }

    onPointerMove(context: ToolContext, p: Point): void {
        this.activeTool.onPointerMove(context, p);
    }

    onPointerUp(context: ToolContext, p: Point): void {
        this.activeTool.onPointerUp(context, p);
    }

    onPointerLeave(context: ToolContext): void {
        this.activeTool.onPointerLeave(context);
    }
}