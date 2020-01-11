import { getDeviceList, Device, Interface, OutEndpoint, on } from "usb";
import { FanFrame } from "./animations/frames";
import { ANIMATION_INFORMATION, runAnimation } from "./animations";
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

export type RenderMethod = (fanFrames: FanFrame[]) => Promise<void>;
export type SetMethod = () => Promise<void>;

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

const createSetMethod = (endpoint: OutEndpoint): SetMethod => {
  return async () => {
    await sendPacket(endpoint, [51, 255]);
  };
};

const createRenderMethod = (
  endpoint: OutEndpoint,
  numFans: number,
  numLedsPerFan: number
): RenderMethod => {
  return async (fanFrames: FanFrame[]) => {
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

    // Lets say we have a frame that looked like this
    // 50,0,0,50,0,0,0,0,0,0,0,0,0,51,51,51,51,51,51,51,51,102,102,102,102,102,102,102,102,153,153,153,153,153,...
    // Obviously its longer than numFans*numLedsPerFan
    // The controller only reads the information it needs and ignores the rest, but if it gets long enough,
    // the controler will hang up and not respond unless you reboot. I theorize its a buffer overflow somehwere
    // So to get around this we will trim the array to the length we need.
    const sliceIndex = numFans * numLedsPerFan + beginArr.length + 1;
    await sendPacket(endpoint, redCommand.slice(0, sliceIndex));
    await sendPacket(endpoint, greenCommand.slice(0, sliceIndex));
    await sendPacket(endpoint, blueCommand.slice(0, sliceIndex));
  };
};

const connectToDevice = async (
  device: LightingNodeCore
): Promise<{ endpoint: OutEndpoint; deviceInterface: Interface }> => {
  const sendPreamble = async (endpoint: OutEndpoint) => {
    console.log(device.deviceID, "- initializing ....");

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

export const start = async (animationInformation: ANIMATION_INFORMATION) => {
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

  const renderMethod = createRenderMethod(
    endpoint,
    animationInformation.numberFans,
    animationInformation.ledsPerFan
  );
  const setMethod = createSetMethod(endpoint);

  runAnimation(animationInformation, renderMethod, setMethod);
};
