/* описывает массив пикселей типа Uint8ClampedArray,
каждый пиксель имеет формат [R, G, B, A].
также описывает методы для работы с массивом */

import { PixelCanvasData } from "../types.ts";

export class PixelCanvas {

    width: number;
    height: number;
    pixels: Uint8ClampedArray;

    private updateDepth = 0;
    private hasPendingChanges = false;

    private historyAction: Map<number, [number, number, number, number]> | null = null;

    private listeners: (() => void)[] = [];

    subscribe(callback: () => void): () => void {
        this.listeners.push(callback);

        return () => {
            const index = this.listeners.indexOf(callback);

            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    constructor(width: number, height:number) {
        this.width = width;
        this.height = height;

        /* создает массив Uint8ClampedArray, четыре параметра на пиксель (формат RGBA) */
        this.pixels = new Uint8ClampedArray(width * height * 4); 
    }

    private notifyChange(): void {
        
        if (this.updateDepth > 0) {
            this.hasPendingChanges = true;
            return;
        }
        
        this.listeners.forEach(callback => {
            callback();
        });
    }

    beginUpdate(): void {
        if (!this.updateDepth) {
            this.hasPendingChanges = false;
        }
        this.updateDepth++;
    }
    
   endUpdate(): void {
        if (this.updateDepth <= 0) return;

        this.updateDepth--;

        if (this.hasPendingChanges && !this.updateDepth) {
            this.notifyChange();
        }

        if (!this.updateDepth) {
            this.hasPendingChanges = false;
        }
    }

    beginHistoryAction(): void {
        this.historyAction = new Map();
    }

    endHistoryAction(): Map<number, [number, number, number, number]> | null {
        const changes = this.historyAction;
        this.historyAction = null;
        
        const colors = new Map();
        for (const entry of this.historyAction) {
            const [index, oldColor] = entry;
        }

        return changes;
    }

    /* возвращает начальный индекс пикселя по координатам */
    getPixelIndex(x:number, y:number): number {
        return (y * this.width + x) * 4;
    }

    /* устанавливает значение RGBA пикселю по координатам */
    setPixel(
        x: number, 
        y: number, 
        r: number, 
        g: number, 
        b: number, 
        a: number
    ): void {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            
            /* получает начальный пиеселя индекс по координатам в index */
            const index = this.getPixelIndex(x, y);
            if (this.pixels[index] === r &&
                this.pixels[index + 1] === g &&
                this.pixels[index + 2] === b && 
                this.pixels[index + 3] === a) return;
            
            if (this.historyAction !== null && !this.historyAction.has(index)) {
                this.historyAction.set(index, [
                    this.pixels[index],
                    this.pixels[index + 1],
                    this.pixels[index + 2],
                    this.pixels[index + 3]
                ]);
            }

            this.pixels[index] = r; /* R - красный канал */
            this.pixels[index + 1] = g; /* G - зеленый канал */
            this.pixels[index + 2] = b; /* B - синий канал */
            this.pixels[index + 3] = a; /* A - Alpha канал */
            
            /* формат [R (нач. индекс), G (нач. индекс + 1), B (нач. индекс + 2), A (нач. индекс + 3)] */

            this.notifyChange(); /* уведомляет подписанные классы об изменении */

        }
    }

    /* возвращает RGBA пикселя (массив с 4-мя элементами) по координатам, начиная с начального индекса - index */
    getPixel(x: number, y: number): [number, number, number, number] | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
           return null;
        } /* проверка выхода за границы массива, возврат null при выходе */

        /* получает начальный пиеселя индекс по координатам в index */
        let index = this.getPixelIndex(x, y);
        return [this.pixels[index], this.pixels[index + 1], this.pixels[index + 2], this.pixels[index + 3]];
        /* формат [R (нач. индекс), G (нач. индекс + 1), B (нач. индекс + 2), A (нач. индекс + 3)] */

    } 

    /* устанавливает всем элементам массива значение 0 */
    clear(): void {
        this.pixels.fill(0);
        this.notifyChange(); /* уведомляет подписанные классы об изменении */
    }

    /*  */
    fillRect(
        x: number,
        y: number, 
        width: number,
        height: number,
        r: number,
        g: number, 
        b: number, 
        a: number
    ): void {

        for (let pixelY = 0; pixelY < height; pixelY++) {
            for (let pixelX = 0; pixelX < width; pixelX++) {
                //this.setPixel(x + pixelX, y + pixelY, r, g, b, a);
                if (x + pixelX >= 0 && x + pixelX < this.width && y + pixelY >= 0 && y + pixelY < this.height) {
                
                    let index = this.getPixelIndex(x + pixelX, y + pixelY);

                    this.pixels[index] = r;
                    this.pixels[index + 1] = g;
                    this.pixels[index + 2] = b;
                    this.pixels[index + 3] = a;
                    
                }
                
            } 
        }

        this.notifyChange();  /* уведомляет подписанные классы об изменении */

    }

    /* возващает копию массива пикселей */
    clone(): PixelCanvas {
        const copy = new PixelCanvas(this.width, this.height);
        copy.pixels.set(this.pixels);
        
        return copy;
        
    }

    toJSON() {
        
        const pixelsToJson = Array.from(this.pixels);
        
        return {
            pixels: pixelsToJson,
            width: this.width,
            height: this.height
        };
    }

    static fromJSON(data: PixelCanvasData) {
        const pixelCanvas = new PixelCanvas(data.width, data.height);
        pixelCanvas.pixels.set(data.pixels);
        return pixelCanvas;
    }

    /* функция вывода для отладки */
    toAscii(): string {
        let result = "";

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                
                let a = this.getPixel(x, y);
                
                if (a !== null && a[3] > 0) {
                    result += "█";
                } else {
                    result += " ";
                }
            }
            result += "\n";
        }
        return result;
    }
}