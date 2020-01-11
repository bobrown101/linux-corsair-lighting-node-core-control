import { RenderMethod, SetMethod } from "../controller";
import { ANIMATION_INFORMATION } from ".";
import {
  createLEDColorFromColorName,
  createFrameWithColorForEachFan,
  ledColorsEqual,
  copyLEDColor
} from "./frames";

export const transitionAnimation = async (
  renderMethod: RenderMethod,
  setMethod: SetMethod,
  animationInformation: ANIMATION_INFORMATION
) => {
  const colors = animationInformation.colors.map(createLEDColorFromColorName);

  const increaseIndex = (currentIndex: number) => {
    if (currentIndex == colors.length - 1) {
      currentIndex = 0;
    } else {
      currentIndex = currentIndex + 1;
    }
    return currentIndex;
  };

  let currentColorIndex = 0;
  let targetColorIndex = currentColorIndex + 1;

  while (true) {
    let currentColor = copyLEDColor(colors[currentColorIndex]);
    let targetColor = copyLEDColor(colors[targetColorIndex]);
    while (!ledColorsEqual(currentColor, targetColor)) {
      const frames = createFrameWithColorForEachFan(
        currentColor,
        animationInformation.numberFans
      );
      await renderMethod(frames);
      await new Promise(r => setTimeout(r, animationInformation.period));
      setMethod();

      if (currentColor.red !== targetColor.red) {
        currentColor.red > targetColor.red
          ? (currentColor.red = currentColor.red - 1)
          : (currentColor.red = currentColor.red + 1);
      }
      if (currentColor.green !== targetColor.green) {
        currentColor.green > targetColor.green
          ? (currentColor.green = currentColor.green - 1)
          : (currentColor.green = currentColor.green + 1);
      }
      if (currentColor.blue !== targetColor.blue) {
        currentColor.blue > targetColor.blue
          ? (currentColor.blue = currentColor.blue - 1)
          : (currentColor.blue = currentColor.blue + 1);
      }
    }

    targetColorIndex = increaseIndex(targetColorIndex);
    currentColorIndex = increaseIndex(currentColorIndex);
  }
};
