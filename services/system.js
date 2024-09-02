const fs = require('fs')
const path = require('path');
const { NodeSSH } = require('node-ssh');
const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh').toString()
const defaultPrivateKey = fs.readFileSync('./secrets/default.key').toString()

const secret_path = process.env.SSH_SECRET_PATH
const username = process.env.SSH_USERNAME

const installerByOs = {"ubuntu": "apt", "centos" : "yum"}
const dpkgByOs = {"ubuntu": "dpkg", "centos" : "rpm"}

async function getSSHCon(host, username, password = null, privateKey = null) {
  const ssh = new NodeSSH();
  if (!password && !privateKey) {
    throw new Error('Either "password" or "privateKey" parameter is required.');
  }
  if (privateKey === "default"){
    privateKey = defaultPrivateKey
  }
  const connectionConfig = {
      host: host,
      username: username,
      ...(password ? { password: password } : { privateKey: privateKey })
      // privateKeyPath: secret_path
  };

  await ssh.connect(connectionConfig);
  return ssh;
}

//sshCon must be an [ssh = new NodeSSH(); ssh.connect(connectionConfig)] type.
async function executeRemoteCommand(sshCon, command) {
  const result = await sshCon.execCommand(command);
  return result; // result.stdout and result.stderr
}

/**
 * @param {string} host_id either dns or ip of host to be enrolled
 * @param {string} username username
 * @param {string} enrollCmd enrollmentCmd of host
 * @param {string} password either passwor dor private key to complete ssh auth
 * @param {string} privateKey either password or private key to complete ssh auth
 */
async function remoteEnrollLinuxHost(host_id, username, osType, enrollCmd, password = null, privateKey = null){
  const sshConn = await getSSHCon(host_id, username, password, privateKey);
  try{
    console.log("[*] Enrolling Fleet agent on " + host_id)
    let cmdInstallCurl
    if (password){
      cmdInstallCurl = ["echo ", password, " | sudo -S ", installerByOs[osType], " update && echo ", password, " | sudo ", installerByOs[osType], " -y install curl;"].join("");
    }
    else{
      cmdInstallCurl = ["sudo ", installerByOs[osType], " update && ", installerByOs[osType], " -y install curl;"].join("");
    }
    let response = await executeRemoteCommand(sshConn, cmdInstallCurl);
    response = await executeRemoteCommand(sshConn, fleetctlBashDownload);
    response = await executeRemoteCommand(sshConn, './fleetctl -v')
    
    // Validation for fleetctl installation
    if (response.stdout.search("fleetctl.*version") == -1)
      return false; 
    response = await executeRemoteCommand(sshConn, "./" + enrollCmd)
    
    // Validatation for pckg downloading
    if (response.stdout.search("Generating your fleetd agent...\n\nSuccess!") == -1)
      return false;
    if (password){
      response = await executeRemoteCommand(sshConn, ["echo ", password, " | sudo -S ", dpkgByOs[osType], " -i fleet-osquery*.deb"].join(""))
    }
    else{
      response = await executeRemoteCommand(sshConn, "sudo " + dpkgByOs[osType] +" -i fleet-osquery*.deb")
    }
    
    //validation for successful installation
    if (response.stdout.search("Created symlink") == -1)
      return false;
    return true
  }
  catch(err){
    console.error(err)
    return false
  }
  finally{
    sshConn.dispose()
  }
}

module.exports = {remoteEnrollLinuxHost}