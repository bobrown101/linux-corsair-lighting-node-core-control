import { LEDColor } from "../animations/frames";

export type RendorMethod = (colors: LEDColor[]) => Promise<void>
export type LEDController = {
    id: string,
    numLEDS: number,
    renderColors: RendorMethod
}