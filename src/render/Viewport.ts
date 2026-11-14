import { Point } from "../types";

export class Viewport {
    zoom: number;
    panX: number;
    panY: number;

    private listeners: (() => void)[] = [];

    constructor() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;

        
    }

    subscribe(callback: () => void): () => void {
        this.listeners.push(callback);

        return () => {
            const index = this.listeners.indexOf(callback);

            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyChange(): void {
        this.listeners.forEach(callback => {
            callback();
        });
    }

    setZoom(zoom: number): void {
        if (zoom <= 0 || zoom > 1000) {
            return;
        }

        if (this.zoom === zoom) return;
        this.zoom = zoom;
        this.notifyChange();
    }

    zoomAt(newZoom: number, mouseX: number, mouseY: number): void {
        newZoom = Math.min(64, Math.max(0.1, newZoom));
        if (this.zoom === newZoom) return;
        const imageX = (mouseX - this.panX) / this.zoom;
        const imageY = (mouseY - this.panY) / this.zoom;

        const newPanX = mouseX - imageX * newZoom;
        const newPanY = mouseY - imageY * newZoom;

        this.panX = newPanX;
        this.panY = newPanY;
        this.zoom = newZoom;
        this.notifyChange();
    }

    
    setPan(panX: number, panY: number): void {
        if (this.panX === panX && this.panY === panY) return;
        this.panX = panX;
        this.panY = panY;
        this.notifyChange();
    }

    fit(canvasWidth: number, canvasHeight: number, areaWidth: number, areaHeight: number): void {
        this.zoom = Math.min((areaWidth / canvasWidth), (areaHeight / canvasHeight));
        this.panX = (areaWidth - canvasWidth * this.zoom) / 2;
        this.panY = (areaHeight - canvasHeight * this.zoom) / 2;
        this.notifyChange();
    }

    reset(): void {
        if (this.zoom === 1 && this.panX === 0 && this.panY === 0) return;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.notifyChange();
    }

    screenToImage(mouseX: number, mouseY: number): Point {
        const imageX = Math.floor((mouseX - this.panX) / this.zoom);
        const imageY = Math.floor((mouseY - this.panY) / this.zoom);
        return {
            x: imageX,
            y: imageY
        };
    }
}