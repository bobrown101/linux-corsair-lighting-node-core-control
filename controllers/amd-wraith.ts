import { LightingNodeCore } from "../controller";
import { getDeviceList } from "usb";

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

const start = async () => {
  const devices = await getDevices();
  console.log("hey", devices)
};

start()