// import { BreakChars } from "./break-chars";

// export class FileInfo {
//     path: string = "";
//     name: string = "";
//     extension: string = "";
//     segments: Array<string> = [];
//     breakChars: BreakChars;

//     constructor(path: string, breakChars: BreakChars) {
//         this.path = path;
//         this.name = path.replace(/^.*[\\\/]/, '');

//         let ext = path.split('.').pop();
//         this.extension = ext ? ext : '';

//         this.breakChars = breakChars;
//         this.segments = this.getSegments(this.name, breakChars);
//         this.segments.push(this.extension);
//     }

//     private getSegments(path: string, breakChars: BreakChars): Array<string> {
//         let segments = [];
//         let currentStr = '';

//         for (let i = 0; i < path.length; i++) {
//             const c: string = path[i];

//             let stop = false;
//             // Check wether character is uppercase
//             if (breakChars.uppercase && c === c.toUpperCase()) { stop = true; }
//             // Check wether character is number
//             else if (breakChars.number && Number(c)) { stop = true; }
//             // Check wether character is symbol
//             else if (breakChars.symbol && Symbol(c)) { stop = true; }
//             // Check wether character is other chars
//             else if (breakChars.custom.indexOf(c)) { stop = true; }

//             currentStr += c;
//             if (stop) {
//                 segments.push(currentStr);
//                 currentStr = '';
//             }
//         }

//         return segments;
//     }
// }
