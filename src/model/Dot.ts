import {RGBA} from "@src/model/RGBA";

export class Dot {

    public around: Array<Dot> = [];
    constructor(public x: number, public y: number, public w: number, public h: number, public rgba: RGBA, public draw: boolean) {
    }
    get centerX(): number {
        return this.x + this.w / 2;
    }
    get centerY(): number {
        return this.y + this.h / 2
    }
    get endX(): number {
        return this.x + this.w;
    }
    get endY(): number {
        return this.y + this.h;
    }
    get isBoundary() {
        return this.draw && this.around.filter(it => !it.draw).length > 0;
    }
    get arountIgnoreMy() {
        return this.around.filter((it) => it.x != this.x && it.y != this.y)
    }
    get aroundIsBoundaryIgnoreMy() {
        return this.arountIgnoreMy.filter((it) => it.isBoundary);
    }
}
