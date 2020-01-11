import COLORMAP from "../colors";
import { FanFrame } from "./frames";
import {
  createFrameFromColorname,
  createLEDColorFromColorName,
} from "./frames";
import { RenderMethod, SetMethod } from "../controller";
import { LEDColor, SP120Fan } from "./frames";
import * as _ from "lodash";
import { staticAnimation } from "./static";
import { scrollAnimation } from "./scroll";
import { circleAnimation } from "./circle";
import { pulseAnimation } from "./pulse";

export enum ANIMATIONS {
  STATIC = "STATIC",
  SCROLL = "SCROLL",
  SCROLL_REVERSE = "SCROLL_REVERSE",
  CIRCLE = "CIRCLE",
  CIRCLE_REVERSE = "CIRCLE_REVERSE",
  PULSE = "PULSE",
  CONSECUTIVE = "CONSECUTIVE"
}

export type FramesAndInfo = {
  frames: FanFrame[];
  animationInformation: ANIMATION_INFORMATION;
};

export type ANIMATION_INFORMATION = {
  animationName: ANIMATIONS;
  colors: COLORMAP[];
  brightness: number;
  period: number;
  reverse?: boolean;
  ledsPerFan: number;
  numberFans: number;
};

export const ANIMATION_NAMES = Object.keys(ANIMATIONS);




const consecutiveAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  animationInformation: ANIMATION_INFORMATION
) => {
  let colorOffset = 0;

  const generateFramesForConsecutiveAnimation = color => {
    let frames = [];
    for (let i = 0; i < animationInformation.numberFans; i++) {
      frames = [
        ...frames,
        createFrameFromColorname(
          color,
          animationInformation.brightness,
          animationInformation.ledsPerFan
        )
      ];
    }
    return frames;
  };

  while (true) {
    const frames = generateFramesForConsecutiveAnimation(
      animationInformation.colors[colorOffset]
    );
    await renderMethod(frames);
    await new Promise(r => setTimeout(r, animationInformation.period));
    await setMethod();

    if (colorOffset == animationInformation.colors.length - 1) {
      colorOffset = 0;
    } else {
      colorOffset = colorOffset + 1;
    }
  }
};


// export const generateFramesFromAnimation = (
//   animation: ANIMATIONS,
//   colors: COLORMAP[],
//   brightness: number
// ): FanFrame[] => {
//   let frames = [];

//   if (animation == ANIMATIONS.PULSE) {
//     const colorname = colors[0] || COLORMAP.white;
//     const ledColor = createLEDColorFromColorName(colorname as COLORMAP);

//     frames = createPulseFrameArrayFromColor(ledColor);
//   } else {
//     frames = colors.map(color => {
//       return createFrameFromColorname(color as COLORMAP, brightness);
//     });
//   }
//   return frames;
// };

export const runAnimation = async (
  animationInformation: ANIMATION_INFORMATION,
  renderMethod: RenderMethod,
  setMethod: SetMethod
) => {

  switch (animationInformation.animationName) {
    case ANIMATIONS.STATIC:
      staticAnimation(renderMethod, setMethod, animationInformation);
      break;
    case ANIMATIONS.PULSE:
      pulseAnimation(renderMethod, setMethod, animationInformation);
      break;
    case ANIMATIONS.SCROLL:
      scrollAnimation(renderMethod, setMethod, animationInformation);
      break;
    case ANIMATIONS.SCROLL_REVERSE:
      animationInformation.reverse = true;
      scrollAnimation(renderMethod, setMethod, animationInformation);
      break;
    case ANIMATIONS.CIRCLE:
      circleAnimation(renderMethod, setMethod, animationInformation);
      break;
    case ANIMATIONS.CIRCLE_REVERSE:
      animationInformation.reverse = true;
      circleAnimation(renderMethod, setMethod, animationInformation);
      break;
    // case ANIMATIONS.CONSECUTIVE:
    //   consecutiveAnimation(renderMethod, setMethod, animationInformation);
    //   break;
    default:
      console.error(
        "Animation",
        animationInformation.animationName,
        "not found. Exiting..."
      );
      process.exit(1);
  }
};
