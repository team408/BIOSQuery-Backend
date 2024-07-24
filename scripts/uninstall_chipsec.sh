# Check if Chipsec is installed with lsmod

#!/bin/sh
set -e
lsmod | grep chipsec 1>/dev/null 2>&1 || (echo "Chipsec not insalled :)" && exit)

sudo rmmod /tmp/chipsec-1.13.0//chipsec/helper/linux/chipsec.ko && \
echo "Uninstalled Chipsec :)" && exit