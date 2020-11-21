export class RGBA {

    constructor(public r: number, public g: number, public b: number, public a: number) {
    }

    get rgbHex(): string {
        if (this.r > 255 || this.g > 255 || this.b > 255)
            throw "Invalid color component";
        let s = ((this.r << 16) | (this.g << 8) | this.b).toString(16);
        return "#" + ("000000" + s).slice(-6);
    }
    // function GetPixel(context, x, y)
    // {
    //     var p = context.getImageData(x, y, 1, 1).data;
    //     var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    //     return hex;
    // }
    //
    // function rgbToHex(r, g, b) {
    //     if (r > 255 || g > 255 || b > 255)
    //         throw "Invalid color component";
    //     return ((r << 16) | (g << 8) | b).toString(16);
    // }
}
