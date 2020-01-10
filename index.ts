import * as yargs from "yargs";
import { start } from "./controller";
import { ANIMATIONS, ANIMATION_NAMES } from "./animations";
import { createFrameFromColor, createFrameFromMultipleColors } from "./frames";
import { COLORMAP, COLOR_NAMES } from "./colors";

const argv = yargs
  .options({
    brightness: { type: "number", default: 100 },
    numberFans: { type: "number", default: 3 },
    ledsPerFan: { type: "number", default: 8 },
    animation: {
      choices: ANIMATION_NAMES,
      demandOption: true,
      default: ANIMATIONS.STATIC
    },
    period: { type: "number", default: 50 },
    colors: {
      type: "array",
      choices: COLOR_NAMES,
      demandOption: true,
      default: ["red", "green", "blue"]
    }
  })
  .wrap(null).argv;

let frames = [];

if (
  argv.animation == ANIMATIONS.CIRCLE ||
  argv.animation == ANIMATIONS.CIRCLE_REVERSE
) {
  frames = argv.colors.map(() => {
    return createFrameFromMultipleColors(
      argv.colors as COLORMAP[],
      argv.brightness
    );
  });
} else {
  frames = argv.colors.map(color => {
    return createFrameFromColor(color as COLORMAP, argv.brightness);
  });
}

start(frames, argv.animation, argv.period);
