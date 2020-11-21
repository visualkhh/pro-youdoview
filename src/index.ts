import {config} from "@src/config";
import {RGBA} from "@src/model/RGBA";
import {MathUtil} from "@src/math/MathUtil";
import {Dot} from "@src/model/Dot";
import {RandomUtil} from "@src/random/RandomUtil";

const {range, fromEvent, interval, Observable, of, Subscription, timer} = require('rxjs');
const {map, filter, catchError} = require('rxjs/operators');

class Engine {

    constructor(private video: HTMLVideoElement, private canvas: HTMLCanvasElement) {
        this.init();
    }

    set videoUrl(url: string) {
        this.video.src = url;
        this.video.load();
    }

    init() {
        fromEvent(this.video, 'play').subscribe((e: any) => {
            console.log('play-->', e);
            // this.loopCapture();
        }, false);

    }

    play() {
        // this.video.play();
    }

    // loopCapture() {
    //     setTimeout(() => {
    //         this.capture(false);
    //         this.loopCapture();
    //     }, 1)
    // }
    capture(time: number, pause = true) {
        this.video.currentTime = this.video.currentTime + time;
        if (pause)
            this.video.pause();
        const width = this.video.videoWidth;
        const height = this.video.videoHeight;

        const movePx = 3;
        const angle = 3;
        const scaleUp = 1.02;
        const scaleDown = 0.98;
        const diffSize = 2;
        const dotGroupBoxSize = 4;
        const dotAvgSize = 1;

        // original
        const original2D = this.buffer2D;
        original2D.drawImage(this.video, 0, 0, width, height);
        const originalImageData = original2D.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(originalContext.canvas, 0, 0, width, height);

        // diff_angles
        const angleContext = this.buffer2D;
        angleContext.translate(width / 2, height / 2);
        angleContext.rotate(angle * Math.PI / 180);
        angleContext.drawImage(this.video, -width / 2, -height / 2, width, height);
        const angleImageData = angleContext.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(angleContext.canvas, 0, 0, width, height);

        const angle2Context = this.buffer2D;
        angle2Context.translate(width / 2, height / 2);
        angle2Context.rotate(-angle * Math.PI / 180);
        angle2Context.drawImage(this.video, -width / 2, -height / 2, width, height);
        const angle2ImageData = angle2Context.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(angle2Context.canvas, 0, 0, width, height);

        const scaleUpContext = this.buffer2D;
        scaleUpContext.translate(width / 2, height / 2);
        scaleUpContext.scale(scaleUp, scaleUp);
        scaleUpContext.drawImage(this.video, -width / 2, -height / 2, width, height);
        const scaleUpImageData = scaleUpContext.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(scaleUpContext.canvas, 0, 0, width, height);

        const scaleDownContext = this.buffer2D;
        scaleDownContext.translate(width / 2, height / 2);
        scaleDownContext.scale(scaleDown, scaleDown);
        scaleDownContext.drawImage(this.video, -width / 2, -height / 2, width, height);
        const scaleDownImageData = scaleDownContext.getImageData(0, 0, width, height);
        //this.temp2D.drawImage(scaleDownContext.canvas, 0, 0, width, height);


        const downContext = this.buffer2D;
        downContext.drawImage(this.video, 0, movePx, width, height);
        const downImageData = downContext.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(downContext.canvas, 0, 0, width, height);

        const upContext = this.buffer2D;
        upContext.drawImage(this.video, 0, -movePx, width, height);
        const upImageData = upContext.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(upContext.canvas, 0, 0, width, height);

        const leftContext = this.buffer2D;
        leftContext.drawImage(this.video, -movePx, 0, width, height);
        const leftImageData = leftContext.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(leftContext.canvas, 0, 0, width, height);

        const rightContext = this.buffer2D;
        rightContext.drawImage(this.video, movePx, 0, width, height);
        const rightImageData = rightContext.getImageData(0, 0, width, height);
        // this.temp2D.drawImage(rightContext.canvas, 0, 0, width, height);
        // const pixels = this.getPixels(angleImageData);
        // for (let x = 0; x < pixels.length; x++) {
        //     console.log("%c%s에  %d번째 방문자입니다.", "background: "+pixels[x][0].rgbHex+"; color: white; font-size: 20px;", 'Blog', 90000);
        //     console.log("x", x, pixels[x][0],pixels[x][0].rgbHex);
        // }
        // let imageData = ctx.getImageData(0,0,10,10);
        // console.log(imageData);
        // for (let y = 0; y < originalImageData.height; y++) {
        //     for (let x = 0; x < originalImageData.width; x++) {
        //
        //     }
        // }
        let boundary2D = this.buffer2D;
        let boundaryImageData = boundary2D.getImageData(0, 0, width, height);

        // const resultData = originalImageData.data.copyWithin(0, 0, originalImageData.data.length);

        for (let i = 0; i < originalImageData.data.length; i += 4) {
            const or = originalImageData.data[i];
            const og = originalImageData.data[i + 1];
            const ob = originalImageData.data[i + 2];

            let dr = 0;
            let dg = 0;
            let db = 0;
            dr = or - angleImageData.data[i];
            dg = og - angleImageData.data[i + 1];
            db = ob - angleImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            dr = or - angle2ImageData.data[i];
            dg = og - angle2ImageData.data[i + 1];
            db = ob - angle2ImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            dr = or - upImageData.data[i];
            dg = og - upImageData.data[i + 1];
            db = ob - upImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            dr = or - downImageData.data[i];
            dg = og - downImageData.data[i + 1];
            db = ob - downImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            dr = or - leftImageData.data[i];
            dg = og - leftImageData.data[i + 1];
            db = ob - leftImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            dr = or - rightImageData.data[i];
            dg = og - rightImageData.data[i + 1];
            db = ob - rightImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            //scale
            dr = or - scaleUpImageData.data[i];
            dg = og - scaleUpImageData.data[i + 1];
            db = ob - scaleUpImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }

            dr = or - scaleDownImageData.data[i];
            dg = og - scaleDownImageData.data[i + 1];
            db = ob - scaleDownImageData.data[i + 2];
            if (this.checkDiff(dr, dg, db, diffSize)) {
                boundaryImageData.data[i] = 100;
                boundaryImageData.data[i + 1] = 100;
                boundaryImageData.data[i + 2] = 100;
                boundaryImageData.data[i + 3] = 255;
            }
            // resuiltImageData.data[i] =  ;
            // resuiltImageData.data[i + 1] =  ;
            // resuiltImageData.data[i + 2] =  ;
        }

