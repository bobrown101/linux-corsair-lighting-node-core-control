import { RenderMethod, SetMethod } from "../controller";
import { ANIMATION_INFORMATION } from ".";
import COLORMAP from "../colors";
import {
  SP120Fan,
  FanFrame,
  LEDColor,
  createFrameFromColorname
} from "./frames";
import * as _ from "lodash";

export const scrollFrames = (frames: FanFrame[], reverse: boolean = false) => {
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

export const scrollAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  animationInformation: ANIMATION_INFORMATION
) => {
  let currentFrames = animationInformation.colors.map(color => {
    return createFrameFromColorname(
      color as COLORMAP,
      animationInformation.brightness
    );
  });

  while (true) {
    await renderMethod(currentFrames);
    await new Promise(r => setTimeout(r, animationInformation.period));
    await setMethod();
    currentFrames = scrollFrames(currentFrames, animationInformation.reverse);
  }
};
