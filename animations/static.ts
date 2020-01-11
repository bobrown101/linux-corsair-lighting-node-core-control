import { RenderMethod, SetMethod } from "../controller";
import { ANIMATION_INFORMATION } from ".";
import { createFrameFromColorname } from "./frames";
import COLORMAP from "../colors";

export const staticAnimation = async (
    renderMethod: RenderMethod,
    setMethod: SetMethod,
    animationInformation: ANIMATION_INFORMATION
  ) => {
    let currentFrames = animationInformation.colors.map(color => {
      return createFrameFromColorname(color as COLORMAP, animationInformation.brightness);
    });
  
    while (true) {
      await renderMethod(currentFrames);
      await new Promise(r => setTimeout(r, animationInformation.period));
      await setMethod();
    }
  };
  