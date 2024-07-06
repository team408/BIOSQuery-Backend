const fs = require('fs')
const exec = require('child_process').exec

const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh')
const secret_path = './secrets/kali.key';
const username = 'kali'
/**
 * @param {string} enrollCmd enrollmentCmd of host
 * @param {string} host_id either dns or ip of host to be enrolled
 */
function remoteEnrollLinHost(enrollCmd, host_id = "kali"){
    // cmd = fleetctlBashDownload + ";" + enrollCmd 
    // console.log("Full shh command: " + 'ssh -o StrictHostKeyChecking=no -i .\\secrets\\kali.key kali@' + host_id +' \"'+ cmd + '\"')
    
    //install fleetctl
    exec('cat ./scripts/install_fleet.sh | ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id , (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      })

    exec('ssh -o StrictHostKeyChecking=no -i ' + secret_path + ' ' + username + '@' + host_id  + ' ' + enrollCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      })
    // validate response as successful or failed
}

module.exports = {remoteEnrollLinHost}