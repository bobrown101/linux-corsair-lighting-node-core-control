import * as yargs from "yargs";
import { start } from "./controller";
import { ANIMATIONS, ANIMATION_NAMES } from "./animations";
import { createFrameFromColor, createFrameFromMultipleColors } from "./frames";
import {COLORMAP, COLOR_NAMES} from "./colors"

const argv = yargs.options({
  brightness: { type: "number", default: 100 },
  numberFans: { type: "number", default: 3 },
  ledsPerFan: { type: "number", default: 8 },
  animation: {
    choices: ANIMATION_NAMES,
    demandOption: true,
    default: ANIMATIONS.SCROLL
  },
  colors: {
    type: "array",
    choices: COLOR_NAMES,
    demandOption: true,
    default: [COLORMAP.white, COLORMAP.black, COLORMAP.black]
  },
  period: { type: "number", default: 50 }
}).argv;

let frames = []

if(argv.animation == ANIMATIONS.CIRCLE || argv.animation == ANIMATIONS.CIRCLE_REVERSE){
    frames = argv.colors.map(() => {
        return createFrameFromMultipleColors(argv.colors, argv.brightness)
    })
}else{
    frames = argv.colors.map((color) => {
        return createFrameFromColor(color, argv.brightness)
    })
}

console.log(JSON.stringify(frames, null, 4))

start(frames, argv.animation, argv.period);
