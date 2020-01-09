import { getDeviceList, Device, Interface, OutEndpoint } from "usb";

const DEVICE_SEARCH_STRING = "CORSAIR Lighting Node CORE";
const NUM_FANS = 3;
const NUM_DEVICES_SHORT = NUM_FANS << 4;

interface DeviceObject {
  manufacturer: string;
  product: string;
  rawDevice: Device;
}

const make64 = (byteArray: number[]) => {
  while (byteArray.length < 64) {
    byteArray.push(0x00);
  }
  return byteArray;
};

const getDevices = async (): Promise<DeviceObject[]> => {
  const devices = getDeviceList().map(async rawDevice => {
    return new Promise<DeviceObject>((resolve, reject) => {
      rawDevice.open();
      rawDevice.getStringDescriptor(
        rawDevice.deviceDescriptor.iManufacturer,
        (error1, manufacturerBuffer) => {
          if (error1) {
            reject(error1);
          }
          const manufacturer = manufacturerBuffer.toString();
          rawDevice.getStringDescriptor(
            rawDevice.deviceDescriptor.iProduct,
            (error2, productBuffer) => {
              if (error2) {
                reject(error2);
              }
              const product = productBuffer.toString();
              const result: DeviceObject = {
                manufacturer,
                product,
                rawDevice
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
  console.log("Sending Packet: " + byteArray)

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

const sendPreamble = async (endpoint: OutEndpoint) => {
  console.log("Sending preamble");

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

const setColor = async (endpoint: OutEndpoint) => {
  console.log("Setting color");

  const redPacket = [ 50,
    0,
    0,
    50,
    0,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255, ]

    const greenPacket = [ 50,
      0,
      0,
      50,
      1,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255, ]

    const bluePacket = [ 50,
      0,
      0,
      50,
      2,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255, ]
    
  const confirmColor1 = [ 50, 0, 50, 46, 0 ]
  const confirmColor2 = [ 50, 0, 50, 46, 1 ]
  const comfirmColor3 = [ 50, 0, 50, 46, 2 ]

  sendPacket(endpoint, redPacket);
  sendPacket(endpoint, greenPacket);
  sendPacket(endpoint, bluePacket);

  // sendPacket(endpoint, confirmColor1);
  // sendPacket(endpoint, confirmColor2);
  // sendPacket(endpoint, comfirmColor3);

  setInterval(() => {
    sendPacket(endpoint, [ 51, 255 ])
  }, 100)
};

const connectToDevice = async (device: DeviceObject): Promise<{endpoint: OutEndpoint, deviceInterface: Interface}> => {
  console.log("Connecting to device");
  console.log(JSON.stringify(device, null, 4))
  device.rawDevice.open();
  const deviceInterface = device.rawDevice.interfaces[0];
  if(deviceInterface.isKernelDriverActive()){
    deviceInterface.detachKernelDriver()
  }
  deviceInterface.claim();
  const endpoint = deviceInterface.endpoint(1) as OutEndpoint;
  await sendPreamble(endpoint);
  return {endpoint, deviceInterface};
};

const start = async () => {
  console.log("Sarting");
  const devicelist = await getDevices();

  const corsairLights = devicelist.filter(device => {
    return device.product.includes(DEVICE_SEARCH_STRING);
  });

  if (corsairLights.length == 1) {
    console.log("We have found a corsair lighting node core device");
  } else {
    console.log("Failure to find corsair lighting node core device");
  }
  const selectedDevice = corsairLights[0];

  const {endpoint, deviceInterface} = await connectToDevice(selectedDevice);

  setColor(endpoint);

  // TODO - disconnect from device when quit
  // deviceInterface.release(() => {
  //   selectedDevice.rawDevice.close()
  // })
};

start();
