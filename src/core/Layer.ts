import { PixelCanvas } from "./PixelCanvas";
import type { LayerData, BlendMode } from "../types";




/* описывает свойства слоя, конструктор задает первоначальные свойства экзепмляра */

export class Layer {

    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    canvas: PixelCanvas;
    blendMode: BlendMode;

    constructor(width:number, height:number, name:string) {
        this.id = crypto.randomUUID(); /* назначается рандомный id типа string */
        this.name = name;
        this.visible = true;
        this.opacity = 1;
        this.blendMode = "normal";
        this.canvas = new PixelCanvas(width, height);
    }

    toJSON() {
        return {
            canvas: this.canvas.toJSON(),
            id: this.id,
            name: this.name,
            visible: this.visible,
            opacity: this.opacity,
            blendMode: this.blendMode
        };
    }

    static fromJSON(data: LayerData) {
        const layer = new Layer(data.canvas.width, data.canvas.height, data.name);
        layer.canvas = PixelCanvas.fromJSON(data.canvas);
        layer.id = data.id;
        layer.name = data.name;
        layer.opacity = data.opacity;
        layer.visible = data.visible;
        layer.blendMode = data.blendMode;
        return layer;
    }
}