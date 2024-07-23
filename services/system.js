const { error } = require('console');
const fs = require('fs')
const path = require('path');
const { NodeSSH } = require('node-ssh');
const exec = require('child_process').exec
const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh').toString()

const secret_path = process.env.SSH_SECRET_PATH
const username = process.env.SSH_USERNAME

async function getSSHCon(host, username, password = null, privateKey = null) {
  const ssh = new NodeSSH();
  if (!password && !privateKey) {
    throw new Error('Either "password" or "privateKey" parameter is required.');
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
  return result;
}

/**
 * @param {string} host_id either dns or ip of host to be enrolled
 * @param {string} username username
 * @param {string} enrollCmd enrollmentCmd of host
 * @param {string} password either passwor dor private key to complete ssh auth
 * @param {string} privateKey either passwor dor private key to complete ssh auth
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
      response = await executeRemoteCommand(sshConn, "sudo -S dpkg -i fleet-osquery*.deb")
    }
  }
  catch(err){
    console.error(err)
    return
  }
  finally{
    sshConn.dispose()
  }


    // // cmd = fleetctlBashDownload + ";" + enrollCmd 
    // exec("ssh-keygen -R " + host_id)
    // //install fleetctl
    // console.log("[*] Installing fleetctl.")
    // // exec('cat ./scripts/install_fleet.sh | ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id , (error, stdout, stderr) => { //for linux web server
    // exec('type .\\scripts\\install_fleet.sh | ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id , (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`exec error: ${error}`);
    //       return;
    //     }
    //     // console.log(`stdout: ${stdout}`);
    //     // console.error(`stderr: ${stderr}`);
    //   })
    // await new Promise(r => setTimeout(r, 50000));
    // console.log("[*] Enrolling Agent (Might take some time).")
    // // console.log("[*] Executing: " + 'ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' \"./' + enrollCmd + ' sudo dpkg -i fleet-osquery*.deb\"')
    // exec('ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' \"./' + enrollCmd + ' sudo dpkg -i fleet-osquery*.deb\"', (error, stdout, stderr) => {
    // // exec('ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' \"sudo dpkg -i fleet-osquery*.deb\"', (error, stdout, stderr) => { //If you already downloaded the pkg and want it to go faster, tests only
    //     if (error) {
    //       console.error(`exec error: ${error}`);
    //       return;
    //     }
    //     // console.log(`stdout: ${stdout}`);
    //     // console.error(`stderr: ${stderr}`);
    //   })
    // // validate response as successful or failed
}

module.exports = {remoteEnrollLinuxHost}