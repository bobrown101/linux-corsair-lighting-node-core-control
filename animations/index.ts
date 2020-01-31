import COLORMAP from "../colors";
import { FanFrame } from "./frames";
import { RenderMethod, SetMethod } from "../controller";
import * as _ from "lodash";
import { staticAnimation } from "./static";
import { scrollAnimation } from "./scroll";
import { circleAnimation } from "./circle";
import { pulseAnimation } from "./pulse";
import { transitionAnimation } from "./transition";

export enum ANIMATIONS {
  STATIC = "STATIC",
  SCROLL = "SCROLL",
  SCROLL_REVERSE = "SCROLL_REVERSE",
  CIRCLE = "CIRCLE",
  CIRCLE_REVERSE = "CIRCLE_REVERSE",
  PULSE = "PULSE",
  TRANSITION = "TRANSITION"
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
    case ANIMATIONS.TRANSITION:
      transitionAnimation(renderMethod, setMethod, animationInformation);
      break;
    default:
      console.error(
        "Animation",
        animationInformation.animationName,
        "not found. Exiting..."
      );
      process.exit(1);
  }
};
