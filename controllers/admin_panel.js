//controllers/admin_panel.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { fleetUrl } = require('../services/fleet');
const fleetService = require('../services/fleet');


async function getAdminPanel(req, res) {
    try {
        // Fetch current scan settings from Fleet API
        const scanSettingsUrl = `${fleetUrl}/api/v1/fleet/scripts`;  
        const scanSettingsResponse = await axios.get(scanSettingsUrl, {
            headers: {
                "Authorization": `Bearer ${process.env.FLEET_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        const scanSettings = scanSettingsResponse.data;

        // Load local module settings
        const moduleSettingsPath = path.join(__dirname, '..', 'config', 'moduleSettings.json');
        const moduleSettings = JSON.parse(fs.readFileSync(moduleSettingsPath, 'utf8'));

        // Render admin panel with the settings
        res.render('admin_panel', { scanSettings, moduleSettings });
    } catch (error) {
        console.error('Error loading admin panel:', error);
        res.status(500).send('Internal Server Error');
    }
}


async function saveScanSettings(req, res) {
    try {
        const { scanFrequency, scanTime, autoScan } = req.body;

        // Update scanSettings.json
        const scanSettingsPath = path.join(__dirname, '..', 'config', 'scanSettings.json');
        const scanSettings = { scanFrequency, scanTime, autoScan: autoScan === 'true' };
        
        fs.writeFileSync(scanSettingsPath, JSON.stringify(scanSettings, null, 2));

        // Schedule scan via Fleet API
        await fleetService.scheduleScan(scanSettings);

        res.status(200).send({ success: true, message: 'Scan settings saved and scan scheduled successfully.' });
    } catch (error) {
        console.error('Error saving scan settings:', error);
        res.status(500).send('Internal Server Error');
    }
}
async function saveModuleSettings(req, res) {
    try {
        const { endpoint, selectedModules } = req.body;
        const moduleSettingsPath = path.join(__dirname, '..', 'config', 'moduleSettings.json');
        const moduleSettings = JSON.parse(fs.readFileSync(moduleSettingsPath, 'utf8'));
        moduleSettings.selectedModules[endpoint] = selectedModules;
        fs.writeFileSync(moduleSettingsPath, JSON.stringify(moduleSettings, null, 2));
        // Optionally, send module assignments to Fleet (if required)
        await fleetService.assignModulesToEndpoint(endpoint, selectedModules);
        res.status(200).send({ success: true, message: 'Module settings saved successfully.' });
    } catch (error) {
        console.error('Error saving module settings:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { getAdminPanel, saveScanSettings, saveModuleSettings  };
