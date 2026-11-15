import { Tool, ToolContext } from "./Tool";
import { Point } from "../types";

export class Bucket implements Tool {

    constructor() {
        console.log("Bucket instance created");
    }
    onPointerDown(context: ToolContext, p: Point): void {
        console.log("Bucket activated");
        const canvas = context.activeLayer.canvas;
        canvas.beginUpdate();

        try {
            const x = Math.floor(p.x);
            const y = Math.floor(p.y);

            
            const targetColor = canvas.getPixel(x, y);

            console.log("Bucket coordinates:", x, y);
            console.log("Target color:", targetColor);
            console.log("Fill color:", context.color);

            if (targetColor === null) return;

            if (targetColor[0] === context.color[0] &&
                targetColor[1] === context.color[1] &&
                targetColor[2] === context.color[2] &&
                targetColor[3] === context.color[3]
            ) return;

            const stack: Point[] = [];
            stack.push({x, y})

            while (stack.length > 0) {
                const point = stack.pop();
                if (point === undefined) continue;

                const currentColor = canvas.getPixel(point.x, point.y);
                if (currentColor === null) continue;

                if (currentColor[0] !== targetColor[0] ||
                    currentColor[1] !== targetColor[1] ||
                    currentColor[2] !== targetColor[2] ||
                    currentColor[3] !== targetColor[3]
                ) continue;

                canvas.setPixel(
                    point.x,
                    point.y,
                    context.color[0],
                    context.color[1],
                    context.color[2],
                    context.color[3]
                );

                console.log("Pixel filled:", point.x, point.y);

                stack.push({ x: point.x - 1, y: point.y });
                stack.push({ x: point.x + 1, y: point.y });
                stack.push({ x: point.x, y: point.y - 1 });
                stack.push({ x: point.x, y: point.y + 1});


            }
        } finally {
            canvas.endUpdate();
        }
        
    }

    onPointerMove(context: ToolContext, p: Point): void {

    }

    onPointerUp(context: ToolContext, p: Point): void {

    }

    onPointerLeave(context: ToolContext): void {

    }
}