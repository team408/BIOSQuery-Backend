const fs = require('fs')
const path = require('path');
const { NodeSSH } = require('node-ssh');
const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh').toString()
const defaultPrivateKey = fs.readFileSync('./secrets/default.key').toString()

const secret_path = process.env.SSH_SECRET_PATH
const username = process.env.SSH_USERNAME

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
async function remoteEnrollLinuxHost(host_id, username, enrollCmd, password = null, privateKey = null){
  const sshConn = await getSSHCon(host_id, username, password, privateKey);
  try{
    console.log("[*] Enrolling Fleet agent on " + host_id)
    let response = await executeRemoteCommand(sshConn, fleetctlBashDownload);
    response = await executeRemoteCommand(sshConn, './fleetctl -v')
    response = await executeRemoteCommand(sshConn, "./" + enrollCmd)
    if (password){
      response = await executeRemoteCommand(sshConn, path.join("echo ", password, " | sudo -S dpkg -i fleet-osquery*.deb"))
    }
    else{
      response = await executeRemoteCommand(sshConn, "sudo dpkg -i fleet-osquery*.deb")
    }
  }
  catch(err){
    console.error(err)
    return
  }
  finally{
    sshConn.dispose()
  }
}

module.exports = {remoteEnrollLinuxHost}