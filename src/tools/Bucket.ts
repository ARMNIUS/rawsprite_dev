import { Tool, ToolContext } from "./Tool";
import { Point } from "../types";
import { Layer } from "../core/Layer";

/**
 * Инструмент "Заливка" (Bucket).
 * Реализует алгоритм сканирующей заливки (Scanline Flood Fill).
 * Вместо того чтобы проверять каждый соседний пиксель по отдельности (что переполняет стек),
 * алгоритм находит горизонтальные линии (отрезки) одного цвета и закрашивает их целиком,
 * а затем проверяет строки сверху и снизу.
 */
export class Bucket implements Tool {

    constructor() {
        console.log("Bucket instance created");
    }

    onPointerDown(context: ToolContext, p: Point): void {
        console.log("Bucket activated");
        const canvas = context.activeLayer.canvas;
        
        // Начинаем пакетное обновление холста. 
        // Это оптимизация, чтобы холст перерисовывался один раз в конце, а не после каждого setPixel.
        canvas.beginUpdate();

        try {
            // Округляем координаты клика, чтобы получить целочисленные координаты пикселя
            const x = Math.floor(p.x);
            const y = Math.floor(p.y);

            // Получаем цвет пикселя, по которому кликнули (целевой цвет для замены)
            const targetColor = canvas.getPixel(x, y);

            console.log("Bucket coordinates:", x, y);
            console.log("Target color:", targetColor);
            console.log("Fill color:", context.color);

            // Если пиксель вне границ холста (getPixel вернул null), прерываем выполнение
            if (targetColor === null) return;

            // Если цвет под курсором уже совпадает с цветом заливки, нет смысла что-то делать.
            // Это также защищает от бесконечного цикла.
            if (targetColor[0] === context.color[0] &&
                targetColor[1] === context.color[1] &&
                targetColor[2] === context.color[2] &&
                targetColor[3] === context.color[3]
            ) return;

            // Стек для хранения "затравочных" точек, которые нужно будет обработать
            const stack: Point[] = [];
            stack.push({x, y});

            // Основной цикл заливки
            while (stack.length > 0) {
                const point = stack.pop();
                if (point === undefined) continue;

                // Проверяем цвет текущей точки из стека (он мог измениться, если мы уже его закрасили)
                const currentColor = canvas.getPixel(point.x, point.y);
                if (currentColor === null) continue;
                if (currentColor[0] !== targetColor[0] ||
                    currentColor[1] !== targetColor[1] ||
                    currentColor[2] !== targetColor[2] ||
                    currentColor[3] !== targetColor[3]
                ) continue;

                let left = point.x; 
                let right = point.x; 

                /* Поиск левой границы */
                // Идем влево, пока цвет пикселя совпадает с целевым
                while (true) {
                    const nextColor = canvas.getPixel(left - 1, point.y);
                    if (nextColor === null) break; // Дошли до края холста

                    if (nextColor[0] !== targetColor[0] ||
                        nextColor[1] !== targetColor[1] ||
                        nextColor[2] !== targetColor[2] ||
                        nextColor[3] !== targetColor[3]
                    ) break; // Дошли до границы другого цвета

                    left--;
                }

                /* Поиск правой границы */
                // Идем вправо, пока цвет пикселя совпадает с целевым
                while (true) {
                    const nextColor = canvas.getPixel(right + 1, point.y);
                    if (nextColor === null) break; // Дошли до края холста

                    if (nextColor[0] !== targetColor[0] ||
                        nextColor[1] !== targetColor[1] ||
                        nextColor[2] !== targetColor[2] ||
                        nextColor[3] !== targetColor[3]
                    ) break; // Дошли до границы другого цвета

                    right++;
                }

                /* 
                 * Краткий алгоритм:
                 * 1. Берем стартовую точку.
                 * 2. Ищем границы (влево и вправо).
                 * 3. Закрашиваем весь отрезок.
                 * 4. В строке y - 1 ищем новые отрезки для заливки и пушим их в стек.
                 * 5. Переходим к следующей точке из стека.
                 */

                /* Закрашиваем найденные пиксели от левой до правой границы */
                for (let x = left; x <= right; x++) {
                    canvas.setPixel(
                        x,
                        point.y,
                        context.color[0],
                        context.color[1],
                        context.color[2],
                        context.color[3]
                    );
                }

                // Флаг для оптимизации: чтобы не добавлять в стек каждый пиксель подряд,
                // а добавлять только первый пиксель каждого непрерывного отрезка.
                let isRunQueued = false;

                // Проверяем строку сверху (y - 1)
                for (let x = left; x <= right; x++) {
                    const nextColor = canvas.getPixel(x, point.y - 1);

                    if (nextColor === null) break; // Вышли за край холста
      
                    // Если цвет не совпадает с целевым, сбрасываем флаг (значит, отрезок прервался)
                    if (nextColor[0] !== targetColor[0] ||
                        nextColor[1] !== targetColor[1] ||
                        nextColor[2] !== targetColor[2] ||
                        nextColor[3] !== targetColor[3]
                    ) {
                        isRunQueued = false;
                        continue;
                    }

                    // Если цвет совпадает и для этого отрезка еще не добавлена точка,
                    // добавляем точку в стек и ставим флаг
                    if (!isRunQueued) { 
                        stack.push({x: x, y: point.y - 1});
                        isRunQueued = true;
                    }
                }

                // Сбрасываем флаг для проверки строки снизу
                isRunQueued = false;

                // Проверяем строку снизу (y + 1)
                for (let x = left; x <= right; x++) {
                    const nextColor = canvas.getPixel(x, point.y + 1);

                    if (nextColor === null) break; // Вышли за край холста
      
                    if (nextColor[0] !== targetColor[0] ||
                        nextColor[1] !== targetColor[1] ||
                        nextColor[2] !== targetColor[2] ||
                        nextColor[3] !== targetColor[3]
                    ) {
                        isRunQueued = false;
                        continue;
                    }

                    if (!isRunQueued) {
                        stack.push({x: x, y: point.y + 1});
                        isRunQueued = true;
                    }
                }
            }
        } finally {
            // Завершаем обновление холста и применяем все изменения разом
            canvas.endUpdate();
        }
    }

    // Инструмент заливки срабатывает только по клику (onPointerDown),
    // поэтому обработчики движения, отпускания и выхода курсора пустые.
    onPointerMove(context: ToolContext, p: Point): void {
    }

    onPointerUp(context: ToolContext, p: Point): void {
    }

    onPointerLeave(context: ToolContext): void {
    }
}