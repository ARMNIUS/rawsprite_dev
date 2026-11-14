import { Viewport } from "../render/Viewport";
import { ToolContext } from "../tools/Tool";
import { ToolManager } from "../tools/ToolManager";
import { Point, InteractionMode } from "../types";

export class PointerHandler {
    private readonly canvas: HTMLCanvasElement;
    private readonly viewport: Viewport;
    private readonly toolManager: ToolManager;
    private readonly toolContext: ToolContext;
    private readonly width: number;
    private readonly height: number;
    private isDrawing = false;
    private isPointerDown = false;
    private readonly getInteractionMode: () => InteractionMode;
    private lastPointerPosition: Point | null = null;

    constructor(
        canvas: HTMLCanvasElement,
        viewport: Viewport, 
        toolManager: ToolManager, 
        toolContext: ToolContext, 
        width: number, height: 
        number, 
        getInteractionMode: () => InteractionMode
    ) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.toolManager = toolManager;
        this.toolContext = toolContext;
        this.width = width;
        this.height = height;
        this.getInteractionMode = getInteractionMode;
    }

    private getPointerPosition(event: PointerEvent): Point {

        const rect = this.canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        return this.viewport.screenToImage(mouseX, mouseY);
    }

    cancelDrawing(): void {
        this.finishPointer();
    }

    private finishPointer(): void {
        if (this.isDrawing && this.lastPointerPosition) {
            this.toolManager.onPointerUp(
                this.toolContext,
                this.lastPointerPosition
            );
        }

        this.isPointerDown = false;
        this.isDrawing = false;
        this.lastPointerPosition = null;
    }

    attach(): void {

        this.canvas.addEventListener("pointerdown", (event) => {
            if (this.isDrawing || this.getInteractionMode() !== 'edit') return;
            this.isPointerDown = true;
            this.canvas.setPointerCapture(event.pointerId);
            const p = this.getPointerPosition(event);
            if (p.x < 0 || p.x >= this.width ||
                p.y < 0 || p.y >= this.height) {
                
                return;
            }
            this.lastPointerPosition = p;

            this.toolManager.onPointerDown(this.toolContext, p);
            this.isDrawing = true;
        });

        this.canvas.addEventListener("pointermove", (event) => {
            if (!this.isPointerDown || this.getInteractionMode() !== 'edit') return;
            const p = this.getPointerPosition(event);

            if (!this.isDrawing) {
                if (p.x < 0 || p.x >= this.width ||
                    p.y < 0 || p.y >= this.height) {
                        return;
                }
                this.lastPointerPosition = p;
                
                this.toolManager.onPointerDown(this.toolContext, p);
                this.isDrawing = true;
            } else {
                this.lastPointerPosition = p;
                this.toolManager.onPointerMove(this.toolContext, p);
            }
        });

        this.canvas.addEventListener("pointerup", () => {
            this.finishPointer();
        });

        this.canvas.addEventListener("pointercancel", () => {
            this.finishPointer();
        });

        this.canvas.addEventListener("lostpointercapture", () => {
            this.finishPointer();
        });
    }
}