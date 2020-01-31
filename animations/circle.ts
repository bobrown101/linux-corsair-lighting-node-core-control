// import { RenderMethod, SetMethod } from "../controller";

// import { ANIMATION_INFORMATION } from ".";

// import { createFrameFromMultipleColors } from "./frames";

// import COLORMAP from "../colors";
// import { scrollFrames } from "./scroll";

// export const circleAnimation = async (
//   renderMethod: RenderMethod,
//   setMethod: SetMethod,
//   animationInformation: ANIMATION_INFORMATION
// ) => {
//   const generateFrames = () => {
//     const frame = createFrameFromMultipleColors(
//       animationInformation.colors as COLORMAP[],
//       animationInformation.brightness,
//       animationInformation.ledsPerFan
//     );
//     let frames = [];
//     for (let x = 0; x < animationInformation.numberFans; x++) {
//       frames = [...frames, frame];
//     }
//     return frames;
//   };

//   let currentFrames = generateFrames();
//   while (true) {
//     await renderMethod(currentFrames);
//     await new Promise(r => setTimeout(r, animationInformation.period));
//     await setMethod();
//     currentFrames = currentFrames.map(frame => {
//       return scrollFrames([frame], animationInformation.reverse)[0];
//     });
//   }
// };
