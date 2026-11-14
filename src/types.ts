export type PixelCanvasData = {
    width: number;
    height: number;
    pixels: number[];
};

export type LayerData = {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    blendMode: BlendMode;
    canvas: PixelCanvasData;
};

/* возможные режимы наложения */
export type BlendMode = "normal" | "multiply" | "screen" | "overlay";

export type InteractionMode = "edit" | "pan";

export type LayerStackData = {
    layers: LayerData[];
    activeLayerId: string;
}

export type ProjectData = {
    width: number;
    height: number;
    layerStack: LayerStackData;
}

export interface Point {
    x: number;
    y: number;
}