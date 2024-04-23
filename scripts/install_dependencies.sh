if [ -f /etc/debian_version ]; then
    sudo apt-get install build-essential gcc linux-headers-$(uname -r) nasm python3-dev python3-setuptools python3-pip curl -y
elif [ -f /etc/redhat-release ]; then
    sudo yum install gcc kernel-devel nasm python3-devel python3-setuptools python3-pip curl -y
fi