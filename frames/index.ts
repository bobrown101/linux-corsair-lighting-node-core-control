import { COLORMAP } from "../colors";

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

export interface FanFrame {
  ledColors: EightLEDColor;
}

export const createFrameFromMultipleColors = (
  colors: COLORMAP[],
  brightness,
  numLEDS = 8
): FanFrame => {
  const brightnessDecimal = brightness / 100;
  const rgbCodesForColors: LEDColor[] = colors
    .map(x => COLORMAP[x])
    .map(x => x.split(","))
    .map(x => ({ red: x[0], green: x[1], blue: x[2] }))
    .map(x => ({
      red: parseInt(String(x.red * brightnessDecimal)),
      green: parseInt(String(x.green * brightnessDecimal)),
      blue: parseInt(String(x.blue * brightnessDecimal))
    }));


  //if it averages out to less than 1 led per color, just pick the first 8 colors
  if (rgbCodesForColors.length >= numLEDS) {
    return { ledColors: rgbCodesForColors.slice(0, 8) as EightLEDColor };
  } else {
    //  figure out how many leds each color gets
    const numPerColor = Math.floor(numLEDS / rgbCodesForColors.length);
    // and figure out how many leds cant be evenly spread out
    const numLeftover = numLEDS - (rgbCodesForColors.length * numPerColor)


    let ledColors = [];
    rgbCodesForColors.forEach(rgbCode => {
      for (let i = 0; i < numPerColor; i++) {
        ledColors.push(rgbCode);
      }
    });

    // for all the leds that can be evenly spread out, just assign them the first color
    for(let y = 0; y<numLeftover; y++){
        ledColors.push(rgbCodesForColors[0])
    }

    return {
      ledColors: ledColors as EightLEDColor
    };
  }
};

export const createFrameFromColor = (
  color: COLORMAP,
  brightness,
  numLEDS = 8
): FanFrame => {
  const rgbCodeForColor = COLORMAP[color];
  const [red, green, blue] = rgbCodeForColor.split(",");
  const brightnessDecimal = brightness / 100;
  const ledColor: LEDColor = {
    red: parseInt(String(red * brightnessDecimal)),
    green: parseInt(String(green * brightnessDecimal)),
    blue: parseInt(String(blue * brightnessDecimal))
  };

  // I cant figure out how to get typescript to handle this properly. Just doing it dirty for now
  const ledColors: EightLEDColor = [
    ledColor,
    ledColor,
    ledColor,
    ledColor,
    ledColor,
    ledColor,
    ledColor,
    ledColor
  ];
  return {
    ledColors
  };
};
