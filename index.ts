import * as yargs from "yargs";
import { start } from "./controller";
import {
  ANIMATIONS,
  ANIMATION_NAMES,
  ANIMATION_INFORMATION
} from "./animations";

import { COLORMAP, COLOR_NAMES } from "./colors";

const MIN_PERIOD = 0

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

const customArgValidation = args => {
  if (args.period < MIN_PERIOD) {
    console.error(
      `ERROR - setting your period to below ${MIN_PERIOD} overwhelms your device to the point it no longer accepts any more commands.`
    );
    console.error("Please re-run this command with a higher period.");
    console.error("Exiting...");
    process.exit(1);
  }
};

const animationInformation: ANIMATION_INFORMATION = {
  animationName: argv.animation,
  colors: argv.colors as COLORMAP[],
  brightness: argv.brightness,
  period: argv.period,
  ledsPerFan: argv.ledsPerFan,
  numberFans: argv.numberFans
};

customArgValidation(argv);
start(animationInformation);
