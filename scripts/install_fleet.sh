VERSION=$(curl -s https://api.github.com/repos/fleetdm/fleet/releases/latest | grep tag_name | cut -d '"' -f 4)
STRIPPED=$(echo $VERSION | cut -c 7-)
curl -L -o fleetctl  "https://github.com/fleetdm/fleet/releases/download/$VERSION/fleetctl_$STRIPPED""_linux.tar.gz"
#use services/fleet/getAgentEnrollCmd