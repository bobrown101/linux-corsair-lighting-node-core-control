import { RenderMethod, SetMethod } from "../controller";
import { ANIMATION_INFORMATION } from ".";
import {
  createLEDColorFromColorName,
  createFrameWithColorForEachFan,
  ledColorsEqual,
  copyLEDColor
} from "./frames";
import * as _ from "lodash"


export const MULTIPLIER = 5;
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
        animationInformation.numberFans,
        animationInformation.ledsPerFan
      );
      await renderMethod(frames);
      await new Promise(r => setTimeout(r, animationInformation.period));
      setMethod();


      if(currentColor.red  == targetColor.red){
        //reds are equal, do nothing
      }else{
        // if current red is less than target red
        if(currentColor.red < targetColor.red){
          // if current red plus multiplier is less than or equal to target red
          if(currentColor.red + MULTIPLIER <= targetColor.red){
            currentColor.red = currentColor.red + MULTIPLIER
          // if current red plus multiplirer is not less than or equal to target red
          }else{
            currentColor.red = currentColor.red + 1
          }
        }else{
          // if current red plus multiplier is more than target red
          if(currentColor.red + MULTIPLIER > targetColor.red){
            currentColor.red = currentColor.red - MULTIPLIER
          }else{
            currentColor.red = currentColor.red - 1
          }
        }
      }


      if(currentColor.green  == targetColor.green){
        //reds are equal, do nothing
      }else{
        // if current red is less than target red
        if(currentColor.green < targetColor.green){
          // if current red plus multiplier is less than or equal to target red
          if(currentColor.green + MULTIPLIER <= targetColor.green){
            currentColor.green = currentColor.green + MULTIPLIER
          // if current red plus multiplirer is not less than or equal to target red
          }else{
            currentColor.green = currentColor.green + 1
          }
        }else{
          // if current red plus multiplier is more than target red
          if(currentColor.green + MULTIPLIER > targetColor.green){
            currentColor.green = currentColor.green - MULTIPLIER
          }else{
            currentColor.green = currentColor.green - 1
          }
        }
      }


      if(currentColor.blue  == targetColor.blue){
        //reds are equal, do nothing
      }else{
        // if current red is less than target red
        if(currentColor.blue < targetColor.blue){
          // if current red plus multiplier is less than or equal to target red
          if(currentColor.blue + MULTIPLIER <= targetColor.blue){
            currentColor.blue = currentColor.blue + MULTIPLIER
          // if current red plus multiplirer is not less than or equal to target red
          }else{
            currentColor.blue = currentColor.blue + 1
          }
        }else{
          // if current red plus multiplier is more than target red
          if(currentColor.blue + MULTIPLIER > targetColor.blue){
            currentColor.blue = currentColor.blue - MULTIPLIER
          }else{
            currentColor.blue = currentColor.blue - 1
          }
        }
      }


    }

    targetColorIndex = increaseIndex(targetColorIndex);
    currentColorIndex = increaseIndex(currentColorIndex);
  }
};
