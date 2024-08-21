#!/bin/sh
set -e
lsmod | grep chipsec 1>/dev/null 2>&1 && echo "Chipsec already insalled :)" && exit
(python3 -m pip install -U pip && python3 -m pip install -U setuptools && python3 -m pip install -U virustotal-api) || true
sudo apt install python3-virustotal-api
curl -L -o /tmp/chipsec-1.13.0.tar.gz https://github.com/chipsec/chipsec/archive/refs/tags/1.13.0.tar.gz
tar -xzf /tmp/chipsec-1.13.0.tar.gz -C /tmp
cd /tmp/chipsec-1.13.0/
sudo python3 /tmp/chipsec-1.13.0/setup.py install
sudo python3 /tmp/chipsec-1.13.0/setup.py build_ext -i
sudo insmod /tmp/chipsec-1.13.0//chipsec/helper/linux/chipsec.ko
lsmod | grep chipsec