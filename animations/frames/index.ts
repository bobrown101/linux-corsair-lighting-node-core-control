import { COLORMAP } from "../../colors";
import * as _ from "lodash";
export interface LEDColor {
  red: number;
  green: number;
  blue: number;
}

export type EightLEDColor = [
  LEDColor,
  LEDColor,
  LEDColor,
  LEDColor,
  LEDColor,
  LEDColor,
  LEDColor,
  LEDColor
];

export type SP120Fan = EightLEDColor;

export interface FanFrame {
  ledColors: SP120Fan;
}

export const createLEDColor = (
  red: number,
  green: number,
  blue: number
): LEDColor => {
  return {
    red,
    green,
    blue
  };
};

export const createLEDColorFromCSVRGB = (csvRGB: string) => {
  let redGreenBlue = csvRGB
    .split(",")
    .map(redGreenBlue => parseInt(redGreenBlue));
  return createLEDColor(redGreenBlue[0], redGreenBlue[1], redGreenBlue[2]);
};

export const createLEDColorFromColorName = (colorName: COLORMAP): LEDColor => {
  const csvRgbCodeForColor = COLORMAP[colorName];
  return createLEDColorFromCSVRGB(csvRgbCodeForColor);
};

export const adjustLEDColorBrightness = (
  ledColor: LEDColor,
  brightnessZeroToOneHundred: number
): LEDColor => {
  const brightnessDecimal = brightnessZeroToOneHundred / 100;
  return createLEDColor(
    parseInt(String(ledColor.red * brightnessDecimal)),
    parseInt(String(ledColor.green * brightnessDecimal)),
    parseInt(String(ledColor.blue * brightnessDecimal))
  );
};

export const clampLEDColorBetweenMinAndMax = (color: LEDColor): LEDColor => {
  const min = 0;
  const max = 255;
  return createLEDColor(
    _.clamp(color.red, min, max),
    _.clamp(color.green, min, max),
    _.clamp(color.blue, min, max)
  );
};

export const adjustLEDColorHue = (ledColor: LEDColor, hueColor: LEDColor) => {
  return clampLEDColorBetweenMinAndMax(
    createLEDColor(
      ledColor.red + hueColor.red,
      ledColor.green + hueColor.green,
      ledColor.blue + hueColor.blue
    )
  );
};

export const createFrameFromMultipleColors = (
  colors: COLORMAP[],
  brightness,
  numLEDSPerFan = 8
): FanFrame => {
  const rgbCodesForColors: LEDColor[] = colors.map(colorName =>
    adjustLEDColorBrightness(createLEDColorFromColorName(colorName), brightness)
  );

  //if it averages out to less than 1 led per color, just pick the first 8 colors
  if (rgbCodesForColors.length > numLEDSPerFan) {
    console.warn("You have supplied more colors than can fit on one fan.")
    console.warn("Reducing the number of colors by selecting the ones that come first")
    return { ledColors: rgbCodesForColors.slice(0, 8) as SP120Fan };
  } else {
    //  figure out how many leds each color gets
    const numPerColor = Math.floor(numLEDSPerFan / rgbCodesForColors.length);
    // and figure out how many leds cant be evenly spread out
    const numLeftover = numLEDSPerFan - rgbCodesForColors.length * numPerColor;

    let ledColors = [];
    rgbCodesForColors.forEach(rgbCode => {
      for (let i = 0; i < numPerColor; i++) {
        ledColors.push(rgbCode);
      }
    });

    // for all the leds that can be evenly spread out, just assign them the first color
    for (let y = 0; y < numLeftover; y++) {
      ledColors.push(rgbCodesForColors[0]);
    }

    return {
      ledColors: ledColors as SP120Fan
    };
  }
};

export const createFrameFromColorname = (
  color: COLORMAP,
  brightness,
  numLEDS = 8
): FanFrame => {
  const ledColor = adjustLEDColorBrightness(
    createLEDColorFromColorName(color),
    brightness
  );
  return createFrameFromLEDColor(ledColor);
};

export const createFrameFromLEDColor = (color: LEDColor): FanFrame => {
  // I cant figure out how to get typescript to handle this properly. Just doing it dirty for now
  const ledColors: SP120Fan = [
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color
  ];
  return {
    ledColors
  };
};

