import COLORMAP from "../colors";
import { FanFrame } from "./frames";
import {
  createFrameFromColorname,
  createFrameFromMultipleColors,
  createLEDColorFromColorName,
  createPulseFrameArrayFromColor
} from "./frames";
import { RenderMethod, SetMethod } from "../controller";
import { LEDColor, SP120Fan } from "./frames";
import * as _ from "lodash";

export enum ANIMATIONS {
  STATIC = "STATIC",
  SCROLL = "SCROLL",
  SCROLL_REVERSE = "SCROLL_REVERSE",
  CIRCLE = "CIRCLE",
  CIRCLE_REVERSE = "CIRCLE_REVERSE",
  PULSE = "PULSE"
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
};

export const ANIMATION_NAMES = Object.keys(ANIMATIONS);

const scrollFrames = (frames: FanFrame[], reverse: boolean = false) => {
  const allLEDColors: LEDColor[] = frames.reduce(
    (accumulator, currentFrame) => {
      return accumulator.concat(currentFrame.ledColors);
    },
    []
  );

  let cycledLEDColors: LEDColor[] = [];
  if (reverse) {
    cycledLEDColors = allLEDColors.map((value, index) => {
      if (index == allLEDColors.length - 1) {
        return allLEDColors[0];
      } else {
        return allLEDColors[index + 1];
      }
    });
  } else {
    cycledLEDColors = allLEDColors.map((value, index) => {
      if (index == 0) {
        return allLEDColors[allLEDColors.length - 1];
      } else {
        return allLEDColors[index - 1];
      }
    });
  }

  const cycledRawFrames = _.chunk(cycledLEDColors, 8);
  return cycledRawFrames.map(
    (frame: SP120Fan): FanFrame => {
      return {
        ledColors: frame
      };
    }
  );
};

const scrollAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  framesAndInfo: FramesAndInfo
) => {
  let currentFrames = framesAndInfo.frames;

  while (true) {
    await renderMethod(currentFrames);
    await new Promise(r =>
      setTimeout(r, framesAndInfo.animationInformation.period)
    );
    await setMethod();
    currentFrames = scrollFrames(
      currentFrames,
      framesAndInfo.animationInformation.reverse
    );
  }
};

const circleAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  framesAndInfo: FramesAndInfo
) => {
  let currentFrames = framesAndInfo.frames;

  while (true) {
    await renderMethod(currentFrames);
    await new Promise(r =>
      setTimeout(r, framesAndInfo.animationInformation.period)
    );
    await setMethod();
    currentFrames = currentFrames.map(frame => {
      return scrollFrames(
        [frame],
        framesAndInfo.animationInformation.reverse
      )[0];
    });
  }
};

const staticAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  framesAndInfo: FramesAndInfo
) => {
  let currentFrames = framesAndInfo.frames;

  while (true) {
    await renderMethod(currentFrames);
    await new Promise(r => setTimeout(r, 300));
    setMethod();
  }
};

export const generateFramesFromAnimation = (
  animation: ANIMATIONS,
  colors: COLORMAP[],
  brightness: number
): FanFrame[] => {
  let frames = [];

  if (
    animation == ANIMATIONS.CIRCLE ||
    animation == ANIMATIONS.CIRCLE_REVERSE
  ) {
    frames = colors.map(() => {
      return createFrameFromMultipleColors(colors as COLORMAP[], brightness);
    });
  } else if (animation == ANIMATIONS.PULSE) {
    const colorname = colors[0] || COLORMAP.white;
    const ledColor = createLEDColorFromColorName(colorname as COLORMAP);

    frames = createPulseFrameArrayFromColor(ledColor);
  } else {
    frames = colors.map(color => {
      return createFrameFromColorname(color as COLORMAP, brightness);
    });
  }
  return frames;
};

export const runAnimation = async (
  animationInformation: ANIMATION_INFORMATION,
  renderMethod: RenderMethod,
  setMethod: SetMethod
) => {
  const { animationName, colors, brightness, period } = animationInformation;
  const frames = generateFramesFromAnimation(
    animationName,
    colors as COLORMAP[],
    brightness
  );

  let framesAndInfo: FramesAndInfo = {
    animationInformation,
    frames
  };

  switch (animationName) {
    case ANIMATIONS.STATIC:
      staticAnimation(renderMethod, setMethod, framesAndInfo);
      break;
    case ANIMATIONS.PULSE:
      scrollAnimation(renderMethod, setMethod, framesAndInfo);
      break;
    case ANIMATIONS.SCROLL:
      scrollAnimation(renderMethod, setMethod, framesAndInfo);
      break;
    case ANIMATIONS.SCROLL_REVERSE:
      framesAndInfo.animationInformation.reverse = true;
      scrollAnimation(renderMethod, setMethod, framesAndInfo);
      break;
    case ANIMATIONS.CIRCLE:
      circleAnimation(renderMethod, setMethod, framesAndInfo);
      break;
    case ANIMATIONS.CIRCLE_REVERSE:
      framesAndInfo.animationInformation.reverse = true;
      circleAnimation(renderMethod, setMethod, framesAndInfo);
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
