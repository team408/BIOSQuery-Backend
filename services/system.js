const { error } = require('console');
const fs = require('fs');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const exec = require('child_process').exec
const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh').toString();
const defaultPrivateKey = fs.readFileSync('./secrets/default.key').toString();

const secret_path = process.env.SSH_SECRET_PATH;
const username = process.env.SSH_USERNAME;

async function getSSHCon(host, username, password = null, privateKey = null) {
  const ssh = new NodeSSH();
  if (!password && !privateKey) {
    throw new Error('Either "password" or "privateKey" parameter is required.');
  }
  if (privateKey === "default"){
    privateKey = defaultPrivateKey;
  }
  const connectionConfig = {
      host: host,
      username: username,
      ...(password ? { password: password } : { privateKey: privateKey })
      // privateKeyPath: secret_path
  };
  console.log(`Connecting to host ${host} as user ${username}`);
  await ssh.connect(connectionConfig);
  console.log('SSH connection established');
  return ssh;
}

//sshCon must be an [ssh = new NodeSSH(); ssh.connect(connectionConfig)] type.
async function executeRemoteCommand(sshCon, command) {
  console.log(`Executing command: ${command}`);
  const result = await sshCon.execCommand(command);
  console.log(`Command stdout: ${result.stdout}`);//check
  console.log(`Command stderr: ${result.stderr}`);//check
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
    console.log('Enrolling Fleet agent on ${host_id}');
    let response = await executeRemoteCommand(sshConn, fleetctlBashDownload);
    response = await executeRemoteCommand(sshConn, './fleetctl -v');
    response = await executeRemoteCommand(sshConn, "./" + enrollCmd);
    if (password){
      response = await executeRemoteCommand(sshConn, path.join("echo ", password, " | sudo -S dpkg -i fleet-osquery*.deb"));
    } else {
      response = await executeRemoteCommand(sshConn, "sudo dpkg -i fleet-osquery*.deb");
  }
} catch (err) {
  console.error(err);
  return;
} finally {
  sshConn.dispose();
    }
  }
    
  async function remoteUninstallFleetAgent(host_id, username, password = null, privateKey = null) {
    const sshConn = await getSSHCon(host_id, username, password, privateKey);
    try {
        console.log(`Uninstalling Fleet agent on ${host_id}`);
        let response;
        if (password) {
            response = await executeRemoteCommand(sshConn, `echo ${password} | sudo -S dpkg -r fleet-osquery`);
        } else {
            response = await executeRemoteCommand(sshConn, "sudo dpkg -r fleet-osquery");
        }
        console.log(response);
        return response;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        sshConn.dispose();
    }
}


module.exports = {remoteEnrollLinuxHost, remoteUninstallFleetAgent };