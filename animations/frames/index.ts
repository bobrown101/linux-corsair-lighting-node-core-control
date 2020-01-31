import { COLORMAP } from "../../colors";
import * as _ from "lodash";
export interface LEDColor {
  red: number;
  green: number;
  blue: number;
}

export interface FanFrame {
  ledsPerFan: number
  colors: LEDColor[]
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

export const copyLEDColor = (color: LEDColor): LEDColor =>{
  return createLEDColor(color.red, color.green, color.blue)
}

export const ledColorsEqual = (color1: LEDColor, color2: LEDColor) => {
  return (
    color1.red == color2.red &&
    color1.green == color2.green &&
    color1.blue == color2.blue
  );
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
  numLEDSPerFan
): FanFrame => {
  const rgbCodesForColors: LEDColor[] = colors.map(colorName =>
    adjustLEDColorBrightness(createLEDColorFromColorName(colorName), brightness)
  );

  //if it averages out to less than 1 led per color, just pick the first ones that can fit
  if (rgbCodesForColors.length > numLEDSPerFan) {
    console.warn("You have supplied more colors than can fit on one fan.");
    console.warn(
      "Reducing the number of colors by selecting the ones that come first"
    );
    return {
      colors: rgbCodesForColors.slice(0, numLEDSPerFan),
      ledsPerFan: numLEDSPerFan
    }
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
      colors: ledColors,
      ledsPerFan: numLEDSPerFan
    }
  }
};

export const createFrameFromColorname = (
  color: COLORMAP,
  brightness,
  numLEDSPerFan
): FanFrame => {
  const ledColor = adjustLEDColorBrightness(
    createLEDColorFromColorName(color),
    brightness
  );
  return createFrameFromLEDColor(ledColor, numLEDSPerFan);
};

export const createFrameFromLEDColor = (color: LEDColor, ledsPerFan: number): FanFrame => {
  const colors = []
  for (let index = 0; index < ledsPerFan; index++) {
    colors.push(color)
  }
  return {
    colors,
    ledsPerFan
  };
};

export const createFrameWithColorForEachFan = (
  color: LEDColor,
  numLEDSPerFan: number,
  numFans: number
): FanFrame[] => {
  const frame = createFrameFromLEDColor(color, numLEDSPerFan);
  let frames: FanFrame[] = [];
  for (let x = 0; x < numFans; x++) {
    frames = [...frames, frame];
  }
  return frames;
};
