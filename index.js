// CONSTANTS
const AUTHTOKEN = "";
const ORG_UID = "";
const INSTALLATION_UID = "";
const APP_UID = "629099e29efe3000190bf7b7";

let installationData;

// Fetch installation details
async function fetchInstallationDetails() {
    try {
        const response = await fetch(`https://app.contentstack.com/apps-api/installations/${INSTALLATION_UID}/installationData`, {
            "headers": {
              "content-type": "application/json",
              "organization_uid": ORG_UID,
              "authtoken": AUTHTOKEN
            },
            "method": "GET"
        });

        const installation = JSON.parse(await response.text())

        installationData = installation;

    } catch (error) {
        console.error("Error fetching installation details:", error);
    }
}

const fetchAndUpdateInstallations = async () => {
    try {
        const appResponse = await fetch(`https://app.contentstack.com/apps-api/manifests/${APP_UID}/installations`, {
            "headers": {
                "content-type": "application/json",
                "organization_uid": ORG_UID,
                "authtoken": AUTHTOKEN
            },
            "method": "GET"
        });
        const appLists = JSON.parse(await appResponse.text());
        console.info(`AppResponse`, appLists);
        if (appLists?.data?.length) {
            Promise.all(appLists?.data?.map( async (app) => {
                console.log(app.uid, {
                    configuration: installationData?.data?.configuration,
                    server_configuration: installationData?.data?.server_configuration,
                    ...app
                })
                const res = await fetch(`https://app.contentstack.com/apps-api/installations/${app?.uid}`, {
                    "headers": {
                        "content-type": "application/json",
                        "organization_uid": ORG_UID,
                        "authtoken": AUTHTOKEN
                    },
                    "method": "PUT",
                    "body": JSON.stringify({
                        configuration: installationData?.data?.configuration,
                        server_configuration: installationData?.data?.server_configuration,
                        ...app
                    })
                });
                console.log("Response", res.status);
            }));
        }
    } catch (error) {
        console.error("Error updating installation details:", error);
    }
}

const saveConfigToTargetLocale = async () => {
    await fetchInstallationDetails();
    await fetchAndUpdateInstallations();
}

saveConfigToTargetLocale();

