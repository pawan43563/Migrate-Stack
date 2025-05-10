// CONSTANTS
const AUTHTOKEN = "";
const ORG_UID = "";
const APP_UID = "629099e29efe3000190bf7b7";

const INSTALLATION_DATA = {
  "source_uid_1": ["target_installtion_uid_1", "target_installtion_uid_2"],
  "source_uid_2": ["target_installtion_uid_3"]
};


// Fetch installation data for a given UID
async function fetchInstallationDetails(uid) {
  try {
    const response = await fetch(`https://app.contentstack.com/apps-api/installations/${uid}/installationData`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "organization_uid": ORG_UID,
        "authtoken": AUTHTOKEN
      }
    });

    return await response.json();
  } catch (error) {
    console.error(`Error fetching installation details for ${uid}:`, error);
    throw error;
  }
}

// Update a specific installation
async function updateInstallation(uid, payload) {
  try {
    const res = await fetch(`https://app.contentstack.com/apps-api/installations/${uid}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "organization_uid": ORG_UID,
        "authtoken": AUTHTOKEN
      },
      body: JSON.stringify(payload)
    });

    console.log(`✅ Updated ${uid} → Status: ${res.status}`);
  } catch (error) {
    console.error(`❌ Error updating installation ${uid}:`, error);
  }
}

const processKeys = (keysObject) => {
    if (keysObject && Object.keys(keysObject)?.length) {
        Object.keys(keysObject).forEach((key) => {
            const value = keysObject[key];
            if (Array.isArray(value)) {
                const isValidStructure = value.some(item => item?.label && item?.value);
                if (isValidStructure) {
                    keysObject[key] = value.map(item => item.value ?? item);
                }
            }
        });
    }
}

// Main function to update target installations
async function fetchAndUpdateInstallations() {
  try {
    // Step 1: Fetch all installations under the app
    const response = await fetch(`https://app.contentstack.com/apps-api/manifests/${APP_UID}/installations`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "organization_uid": ORG_UID,
        "authtoken": AUTHTOKEN
      }
    });

    const appInstallations = await response.json();
    const allInstallations = appInstallations?.data || [];

    console.info(`📦 Found ${allInstallations.length} installations for app UID ${APP_UID}`);

    // Step 2: For each source → targets map
    for (const [sourceUid, targetUids] of Object.entries(INSTALLATION_DATA)) {
      console.log(`🔄 Processing source UID: ${sourceUid}`);
      const sourceData = await fetchInstallationDetails(sourceUid);

      const configuration = sourceData?.data?.configuration;
      if (configuration) {
            processKeys(configuration.excludeKeys);
            processKeys(configuration.includeKeys);
      }

      const server_configuration = sourceData?.data?.server_configuration;
      if (server_configuration) {
          processKeys(server_configuration.excludeKeys);
          processKeys(server_configuration.includeKeys);
      }

      await updateInstallation(sourceUid, {
        ...sourceData?.data,
        configuration,
        server_configuration,
      });


      for (const app of allInstallations) {
        if (targetUids.includes(app.uid)) {
            console.log(`➡️ Updating target UID: ${app.uid} from source UID: ${sourceUid}`);

            const apiKey = app?.target?.uid;
            const configurationCopy = JSON.parse(JSON.stringify(configuration));

            if (configurationCopy?.roles) {
                // fetch all the roles of target stack and replace the role uid by checking the name;
                const rolesResponse = await fetch("https://app.contentstack.com/api/v3/roles", {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                        "api_key": apiKey,
                        "authtoken": AUTHTOKEN
                    }
                });

                const rolesData = await rolesResponse.json();
                const targetRoles = rolesData?.roles || []; // Access roles from the data object
                // Replace the role UID by checking the name
                configurationCopy.roles = configurationCopy.roles.map(role => {
                    const matchingRole = targetRoles.find(targetRole => targetRole.name === role.label);
                    if (role?.label === "Admin") return role;
                    return matchingRole ? { label: matchingRole.name, value: matchingRole.uid } : null;
                }).filter(role => role !== null);
            }

            if (configurationCopy?.envs) {
                // fetch all the envs of target stack and replace the env uid by checking the name;
                const envsResponse = await fetch("https://app.contentstack.com/api/v3/environments", {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                        "api_key": apiKey,
                        "authtoken": AUTHTOKEN
                    }
                });

                const envsData = await envsResponse.json();
                const targetEnvs = envsData?.environments || []; // Access roles from the data object
                // Replace the env UID by checking the name
                configurationCopy.envs = configurationCopy.envs.map(env => {
                    const matchingEnv = targetEnvs.find(targetEnv => targetEnv.name === env.label);
                    return matchingEnv ? { label: matchingEnv.name, value: matchingEnv.uid } : null;
                }).filter(env => env !== null);
            }
            

            const payload = {
                ...app,
                configuration: configurationCopy,
                server_configuration,
            };
            await updateInstallation(app.uid, payload);
        }
      }
    }
  } catch (error) {
    console.error("🚨 Error in fetchAndUpdateInstallations:", error);
  }
}

// Run the script
async function saveConfigToTargetLocales() {
  await fetchAndUpdateInstallations();
}

saveConfigToTargetLocales();
