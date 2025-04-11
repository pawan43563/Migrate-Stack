# Serve.js

This script is designed to interact with the Contentstack Apps API to fetch and update installation details for a specific app. It performs the following tasks:

1. Fetches installation details for a specific installation.
2. Fetches a list of app installations.
3. Updates the configuration and server configuration for each app installation.

## Prerequisites

Before running the script, ensure you have the following:

- A valid `AUTHTOKEN` for authentication.
- The `ORG_UID` (Organization UID) of your Contentstack organization.
- The `INSTALLATION_UID` of the specific installation you want to fetch details for.
- The `APP_UID` of the app whose installations you want to update.

## How It Works

### 1. Fetch Installation Details
The `fetchInstallationDetails` function retrieves the installation details for the specified `INSTALLATION_UID` and stores them in the `installationData` variable.

### 2. Fetch and Update Installations
The `fetchAndUpdateInstallations` function:
- Fetches a list of installations for the specified `APP_UID`.
- Iterates over the list of installations and updates each one with the configuration and server configuration from `installationData`.

### 3. Save Configuration to Target Locale
The `saveConfigToTargetLocale` function orchestrates the process by:
- Fetching the installation details.
- Fetching and updating the app installations.

## Usage

1. Clone the repository or copy the `index.js` file to your project.
2. Update the following constants in the file with your specific values:
   ```javascript
   const AUTHTOKEN = "<your-auth-token>";
   const ORG_UID = "<your-organization-uid>";
   const INSTALLATION_UID = "<your-installation-uid>";
   const APP_UID = "<your-app-uid>";
3. run ```npm i & node index.js```

## NOTE
If your XTM App has workflows configured, the corresponding webhooks must also be set. In this case, you need to manually add workflows for all stacks.