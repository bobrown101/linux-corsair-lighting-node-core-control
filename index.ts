import * as yargs from "yargs";
import { start } from "./controller";
import { ANIMATIONS, ANIMATION_NAMES } from "./animations";
import {
  createFrameFromColorname,
  createFrameFromMultipleColors,
  createLEDColorFromColorName,
  createPulseFrameArrayFromColor
} from "./frames";
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

const customArgValidation = (args) => {
  if(args.period < 10){
    console.error("ERROR - setting your period to below 10 overwhelms your device to the point it no longer accepts any more commands.")
    console.error("Please re-run this command with a higher period.")
    console.error("Exiting...")
    process.exit(1)
  }
}

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
} else if (argv.animation == ANIMATIONS.PULSE) {
  const colorname = argv.colors[0] || COLORMAP.white;
  const ledColor = createLEDColorFromColorName(colorname as COLORMAP);

  frames = createPulseFrameArrayFromColor(ledColor);
} else {
  frames = argv.colors.map(color => {
    return createFrameFromColorname(color as COLORMAP, argv.brightness);
  });
}
customArgValidation(argv)
start(frames, argv.animation, argv.period);
