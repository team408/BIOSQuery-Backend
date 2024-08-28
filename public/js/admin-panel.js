//public/js/admin-panel.js
document.getElementById('scanSettingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const scanFrequency = document.getElementById('scanFrequency').value;
    const scanTime = document.getElementById('scanTime').value;
    const autoScan = document.getElementById('autoScan').checked;

    try {
        const response = await fetch('/admin-panel/save-scan-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ scanFrequency, scanTime, autoScan })
        });

        const data = await response.json();
        if (data.success) {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            document.querySelector('.modal-body').textContent = data.message;
            successModal.show();
        } else {
            alert('Failed to save scan settings.');
        }
    } catch (error) {
        console.error('Error saving scan settings:', error);
    }
});
document.getElementById('moduleSettingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const endpoint = document.getElementById('endpointSelect').value;
    const selectedModules = Array.from(document.getElementById('moduleSelect').selectedOptions).map(option => option.value);
    try {
        const response = await fetch('/admin-panel/save-module-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ endpoint, selectedModules })
        });
        const data = await response.json();
        if (data.success) {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            document.querySelector('.modal-body').textContent = data.message;
            successModal.show();
        } else {
            alert('Failed to save module settings.');
        }
    } catch (error) {
        console.error('Error saving module settings:', error);
    }
});
document.addEventListener('DOMContentLoaded', function() {
    fetch('/admin-panel')
        .then(response => response.json())
        .then(data => {
            const { moduleSettings } = data;
            const endpointSelect = document.getElementById('endpointSelect');
            Object.keys(moduleSettings.selectedModules).forEach(endpoint => {
                const option = document.createElement('option');
                option.value = endpoint;
                option.textContent = endpoint;
                endpointSelect.appendChild(option);
            });
            const moduleSelect = document.getElementById('moduleSelect');
            moduleSettings.availableModules.forEach(module => {
                const option = document.createElement('option');
                option.value = module;
                option.textContent = module;
                moduleSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading module settings:', error));
});