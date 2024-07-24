document.getElementById('authMeth').addEventListener('change', function() {
    var authMeth = this.value;
    var credentialsSection = document.getElementById('credentials');
    var privateKeySection = document.getElementById('privateKeySection');
    if (authMeth === 'pass') {
        credentialsSection.style.display = 'block';
        privateKeySection.style.display = 'none';
    } else if (authMeth === 'key') {
        credentialsSection.style.display = 'none';
        privateKeySection.style.display = 'block';
    }
});

document.getElementById('defaultKeyCheckbox').addEventListener('change', function() {
    var privateKeyInput = document.getElementById('privateKey');
    if (this.checked) {
        privateKeyInput.disabled = true;
    } else {
        privateKeyInput.disabled = false;
    }
});