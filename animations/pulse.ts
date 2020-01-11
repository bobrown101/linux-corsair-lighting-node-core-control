import {
  LEDColor,
  FanFrame,
  adjustLEDColorBrightness,
  createFrameFromLEDColor,
  createLEDColorFromColorName,
  createFrameWithColorForEachFan
} from "./frames";
import { RenderMethod, SetMethod } from "../controller";
import { ANIMATION_INFORMATION } from ".";
import COLORMAP from "../colors";

export const pulseAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  animationInformation: ANIMATION_INFORMATION
) => {
  if (animationInformation.colors.length > 1) {
    console.warn(
      "PULSE only supports one color. Using the first color provided"
    );
  }
  const colorname = animationInformation.colors[0] || COLORMAP.white;
  const ledColor = createLEDColorFromColorName(colorname as COLORMAP);



  let currentBrightnessMultiplier = 100;
  let countDown = true;
  while (true) {
    //first adjust the brightness of the color according to the pulse
    let color = adjustLEDColorBrightness(ledColor, currentBrightnessMultiplier);
    //then adjust the color according to what the user wants
    color = adjustLEDColorBrightness(color, animationInformation.brightness);

    let frames = createFrameWithColorForEachFan(
      color,
      animationInformation.numberFans
    );

    await renderMethod(frames);
    await new Promise(r => setTimeout(r, animationInformation.period));
    await setMethod();

    if (countDown && currentBrightnessMultiplier == 0) {
      countDown = false;
      currentBrightnessMultiplier = 1;
    } else if (!countDown && currentBrightnessMultiplier == 100) {
      countDown = true;
      currentBrightnessMultiplier = 99;
    } else if (countDown) {
      currentBrightnessMultiplier = currentBrightnessMultiplier - 1;
    } else {
      currentBrightnessMultiplier = currentBrightnessMultiplier + 1;
    }
  }
};
