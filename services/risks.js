const fleetService = require('../services/fleet');

async function getLatestChipsecExecutions(hostId) {
    const endpoint = await fleetService.getEndpoint(hostId);
    const scriptsExecutionDetails = await fleetService.getScriptsBySingleEndpoint(endpoint);
    const wantedScripts = [
        'chipsec_common_bios_ts.sh',
        'chipsec_common_bios_wp.sh',
        'chipsec_common_smm.sh',
        'chipsec_common_smrr.sh',
        'chipsec_common_spi_desc.sh',
        'chipsec_common_spi_lock.sh',
        'chipsec_tools_smm_smm_ptr.sh',
    ]
    const scriptsExecutionDetailsWithoutNA = scriptsExecutionDetails.map(execution => {
        return {
            ...execution,
            execution_time: execution.execution_time === 'N/A' ? new Date('1970-01-01T00:00:00Z') : new Date(execution.execution_time),
            status: execution.status === 'N/A' ? 'error' : execution.status
        };})

    lastChipsecExecutions = {};
    for (const script of wantedScripts) {
        lastChipsecExecutions[script] = scriptsExecutionDetailsWithoutNA
            .filter(execution => execution.script === script)
            .sort((a, b) => b.execution_time - a.execution_time)
            [0];
    }
    return lastChipsecExecutions;
}

async function getAllHostsRisks() {
    const endpoints = await fleetService.listEndpoints();
    const risks = await Promise.all(
        endpoints.hosts.map(async (host) => {
            return {
                host: host.hostname,
                hostId: host.id,
                risk: await calculateRisk(host.id),
                ip: host.primary_ip,
                mac: host.primary_mac,
                os: host.platform,
                details: " ",
                vulnerabilities: host.vulnerabilities || [], // we need to replace it with actual vulnerability data
                softwareVersion: host.softwareVersion || '1.0.0', // we need to replace it with actual software version
                securityFeatures: host.securityFeatures || ['Secure Boot'] // we need to replace it with actual security features          
            };
        })
    );
    return risks;
}

async function calculateRisk(hostId) {
    let succeededModules = 0;
    let executionScriptsDetails = await fleetService.getScriptByEndpoint([host]);
    let wantedScripts = [
        'chipsec_common_bios_ts.sh',
        'chipsec_common_bios_wp.sh',
        'chipsec_common_smm.sh',
        'chipsec_common_smrr.sh',
        'chipsec_common_spi_desc.sh',
        'chipsec_common_spi_lock.sh',
        'chipsec_tools_smm_smm_ptr.sh',
        'chipsec_tools_uefi_reputation.sh',
    ]
    let lastScriptExecutions = getLatestChipsecExecutions(executionScriptsDetails, wantedScripts);
    // Calculate risk score: number of 'Ran' out of all scripts
    for (const script in lastScriptExecutions) {
        if (lastScriptExecutions[script].status === 'ran') {
            succeededModules += 1;
        }
    }

    let riskLevel;
    if (succeededModules <= 2) {
        riskLevel = 'High';
    } else if (succeededModules <= 4) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'Low';
    }
    return riskLevel;
}

async function getMitigationAdvices() {
    const advices = [
        { risk: 'Risk 1', advice: 'Update BIOS to the latest version available from the vendor.' },
        { risk: 'Risk 2', advice: 'Ensure Secure Boot is enabled in the BIOS settings.' },
        { risk: 'Risk 3', advice: 'Run a full system scan with updated antivirus software.' },
        { risk: 'Risk 4', advice: 'Check and disable unused hardware interfaces in BIOS.' },
        // we need to add more advices and update to real risks
    ];
    return advices;
}

async function generateCSVReport(risks) {
    let csvContent = "Host,Risk,IP,MAC,OS,Details\n";
    risks.forEach(risk => {
        csvContent += `${risk.host},${risk.risk},${risk.ip},${risk.mac},${risk.os},${risk.details}\n`;
    });
    return csvContent;
}

module.exports = { getAllHostsRisks, getMitigationAdvices, generateCSVReport, getLatestChipsecExecutions};