#!/bin/bash

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

sudo systemctl stop computer-lights
sudo systemctl disable computer-lights
sudo rm -rf /etc/systemd/system/computer-lights.service
sudo rm -rf /usr/bin/computer-lights
sudo rm -rf /etc/linux-corsair-lighting-node-core-control
echo "Finished."