# Control Corsair Lighting Node CORE on linux
Corsair's iCue software is only available on linux, and doesnt work with wine.
I reverse engineered the protocol to communicate with the Lighting Node CORE and wrote a script to control it on linux.

## How to install
Ensure that you have Node.js installed

```
git clone https://github.com/bobrown101/linux-corsair-lighting-node-core-control.git
cd linux-corsair-lighting-node-core-control
npm install -g yarn
yarn
sudo yarn start --help
```


## How to run
For a list of options, run
```
sudo yarn start --help
```
```
sudo yarn start
```
or to scroll through white to black,
```
sudo yarn start --colors white grey black black grey white --animation SCROLL_REVERSE --period 100
```

Let me start off by saying I barely know what Im doing, but stumbled around enough to figure it out.
This repo was a great starting point for me to learn and influenced this repo greatly: 
https://github.com/benburkhart1/lighting-node-pro

## Protocol for Lighting Node CORE
### Explanation of the hardware of SP120 fans and Lighting Node CORE
Corsair SP120 RGB PRO fans each have 8 addressable LEDs, and each LED is similar to a neopixel if you have ever used them in hobby projects like arduino. 
Neopixels can be chained together and then through a certain protocol each assigned a different color.
I am fairly confident that the Lighting Node CORE just chains the LED strips from each fan together internally with jumper cables making the fans appear as one large LED strip.

### Analogy of how to control the rgb led strips
Neopixels led strips are individual neopixels chained together. Each neopixel has one red LED, one green LED, and one blue LED that can all be set to different brightnesses that once combined create the color you desire.

Lets create a theoretical example to explain how to control them.
Lets assume each neopixel is just one color, and either on or off. 

You have a chain of 4 of these theoretical LEDs `A->B->C->D` and you would like to turn on A and C, but leave B and D off.
You would `send` them the command `1,0,1,0`.

LED A will receive `1,0,1,0` and take on the value of 1 - meaning on, and then pass on the rest (`0,1,0`) to the next LED, LED B. 
LED B then will receive `0,1,1`, take on the value of `0` - meaning off, and pass `1,0` on to LED C.
LED C will then receive `1,0`, take on the value of `1` - meaning on, and pass on `0` to LED D.
LED D will the receive `0` and take on the value of `0` - meaning off, and then there is nothing to pass on.

LED A got 1 meaning turning it on, 
LED B got 0 turning it off,
LED C got 1 turning it on,
LED D got 0 turning it off

Now lets say rather than just turning them on or off, you would like to control how bright they are.

Lets say we would like to have 
LED A @ 100% brightness, 
LED B @ 75% brightness, 
LED C @ 25% brightness,
and LED D at 0% brightness.

We would follow them same process as before, except instead of sending 1's or 0's we will send an integer between 255 and 0, where 255 is 100% brightness and 0 is 0% brightness.
So we would send ``255, 191, 64, 0`` or `[255x1, 255x.75, 255x.25, 255x0]`

Now great, we can control the brightness of these theoretical LEDS, but they are still only a single color. Well remember, each RGB neopixel is comprised of three separate LEDs, one red, one greeen, and one blue led.

So we will evolve our theoretical example.
Lets say I want LED A to be brown, LED B to cyan(blue and green combined), LED C to be off, and LED D to be white.
We are going to send four separate commands:
1) red values
`255, 0, 0, 255`
2) green values
`255, 255, 0, 255`
3) blue values
`0, 255, 0, 255`
4) set/done

So what we are left with is:
LED A has the red and green leds lit giving us the color brown
LED B has the green and blue leds lit giving us the color cyan
LED C has no leds lit leaving it off
LED D has all leds lit giving us the color white


### Actual protocol with LEDS
#### Preamble
Before we send any instructions to the fans' leds we need to give it a series of preamble commands. They are:
```
55
53,0,0,48,0,1,1
59,0,1
56,0,2
52
55,1
52,1
56,1,1
51,255
```
Dont ask me what they do, I have no idea. This was a key portion I learned from Ben Burkharts repository.

#### Setting colors
After sending the preamble there are four commands required to set a full rgb spectrum:
1) red values
2) green values
3) blue values
4) done

The pricinples for commands 1, 2, and 3 are the same.

The first four values of commands 1,2,3 are [50,0,0,50] .... again I honestly have no clue what they do.
The fifth value is a 0, 1, or a 2 that indicates if you are setting the red, green, or blue part of the leds
0 indicates red
1 indicates green
2 indicates blue

The rest of the indexes of commands 1,2,3 each represent a neopixel within the chain of fans.

Here is an example to set all 8 leds in fan1 to 100% on, all red leds in fan2 to 50%, and red leds in fan3 to off
```
[50,0,0,50,0,255,255,255,255,255,255,255,255,128,128,128,128,128,128,128,128,0,0,0,0,0,0,0,0]
```

#### Set/Done command
After sending commands 1,2,3 or the red green and blue instructions, we send on last simple command that means `commit`, or `okay we are done sending instructions, turn the lights on`
This command is 
```
[51,255]
```

This might be useful if you only want adjust only one or two of the colors of the leds rather than all three.
For example if I only wanted to set the red and green colors, I would do
```
[50,0,0,50,0,......]
[50,0,0,50,1,......]
[51,255]
```

## FAQ

### I get  `Error: The module ... was compiled against a different Node.js version using...`
This most likely happened because when you ran `yarn` or `npm i` as not root that uses a different version of node than root.
This happened to me because I had nvm setup only for my current user, and not all users on the system.
You can fix this issue many ways, I used this:
```
sudo ln -s `$NVM_DIR/versions/node/$(nvm version)/bin/node` `/usr/local/bin/node`
sudo ln -s `$NVM_DIR/versions/node/$(nvm version)/bin/npm` `/usr/local/bin/npm`
```