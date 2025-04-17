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

      for (const app of allInstallations) {
        if (targetUids.includes(app.uid)) {
          console.log(`➡️ Updating target UID: ${app.uid} from source UID: ${sourceUid}`);
          const payload = {
            configuration: sourceData?.data?.configuration,
            server_configuration: sourceData?.data?.server_configuration,
            ...app
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
