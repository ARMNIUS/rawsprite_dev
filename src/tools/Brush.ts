import { Tool, ToolContext } from "./Tool";
import { Point } from "../types";
export class Brush implements Tool {

    private lastX: number | null =  null;
    private lastY: number | null =  null;

    onPointerDown(context: ToolContext, p: Point): void {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);

        this.lastX = x;
        this.lastY = y;
        context.activeLayer.canvas.setPixel(x, y, context.color[0], context.color[1], context.color[2], context.color[3]);
    }

    onPointerMove(context: ToolContext, p: Point): void {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        
        if (this.lastX === null || this.lastY === null) {
            
            this.lastX = x;
            this.lastY = y;
            context.activeLayer.canvas.setPixel(x, y, context.color[0], context.color[1], context.color[2], context.color[3]);
            return;
        }

        if (this.lastX === x && this.lastY === y) return;
        this.drawLine(context, this.lastX, this.lastY, x, y);

        this.lastX = x;
        this.lastY = y;
    }

    onPointerUp(context: ToolContext, p: Point): void {
        this.lastX = null;
        this.lastY = null;
    }

    onPointerLeave(context: ToolContext): void {
        this.lastX = null;
        this.lastY = null;
    }

    private drawLine(context: ToolContext, x0: number, y0: number, x1: number, y1: number): void {
        console.count("Bresenham calls");
        const canvas = context.activeLayer.canvas;
        canvas.beginUpdate();

        try {
            const dx = Math.abs(x1 - x0);
            const dy = Math.abs(y1 - y0);

            const sx = x0 < x1 ? 1 : -1;
            const sy = y0 < y1 ? 1 : -1;

            let err = dx - dy;

            while (true) {
                
                canvas.setPixel(x0, y0, context.color[0], context.color[1], context.color[2], context.color[3]);

                if (x0 === x1 && y0 === y1) {
                    break;
                }

                const e2 = 2 * err;

                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        } finally {
            canvas.endUpdate();
        }
    }
}