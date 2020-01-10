import { getDeviceList, Device, Interface, OutEndpoint, on } from "usb";
import { EightLEDColor, FanFrame, LEDColor } from "./frames";
import { ANIMATIONS } from "./animations";
import * as _ from "lodash";

const DEVICE_SEARCH_STRING = "CORSAIR Lighting Node CORE".toLowerCase().trim();
const NUM_FANS = 3;
const NUM_DEVICES_SHORT = NUM_FANS << 4;

export interface LightingNodeCore {
  deviceID: string;
  manufacturer: string;
  product: string;
  rawDevice: Device;
  fanFrames: FanFrame[];
  currentFrame: number;
}

const getDevices = async (): Promise<LightingNodeCore[]> => {
  const devices = getDeviceList().map(async rawDevice => {
    return new Promise<LightingNodeCore>((resolve, reject) => {
      rawDevice.open();
      rawDevice.getStringDescriptor(
        rawDevice.deviceDescriptor.iManufacturer,
        (error1, manufacturerBuffer) => {
          if (error1) {
            reject(error1);
          }
          const manufacturer = manufacturerBuffer
            .toString()
            .toLowerCase()
            .trim();
          rawDevice.getStringDescriptor(
            rawDevice.deviceDescriptor.iProduct,
            (error2, productBuffer) => {
              if (error2) {
                reject(error2);
              }
              const product = productBuffer
                .toString()
                .toLowerCase()
                .trim();
              const result: LightingNodeCore = {
                deviceID: `${manufacturer}-${product}`,
                manufacturer,
                product,
                rawDevice,
                fanFrames: [],
                currentFrame: 0
              };
              rawDevice.close();
              resolve(result);
            }
          );
        }
      );
    });
  });
  const result = await Promise.all(devices);
  return result;
};

