import { Viewport } from "../render/Viewport";
import { InteractionMode } from "../types";

export class PanHandler {

    private readonly canvas: HTMLCanvasElement;
    private readonly viewport: Viewport;
    private readonly getInteractionMode: () => InteractionMode;
    private readonly setInteractionMode: (mode: InteractionMode) => void;
    private isSpacePressed = false;
    private isPanning = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    constructor(
        canvas: HTMLCanvasElement,
        viewport: Viewport,
        getInteractionMode: () => InteractionMode,
        setInteractionMode: (mode: InteractionMode) => void
    ) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.getInteractionMode = getInteractionMode;
        this.setInteractionMode = setInteractionMode;
    }

    attach(): void {

        window.addEventListener("keydown", (e) => {
            if (e.code !== "Space" || this.isSpacePressed) return;
            this.isSpacePressed = true;
            this.canvas.classList.add("grab");
            e.preventDefault(); // чтобы пробел не скроллил страницу
            this.setInteractionMode('pan');
        });

        window.addEventListener("keyup", (e) => {
            if (e.code !== "Space" || !this.isSpacePressed) return;
            this.isSpacePressed = false;
            this.isPanning = false;
            this.canvas.classList.remove("grab", "grabbing");
            this.setInteractionMode('edit');
        });

        this.canvas.addEventListener("mousedown", (e) => { // this.canvas потому что начать параномирование можно только на холсте
            if (e.button !== 0 || !this.isSpacePressed) return;
            this.isPanning = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.classList.add("grabbing");
        });

        window.addEventListener("mouseup", (e) => {
            if (e.button !== 0) return;
            this.isPanning = false;
            this.canvas.classList.remove("grabbing");
        });

        window.addEventListener("mousemove", (e) => {
            if (!this.isPanning) return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            this.viewport.setPan(this.viewport.panX + dx, this.viewport.panY + dy);
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        this.canvas.addEventListener("wheel", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Приближаем "к курсору": deltaY < 0 — зум-ин, deltaY > 0 — зум-аут
            const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
            this.viewport.zoomAt(this.viewport.zoom * factor, mouseX, mouseY);
        });
    }
}