import { PixelCanvas } from "../core/PixelCanvas";
import { Overlay } from "./Overlay";
import { Viewport } from "./Viewport";

export class Renderer {
    
    pixelCanvas: PixelCanvas;
    canvas: HTMLCanvasElement;
    bufferCanvas: HTMLCanvasElement;
    isRunning: boolean;
    viewport: Viewport;
    overlay: Overlay;

    animationFrameId: number | null;

    isDirty: boolean;
    unsubscribePixelCanvas: () => void;
    unsubscribeViewport: () => void;

    constructor(pixelCanvas: PixelCanvas, canvas: HTMLCanvasElement, viewport: Viewport, overlay: Overlay) {
        this.bufferCanvas = document.createElement("canvas");

        this.bufferCanvas.width = pixelCanvas.width;
        this.bufferCanvas.height = pixelCanvas.height;
        this.pixelCanvas = pixelCanvas;
        this.canvas = canvas;
        this.isDirty = true;

        this.viewport = viewport;
        this.overlay = overlay;

        this.animationFrameId = null;

        this.unsubscribePixelCanvas = this.pixelCanvas.subscribe(() => {
            this.isDirty = true;
        });

        this.unsubscribeViewport = this.viewport.subscribe(() => {
            this.isDirty = true;
        });

        this.isRunning = false;

    }

    dispose(): void {
        this.stop();
        this.unsubscribePixelCanvas();
        this.unsubscribeViewport();
    }

    getContext(): CanvasRenderingContext2D | null {
        return this.canvas.getContext("2d");
    }


    getBufferContext(): CanvasRenderingContext2D | null {
        return this.bufferCanvas.getContext("2d");
    }

    createImageData(): ImageData {
        const image = new ImageData(this.pixelCanvas.width, this.pixelCanvas.height);
        image.data.set(this.pixelCanvas.pixels);
        return image;
    }

    render(): void {

        if(!this.isDirty) {
            return;
        }

        const context = this.getContext();
        const bufferContext = this.getBufferContext();
        
        if (context === null || bufferContext === null) {return;}

        const image = this.createImageData();
        bufferContext.putImageData(image, 0, 0);
        
        context.imageSmoothingEnabled = false;

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.drawImage(this.bufferCanvas, this.viewport.panX, this.viewport.panY, this.pixelCanvas.width * this.viewport.zoom, this.pixelCanvas.height * this.viewport.zoom);
        
        
        this.isDirty = false;
    }

    start() {

        if (this.animationFrameId !== null) {
            return;
        }    

        this.isRunning = true;

        const loop = () => {
            this.render();
            this.overlay.render();
            if (this.isRunning){ this.animationFrameId = requestAnimationFrame(loop); }
        }
        loop();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = null;
    }
}