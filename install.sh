#!/bin/bash

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

sudo git clone https://github.com/bobrown101/linux-corsair-lighting-node-core-control.git /etc/linux-corsair-lighting-node-core-control 

cd /etc/linux-corsair-lighting-node-core-control

yarn

sudo echo "#!/bin/bash
yarn update
cd /etc/linux-corsair-lighting-node-core-control
sudo yarn start --colors white white white --animation STATIC --period 80 --brightness 100" > /usr/bin/computer-lights

sudo chmod +x /usr/bin/computer-lights

sudo echo "[Unit]
Description=Turn on computer RGB lights

[Service]
ExecStart=/usr/bin/computer-lights

[Install]
WantedBy=multi-user.target
" > /etc/systemd/system/computer-lights.service

sudo systemctl enable computer-lights
sudo systemctl start computer-lights
echo "Finished."
echo "If you would like to change the colors, animation, period, brightness, ledsPerFan, numberFans, or any other configuration option, please edit the /usr/bin/computer-lights file"