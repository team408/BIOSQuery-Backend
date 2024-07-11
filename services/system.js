const fs = require('fs')
const exec = require('child_process').exec

const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh')
const secret_path = process.env.SSH_SECRET_PATH
const username = process.env.SSH_USERNAME
/**
 * @param {string} enrollCmd enrollmentCmd of host
 * @param {string} host_id either dns or ip of host to be enrolled
 */
async function remoteEnrollLinuxHost(enrollCmd, host_id = "kali"){
    // cmd = fleetctlBashDownload + ";" + enrollCmd 
    exec("ssh-keygen -R " + host_id)
    //install fleetctl
    // console.log("[*] Executing: " + 'type .\\scripts\\install_fleet.sh | ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id)
    // exec('cat ./scripts/install_fleet.sh | ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id , (error, stdout, stderr) => { //for linux web server
    exec('type .\\scripts\\install_fleet.sh | ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id , (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);
      })
    await new Promise(r => setTimeout(r, 10000));
    // console.log("[*] Executing: " + 'ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' \"./' + enrollCmd + ' sudo dpkg -i fleet-osquery*.deb\"')
    exec('ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' \"./' + enrollCmd + ' sudo dpkg -i fleet-osquery*.deb\"', (error, stdout, stderr) => {
    // exec('ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' \"sudo dpkg -i fleet-osquery*.deb\"', (error, stdout, stderr) => { //If you already downloaded the pkg and want it to go faster, tests only
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);
      })
    // validate response as successful or failed
}

module.exports = {remoteEnrollLinuxHost}