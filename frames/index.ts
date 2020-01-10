import {COLORMAP} from "../colors"

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


export const createFrameFromColor = (color: COLORMAP, brightness, numLEDS = 8): FanFrame => {
    const rgbCodeForColor = COLORMAP[color]
    const [red, green, blue] = rgbCodeForColor.split(",")
    const brightnessDecimal = (brightness / 100)
    const ledColor: LEDColor = {
        red: parseInt(String(red * brightnessDecimal)),
        green: parseInt(String(green* brightnessDecimal)),
        blue: parseInt(String(blue * brightnessDecimal)),
    }
    const ledColors: EightLEDColor = [ledColor, ledColor, ledColor, ledColor, ledColor, ledColor, ledColor, ledColor]
    return {
        ledColors
    }
}

