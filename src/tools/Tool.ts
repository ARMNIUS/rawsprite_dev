import { Layer } from "../core/Layer";
import { Point } from "../types";

export interface ToolContext {
    activeLayer: Layer;
    color: [number, number, number, number];
    setColor(color: [number, number, number, number]): void;
}

export interface Tool {
    onPointerDown(context: ToolContext, p: Point): void
    onPointerMove(context: ToolContext, p: Point): void
    onPointerUp(context: ToolContext, p: Point): void
    onPointerLeave(context: ToolContext): void;
} 