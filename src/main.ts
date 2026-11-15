import { Project } from "./core/Project";
import { Overlay } from "./render/Overlay";
import { Renderer } from "./render/Renderer";
import { Viewport } from "./render/Viewport";
import { Brush } from "./tools/Brush";
import { ToolContext } from "./tools/Tool";
import { ToolManager } from "./tools/ToolManager";
import { PointerHandler } from "./input/PointerHandler";
import { InteractionMode } from "./types";
import { PanHandler } from "./input/PanHandler";
import { Eraser } from "./tools/Eraser";
import { Bucket } from "./tools/Bucket";

// ============================================================================
// DOM
// ============================================================================

const canvas = document.querySelector<HTMLCanvasElement>("#editor-canvas");
const overlayCanvas = document.querySelector<HTMLCanvasElement>("#overlay-canvas");

if (!canvas || !overlayCanvas) {
    throw new Error("Canvas element not found");
}

// ============================================================================
// Project & Tools
// ============================================================================

const project = new Project(64, 64);
const activeLayer = project.layerStack.getActiveLayer();

if (!activeLayer) {
    throw new Error("No active layer");
}

const bucket = new Bucket();
console.log("Bucket reference:", bucket);

const brush = new Brush();
const eraser = new Eraser();
const toolManager = new ToolManager(brush);

const toolContext: ToolContext = {
    activeLayer,
    color: [255, 0, 0, 255],
};



// ============================================================================
// Rendering
// ============================================================================

const viewport = new Viewport();
const overlay = new Overlay(overlayCanvas, viewport, activeLayer.canvas);
const renderer = new Renderer(activeLayer.canvas, canvas, viewport, overlay);

// Подгоняем вид под размер проекта и канваса
viewport.fit(project.width, project.height, canvas.clientWidth, canvas.clientHeight);

// ============================================================================
// Pointer (рисование инструментами)
// ============================================================================

let interactionMode: InteractionMode = "edit";

const pointerHandler = new PointerHandler(
    canvas,
    viewport,
    toolManager,
    toolContext,
    project.width,
    project.height,
    () => interactionMode
);

const setInteractionMode = (mode: InteractionMode): void => {
    interactionMode = mode;

    if (mode === "pan") {
        pointerHandler.cancelDrawing();
    }
};

pointerHandler.attach();

// ============================================================================
// Pan & Zoom (space + ЛКМ / колесо)
// ============================================================================

const panHandler = new PanHandler(
    canvas,
    viewport,
    () => interactionMode,
    setInteractionMode
);

panHandler.attach();

// ============================================================================
// UI кнопки
// ============================================================================

document.querySelector("#start-renderer")?.addEventListener("click", () => {
    renderer.start();
});

document.querySelector("#stop-renderer")?.addEventListener("click", () => {
    renderer.stop();
});

document.querySelector("#dispose-renderer")?.addEventListener("click", () => {
    renderer.dispose();
});

document.querySelector("#fit")?.addEventListener("click", () => {
    viewport.fit(project.width, project.height, canvas.clientWidth, canvas.clientHeight);
});

document.querySelector("#debug-button")?.addEventListener("click", () => {
    activeLayer.canvas.fillRect(0, 0, 32, 32, 0, 100, 255, 255);
});

document.querySelector("#clear")?.addEventListener("click", () => {
    activeLayer.canvas.clear();
    overlay.clear();
});

document.querySelector("#brush")?.addEventListener("click", () => {
    toolManager.setTool(brush);
});

document.querySelector("#eraser")?.addEventListener("click", () => {
    toolManager.setTool(eraser);
});

document.querySelector("#bucket")?.addEventListener("click", () => {
    console.log("button clicked");
    toolManager.setTool(bucket);
});

// ============================================================================
// Debug: шахматная сетка
// TODO: реализовать нативно (в Renderer / Project), а не заливкой в слой
// ============================================================================

{
    const CHECKER_COLOR_A: [number, number, number] = [140, 140, 140];
    const CHECKER_COLOR_B: [number, number, number] = [70, 70, 70];
    const CHECKER_CELL_SIZE = 16;

    const columns = project.width / CHECKER_CELL_SIZE;
    const rows = project.height / CHECKER_CELL_SIZE;

    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            const cellX = x * CHECKER_CELL_SIZE;
            const cellY = y * CHECKER_CELL_SIZE;
            const color = (x + y) % 2 === 0 ? CHECKER_COLOR_A : CHECKER_COLOR_B;

            activeLayer.canvas.fillRect(
                cellX, cellY,
                CHECKER_CELL_SIZE, CHECKER_CELL_SIZE,
                color[0], color[1], color[2], 255,
            );
        }
    }
}

// ============================================================================
// Debug: сериализация проекта (проверка JSON-цикла)
// ============================================================================

{
    const json = JSON.stringify(project);
    const restored = Project.fromJSON(JSON.parse(json));
    console.log("restored project:", restored);
}