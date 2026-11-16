import { PixelCanvas } from "../core/PixelCanvas";
import { Viewport } from "./Viewport";

type Rect = {
    width: number;
    height: number;
    x: number;
    y: number;
}

export class Overlay {

    rects: Rect[] = [];
    canvas: HTMLCanvasElement;
    viewport: Viewport;
    isDirty: boolean;
    pixelCanvas: PixelCanvas;

    unsubscribeViewport: () => void;

    constructor(canvas: HTMLCanvasElement, viewport: Viewport, pixelCanvas: PixelCanvas) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.isDirty = true;

        this.pixelCanvas = pixelCanvas;

        this.unsubscribeViewport = this.viewport.subscribe(() => {
            this.isDirty = true;
        });
    }

    dispose(): void {
        this.unsubscribeViewport();
    }

    getContext(): CanvasRenderingContext2D | null {
        return this.canvas.getContext("2d");
    }

    clear(): void {
        const context = this.getContext();

        if (context === null) {return;}

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isDirty = false;
    }

    drawRect(x:number, y:number, width:number, height:number) {
        const rect: Rect = {width: width, height: height, x: x, y: y};
        this.rects.push(rect);

        this.isDirty = false;
    }

    setStrokeStyle(color:string, width:number) {
        const context = this.getContext();
        if (context === null) {return;}
        context.strokeStyle = color;
        context.lineWidth = width;
    }

    private drawGrid(context: CanvasRenderingContext2D): void {
        if (this.viewport.zoom <= 8) return;

        context.strokeStyle = "#585858";
        context.lineWidth = 1;
        
        const topY = this.viewport.panY;
        const bottomY = this.pixelCanvas.height * this.viewport.zoom + this.viewport.panY;
        
        
        for (let imageX = 1; imageX < this.pixelCanvas.width; imageX++) {

            let screenX = imageX * this.viewport.zoom + this.viewport.panX;
            context.beginPath();
            context.moveTo(screenX, topY);
            context.lineTo(screenX, bottomY);
            context.stroke();
        }

        const leftX = this.viewport.panX;
        const rightX = this.pixelCanvas.width * this.viewport.zoom + this.viewport.panX;

        for (let imageY = 1; imageY < this.pixelCanvas.height; imageY++) {

            let screenY = imageY * this.viewport.zoom + this.viewport.panY;
            context.beginPath();
            context.moveTo(leftX, screenY);
            context.lineTo(rightX, screenY);
            context.stroke();
        }
    }

    private drawCanvasBorder(context: CanvasRenderingContext2D): void {
        //if (this.viewport.zoom <= 8) return;
        context.strokeStyle = "#585858";
        context.lineWidth = 1;
        
        context.strokeRect(this.viewport.panX, this.viewport.panY, this.pixelCanvas.width * this.viewport.zoom, this.pixelCanvas.height * this.viewport.zoom);
    }

    render() {

        const context = this.getContext();
        if (context === null) {return;}

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        

        for (let index = 0; index < this.rects.length; index++) {
            const xScreen = this.rects[index].x * this.viewport.zoom + this.viewport.panX;
            const yScreen = this.rects[index].y * this.viewport.zoom + this.viewport.panY;
            const widthScreen = this.rects[index].width * this.viewport.zoom;
            const heightScreen = this.rects[index].height * this.viewport.zoom;
            context.strokeRect(xScreen, yScreen, widthScreen, heightScreen);
        }
        this.drawCanvasBorder(context);
        //this.drawGrid(context);
        

        this.isDirty = false;
        /*  
            index 0 < 3 +
            index 1 < 3 +
            index 2 < 3 +
            index 3 < 3 -
        */
        
    }

    
}