        //boundary
        boundary2D.putImageData(boundaryImageData, 0, 0);
        //this.temp2D.drawImage(boundary2D.canvas, 0, 0, width, height);


        //dotGroup
        let dot2D = this.buffer2D;
        let dotImageData = dot2D.getImageData(0, 0, width, height);
        let boundaryPixels = this.getPixels(boundaryImageData);
        for (let y = 0; y < boundaryPixels.length; y++) {
            for (let x = 0; x < boundaryPixels[y].length; x++) {
                let pixel = boundaryPixels[y][x];
                let imageDataIndex = this.getImageDataIndex(dotImageData.width, x, y);
                if (pixel.r && pixel.g && pixel.b) {
                    dotImageData.data[imageDataIndex] = pixel.r;
                    dotImageData.data[imageDataIndex + 1] = pixel.g;
                    dotImageData.data[imageDataIndex + 2] = pixel.b;
                    dotImageData.data[imageDataIndex + 3] = 255;
                }
            }
        }
        dot2D.putImageData(dotImageData, 0, 0);
        const dots = new Array<Array<Dot>>();
        dot2D.strokeStyle = "#FF0000";
        // let boxPx = MathUtil.getValueByTotInPercent(dot2D.canvas.width, dotGroupWidthHeigtSize);
        for (let y = 0; y < dot2D.canvas.height; y += dotGroupBoxSize) {
            let h = dotGroupBoxSize;
            let distH = y + h;
            h = (distH > dot2D.canvas.height ? h - (distH - dot2D.canvas.height) : h);
            const dotRow = new Array<Dot>();
            for (let x = 0; x < dot2D.canvas.width; x += dotGroupBoxSize) {
                let w = dotGroupBoxSize;
                let distW = x + h;
                w = (distW > dot2D.canvas.width ? w - (distH - dot2D.canvas.width) : w);
                let avgColor = this.getAvgColor(boundary2D.getImageData(x, y, w, h));
                let avgBGColor = this.getAvgColor(original2D.getImageData(x, y, w, h));
                // console.log(avgColor.rgbHex);
                dot2D.strokeStyle = avgColor.rgbHex;
                dot2D.fillStyle = avgColor.rgbHex;
                // dot2D.fillRect(x, y, w, h);
                let dot = new Dot(x, y, w, h, avgColor, false);
                dot.bgColor = avgBGColor;
                if (this.checkDiff(avgColor.r, avgColor.b, avgColor.g, dotAvgSize)) {
                    dot2D.beginPath();
                    dot2D.arc(dot.centerX, dot.centerY, 3, 0, Math.PI * 2, true);
                    dot2D.fill();
                    dot2D.closePath();
                    dot.draw = true;
                }
                dotRow.push(dot);
            }
            dots.push(dotRow);
        }
        this.temp2D.drawImage(dot2D.canvas, 0, 0, width, height);
        //dot2D.putImageData(dotImageData, 0, 0);
        // let dotPixels = this.getPixels(boundaryImageData);
        // for (let y = 0; y < dotPixels.length; y++) {
        //     for (let x = 0; x < boundaryPixels[y].length; x++) {
        //
        //     }
        // }
        // dot2D.strokeRect(50, 50, 50, 50);


