import { LightingNodeCore, connectToDevice, RGBDevice, getDevices, sendPacket } from "./controller";
import { getDeviceList, Device, OutEndpoint, Endpoint } from "usb";
import { LEDColor } from "./animations/frames";

const PRODUCT_SEARCH_STRING = "amd sr4 lamplight control"
const AURA_SEARCH_STRING = "asustek computer inc.-aura led controller"

export interface WraithPrism extends RGBDevice{
    deviceID: string;
    manufacturer: string;
    product: string;
    rawDevice: Device;
  }


const setFanColor = async (color: LEDColor, endpoint: OutEndpoint) => {
    let buff =
    [
        0x51, 0x2C, 0x01, 0x00,
        0x06, 0xFF, 0x00, 0x01,
        0xFF, 0xFF, 0x00, 0xFF,
        0x00, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF
    ];
    const redLocation = 10
    const greenLocation = 11
    const blueLocation = 12

    buff[redLocation] = color.red;
    buff[greenLocation] = color.green;
    buff[blueLocation] = color.blue;

    await sendPacket(endpoint, buff)


}
  

const start = async () => {
  const devices = await getDevices();
  const device = devices.filter(device => {
      return device.deviceID.trim().toLowerCase().includes(PRODUCT_SEARCH_STRING)
  })[0]
  const {endpoint, deviceInterface} = await connectToDevice(device, 1, 4)
  console.log(endpoint)
  await setFanColor({red: 0, green: 0, blue: 0}, endpoint)
};

start()