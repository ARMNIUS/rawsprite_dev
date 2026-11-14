import { Layer } from "./Layer";
import type { LayerStackData } from "../types";

/* описывает массив экзепляров Layer, методы для работы с массивом, работа с режимами наложения */

export class LayerStack {
    
    private layers: Layer[]; /* массив слоев (тип Layer) */
    private activeLayerId: string; /* хранит id активного слоя */
    
    constructor(width:number, height:number) {
        this.layers = []; /* создает пустой массив слоев */
        const layer = new Layer(width, height, "Background"); /* создает слой с именем Background */
    
        this.layers.push(layer); /* добавляет Background в массив */
        this.activeLayerId = layer.id; /* назначает Background активным */
    }

    /* создает новый слой, добавляет в массив, делает активным */
    addLayer(width:number, height:number, name:string): Layer {
        const newLayer = new Layer(width, height, name);
        this.layers.push(newLayer);
        this.activeLayerId = newLayer.id;
        return newLayer;
    }

    /* ищет и возвращает активный слой */
    getActiveLayer(): Layer | undefined {
        return this.layers.find(layer => layer.id === this.activeLayerId);
    }

    /* удаляет слой по id, успешно - true, иначе - false */
    removeLayer(layerId:string): boolean {
        const layerToRemove = this.layers.find(layer => layer.id === layerId);

        if (this.layers.length > 1 && layerToRemove) {
            
            const layerIndex = this.layers.indexOf(layerToRemove);
            
            this.layers.splice(layerIndex, 1);
            if (this.activeLayerId === layerToRemove.id) {
                this.activeLayerId = this.layers[this.layers.length - 1].id;
            } /* проверяет количество слоев, если слой один, то удаление не происходит, назначает слой выше активным */

            return true;
        }
        return false;
    }

    /* устанавливает активный слой по id, успешно - true, иначе - false */
    setActiveLayer(layerId:string): boolean {
        const layerToActivate = this.layers.find(layer => layer.id === layerId);
        if (!layerToActivate) {
            return false;
        }
        this.activeLayerId = layerToActivate.id;
        return true;
    }

    /* меняет слои местами в массиве */
    moveLayer(fromIndex: number, toIndex: number): boolean {
        
        if (fromIndex >= this.layers.length || toIndex >= this.layers.length || fromIndex < 0 || toIndex < 0) {
            return false;
        } /* проверяет чтобы индексы не выходили за пределы массива и не были отрицательными */

        if (fromIndex === toIndex) {
            return true;
        } /* если индексы совпадают - true (перемещения нет) */ 

        const removedLayer = this.layers.splice(fromIndex, 1)[0];
        this.layers.splice(toIndex, 0, removedLayer); 
        return true; /* удаляет слой и сохраняет его в отдельный массив, вставляет его в массив с другим индексом */
    }

    /* возвращает слой по id */
    getLayerById(layerId: string): Layer | undefined {
        return this.layers.find(layer => layer.id === layerId);
    }

    /* возвращает копию массива со слоями */
    getLayers(): Layer[] {
        return [...this.layers];
    }

    toJSON() {
        return {
            layers: this.layers.map(layer => layer.toJSON()),
            activeLayerId: this.activeLayerId
        };
    }

    static fromJSON(data: LayerStackData) {
        const layers = data.layers.map(layerData => Layer.fromJSON(layerData));
        const layerStack = new LayerStack(data.layers[0].canvas.width, data.layers[0].canvas.height);
        layerStack.layers = layers;
        layerStack.activeLayerId = data.activeLayerId;
        return layerStack;
    }
}

