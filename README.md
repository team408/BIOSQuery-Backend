# BIOSQuery Backend
This is the main repo for the BIOSQuery's backend

## Setup

1. Install nodejs [from here](https://nodejs.org/en/download/package-manager)

2. Clone git repository

```bash
git clone https://github.com/team408/BIOSQuery-Backend.git
cd BIOSQuery-Backend
```

3. Install dependencies
```bash
npm install
```

4. Create the `.env` file and add values
```bash
# Add the wanted values:
LISTEN_PORT=3000
FLEET_SERVER={{server_url}}
FLEET_SERVER_PORT={{server_port}}
FLEET_API_TOKEN={{api_token}}
# accepting insecure requests
NODE_TLS_REJECT_UNAUTHORIZED=0 
```

5. Start the app
```bash
node app.js
```

6. [Optional] Add a `vscode` launch file
```bash
mkdir .vscode

# Copy all of these lines to your bash terminal
cat <<EOF > .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/app.js"
        }
    ]
}
EOF
```