const sendPacket = (endpoint: OutEndpoint, byteArray: number[]) => {
  // console.log("Sending Packet: " + byteArray);

  const make64 = (arr: number[]) => {
    while (arr.length < 64) {
      arr.push(0x00);
    }
    return arr;
  };

  const fullByteArray = make64(byteArray);
  return new Promise<null>((resolve, reject) => {
    endpoint.transfer(Buffer.from(fullByteArray), err => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

const scrollFrames = (frames: FanFrame[], reverse: boolean = false) => {
  const allLEDColors: LEDColor[] = frames.reduce(
    (accumulator, currentFrame) => {
      return accumulator.concat(currentFrame.ledColors);
    },
    []
  );

  let cycledLEDColors: LEDColor[] = [];
  if (reverse) {
    cycledLEDColors = allLEDColors.map((value, index) => {
      if (index == allLEDColors.length - 1) {
        return allLEDColors[0];
      } else {
        return allLEDColors[index + 1];
      }
    });
  } else {
    cycledLEDColors = allLEDColors.map((value, index) => {
      if (index == 0) {
        return allLEDColors[allLEDColors.length - 1];
      } else {
        return allLEDColors[index - 1];
      }
    });
  }

  const cycledRawFrames = _.chunk(cycledLEDColors, 8);
  return cycledRawFrames.map(
    (frame: EightLEDColor): FanFrame => {
      return {
        ledColors: frame
      };
    }
  );
};

const renderFrames = async (endpoint: OutEndpoint, fanFrames: FanFrame[]) => {
  let RED_CODE = 0;
  let GREEN_CODE = 1;
  let BLUE_CODE = 2;

  let beginArr = [50, 0, 0, 50];
  let redCommand = beginArr.concat([RED_CODE]);
  let greenCommand = beginArr.concat([GREEN_CODE]);
  let blueCommand = beginArr.concat([BLUE_CODE]);

  fanFrames.forEach(fanFrame => {
    fanFrame.ledColors.forEach(ledColor => {
      redCommand = redCommand.concat([ledColor.red]);
      greenCommand = greenCommand.concat([ledColor.green]);
      blueCommand = blueCommand.concat([ledColor.blue]);
    });
  });

  await sendPacket(endpoint, redCommand);
  await sendPacket(endpoint, greenCommand);
  await sendPacket(endpoint, blueCommand);
};

const connectToDevice = async (
  device: LightingNodeCore
): Promise<{ endpoint: OutEndpoint; deviceInterface: Interface }> => {
  const sendPreamble = async (endpoint: OutEndpoint) => {
    console.log(device.deviceID, "- initializing ....", );

    await sendPacket(endpoint, [0x37]);
    // 0x35 - init
    await sendPacket(endpoint, [
      0x35,
      0x00,
      0x00,
      NUM_DEVICES_SHORT,
      0x00,
      0x01,
      0x01
    ]);
    await sendPacket(endpoint, [0x3b, 0x00, 0x01]);
    await sendPacket(endpoint, [0x38, 0x00, 0x02]);
    await sendPacket(endpoint, [0x34]);
    await sendPacket(endpoint, [0x37, 0x01]);
    await sendPacket(endpoint, [0x34, 0x01]);
    await sendPacket(endpoint, [0x38, 0x01, 0x01]);
    await sendPacket(endpoint, [0x33, 0xff]);
  };
  console.log(device.deviceID, "- connecting ....");

  device.rawDevice.open();
  const deviceInterface = device.rawDevice.interfaces[0];
  if (deviceInterface.isKernelDriverActive()) {
    deviceInterface.detachKernelDriver();
  }
  deviceInterface.claim();
  const endpoint = deviceInterface.endpoint(1) as OutEndpoint;
  await sendPreamble(endpoint);
  return { endpoint, deviceInterface };
};

const scrollAnimation = async (
  endpoint: OutEndpoint,
  frames: FanFrame[],
  period: number,
  reverse: boolean = false
) => {
  let currentFrames = frames;

  while (true) {
    renderFrames(endpoint, currentFrames);
    await new Promise(r => setTimeout(r, period));
    sendPacket(endpoint, [51, 255]);
    currentFrames = scrollFrames(currentFrames, reverse);
  }
};

const circleAnimation = async (
  endpoint: OutEndpoint,
  frames: FanFrame[],
  period: number,
  reverse: boolean = false
) => {
  let currentFrames = frames;

  while (true) {
    renderFrames(endpoint, currentFrames);
    await new Promise(r => setTimeout(r, period));
    sendPacket(endpoint, [51, 255]);
    currentFrames = currentFrames.map(frame => {
      return scrollFrames([frame], reverse)[0]
    })
  }
};

const staticAnimation = async (
  endpoint: OutEndpoint,
  frames: FanFrame[]
) => {
  let currentFrames = frames;

  while (true) {
    renderFrames(endpoint, currentFrames);
    await new Promise(r => setTimeout(r, 300));
    sendPacket(endpoint, [51, 255]);
  }
};

export const start = async (
  frames: FanFrame[],
  animation: ANIMATIONS = ANIMATIONS.STATIC,
  period: number
) => {
  const devicelist = await getDevices();

  const corsairLights = devicelist.filter(device => {
    return device.product.includes(DEVICE_SEARCH_STRING);
  });

  if (corsairLights.length == 1) {
    console.log("We have found a corsair lighting node core device");
  } else {
    console.error("Failure to find corsair lighting node core device");
    process.exit(1);
  }
  const selectedDevice = corsairLights[0];

  const { endpoint, deviceInterface } = await connectToDevice(selectedDevice);

  switch (animation) {
    case(ANIMATIONS.STATIC):
      staticAnimation(endpoint, frames)
      break;
    case(ANIMATIONS.SCROLL):
      scrollAnimation(endpoint, frames, period);
      break;
    case(ANIMATIONS.SCROLL_REVERSE):
      scrollAnimation(endpoint, frames, period, true);
      break;
    case (ANIMATIONS.CIRCLE):
      circleAnimation(endpoint, frames, period)
      break;
    case (ANIMATIONS.CIRCLE_REVERSE):
      circleAnimation(endpoint, frames, period, true)
      break;
    default:
      console.error("Animation", animation, "not found. Exiting...");
      process.exit(1);
  }
};