        //line
        let line2D = this.buffer2D;
        let lineImageData = line2D.getImageData(0, 0, width, height);
        // // bg
        for (let y = 0; y < dots.length; y++) {
            for (let x = 0; x < dots[y].length; x++) {
                let dot = dots[y][x];
                line2D.fillStyle = "rgba("+dot.bgColor.r.toFixed()+","+dot.bgColor.g.toFixed()+","+dot.bgColor.b.toFixed()+",0.2)";
                line2D.fillRect(dot.x, dot.y, dot.w, dot.h);
            }
        }

        for (let y = 0; y < dots.length; y++) {
            for (let x = 0; x < dots[y].length; x++) {
                let dot = dots[y][x];
                dot.indexY = y;
                dot.indexX = x;
                if (dot.draw && dot.around.length <= 0) {
                    // line2D.strokeStyle = RandomUtil.rgb();
                    line2D.beginPath();
                    // console.log("start==dot", dot);
                    line2D.moveTo(dot.centerX, dot.centerY);
                    line2D.lineTo(dot.endX, dot.endY);
                    this.drawLine(line2D, dots, y, x);
                    // line2D.lineTo(dot.centerX, dot.centerY);
                    // line2D.closePath();
                    // line2D.stroke();
                }
            }
        }
        //result
        this.result2D.drawImage(line2D.canvas, 0, 0, width, height);

    }

    checkDiff(r: number, g: number, b: number, diffSize: number): boolean {
        // return (Math.abs(r) > diffSize && Math.abs(g) > diffSize && Math.abs(b) > diffSize)
        return (r > diffSize && g > diffSize && b > diffSize)
    }

    processing() {

    }

    // getPixel(imgData: ImageData, index: number): RGBA {
    //     var i = index * 4, d = imgData.data;
    //     return new RGBA(d[i],d[i+1],d[i+2],d[i+3]) // Returns array [R,G,B,A]
    // }
    getPixels(imgData: ImageData): RGBA[][] {
        const r = new Array<Array<RGBA>>();
        for (let y = 0; y < imgData.height; y++) {
            const row = new Array<RGBA>();
            for (let x = 0; x < imgData.width; x++) {
                let imageDataIndex = this.getImageDataIndex(imgData.width, x, y);
                row[x] = new RGBA(
                    imgData.data[imageDataIndex],
                    imgData.data[imageDataIndex + 1],
                    imgData.data[imageDataIndex + 2],
                    imgData.data[imageDataIndex + 3]
                );//this.getPixelXY(imgData, x, y);
            }
            r.push(row);
        }
        return r;
    }

    // AND/OR
    // getPixelXY(imgData: ImageData, x: number, y: number): RGBA {
    //     return this.getPixel(imgData, y*imgData.width+x);

    // }
    private getAvgColor(data: ImageData): RGBA {
        let r = 0, g = 0, b = 0, a = 0;
        const arrAvg = data.data.reduce((a, b) => a + b, 0) / data.data.length;
        for (let i = 0; i < data.data.length; i += 4) {
            r += data.data[i];
            g += data.data[i + 1];
            b += data.data[i + 2];
            a += data.data[i + 3];
        }
        let cnt = data.data.length / 4;
        return new RGBA(r / cnt, g / cnt, b / cnt, 255);
    }

    getImageDataIndex(width: number, x: number, y: number): number {
        return ((y * width * 4) + (x * 4));
    }

    get result2D(): CanvasRenderingContext2D {
        const temp = this.canvas;
        const width = this.video.videoWidth;
        const height = this.video.videoHeight;
        temp.width = width;
        temp.height = height;
        return temp.getContext('2d')!
    }

    get buffer2D(): CanvasRenderingContext2D {
        const temp = document.createElement("canvas");
        const width = this.video.videoWidth;
        const height = this.video.videoHeight;
        temp.width = width;
        temp.height = height;
        return temp.getContext('2d')!
    }

    get temp2D(): CanvasRenderingContext2D {
        const temp = document.querySelector("#temp") as HTMLCanvasElement;
        const width = this.video.videoWidth;
        const height = this.video.videoHeight;
        temp.width = width;
        temp.height = height;
        return temp.getContext('2d')!
    }


    // private drawLines(context2D: CanvasRenderingContext2D, lineTars: Dot[]) {
    //     for (let i = 0; i < lineTars.length; i++) {
    //         context2D.beginPath();
    //         this.drawLine(context2D, lineTars[i]);
    //         context2D.stroke();
    //         context2D.closePath();
    //     }
    // }
    //
    //
    private drawLine(context2D: CanvasRenderingContext2D, dots: Array<Array<Dot>>, y: number, x: number, refer: Dot | undefined = undefined) {

        let dot = dots[y][x];
        //   \ | /
        //  -  +  -
        //   / | \
        let my = y - 1;
        let mx = x - 1;
        let px = x + 1;
        let py = y + 1;
        // context2D.moveTo(dot.centerX, dot.centerY);
        // context2D.lineTo(dot.centerX+2, dot.centerY+2);
        // if (dot.draw) {
        //     context2D.lineTo(dot.centerX, dot.centerY);
        // }
        // if(dot.isAround(refer)) {
        //     context2D.lineTo(dot.centerX, dot.centerY);
        // }
        if (dot.around.length <= 0 && dot.draw) {
            if (my >= 0) {
                let adot = dots[my][x];
                adot.indexY = my;
                adot.indexX = x;
                dot.around.push(adot);
            }
            if (my >= 0 && px < dots[my].length) {
                let adot = dots[my][px];
                adot.indexY = my;
                adot.indexX = px;
                dot.around.push(adot);
            }
            if (px < dots[y].length) {
                let adot = dots[y][px];
                adot.indexY = y;
                adot.indexX = px;
                dot.around.push(adot);
            }
            if (py < dots.length && px < dots[py].length) {
                let adot = dots[py][px];
                adot.indexY = py;
                adot.indexX = px;
                dot.around.push(adot);
            }
            if (py < dots.length) {
                let adot = dots[py][x];
                adot.indexY = py;
                adot.indexX = x;
                dot.around.push(adot);
            }
            //
            if (py < dots.length && mx >= 0) {
                let adot = dots[py][mx];
                adot.indexY = py;
                adot.indexX = mx;
                dot.around.push(adot);
            }
            if (mx >= 0) {
                let adot = dots[y][mx];
                adot.indexY = y;
                adot.indexX = mx;
                dot.around.push(adot);
            }
            if (my >= 0 && mx >= 0) {
                let adot = dots[my][mx];
                adot.indexY = my;
                adot.indexX = mx;
                dot.around.push(adot);
            }
            if (dot.isBoundary) {
                context2D.strokeStyle = dot.bgColor.rgbHex;
                context2D.lineTo(dot.centerX, dot.centerY);
                context2D.stroke();
                for (let i = 0; i < dot.around.length; i++) {
                    context2D.moveTo(dot.centerX, dot.centerY);
                    this.drawLine(context2D, dots, dot.around[i].indexY, dot.around[i].indexX, dot);
                }
            } else { // 전경색.채
                context2D.strokeStyle = dot.bgColor.rgbHex;
                context2D.moveTo(dot.centerX, dot.centerY);
                context2D.lineTo(dot.endX, dot.endY);
                context2D.stroke();
            }
        }


        // let px_my = y - 1;

        // let aroundBoundarys = it.aroundIsBoundaryIgnoreMy;
        // for (let i = 0; it.isBoundary && i < aroundBoundarys.length; i++) {
        //     let next = aroundBoundarys[i];
        //     // context2D.beginPath();
        //     context2D.moveTo(it.centerX, it.centerY);
        //     context2D.lineTo(next.centerX, next.centerY);
        //     // context2D.stroke();
        //     // context2D.closePath();
        //
        //     next.around = next.around.filter((nit)=> nit.x != it.x && nit.y != it.y);
        //     // console.log('--', next.around)
        //     this.drawLine(context2D, next);
        // }

    }
}

const video = document.querySelector("#video") as HTMLVideoElement;
const result = document.querySelector("#result") as HTMLCanvasElement;
const record = document.querySelector("#record") as HTMLButtonElement;
const captureNext = document.querySelector("#captureNext") as HTMLButtonElement;
const capturePrevious = document.querySelector("#capturePrevious") as HTMLButtonElement;
const url = document.querySelector("#url") as HTMLInputElement;


const engine = new Engine(video, result);
fromEvent(record, 'click').subscribe((e: MouseEvent) => {
    console.log(e);
    engine.videoUrl = url.value;
    engine.play();
});
fromEvent(captureNext, 'click').subscribe((e: MouseEvent) => {
    engine.capture((1 / 5));
});
fromEvent(capturePrevious, 'click').subscribe((e: MouseEvent) => {
    engine.capture(-(1 / 5));
});

export {engine};


