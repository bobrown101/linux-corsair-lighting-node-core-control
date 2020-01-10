import * as yargs from "yargs";
import { start } from "./controller";
import { ANIMATIONS, ANIMATION_NAMES } from "./animations";
import { createFrameFromColor } from "./frames";
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

const frames = argv.colors.map((color) => {
    return createFrameFromColor(color, argv.brightness)
})

start(frames, argv.animation, argv.period);
