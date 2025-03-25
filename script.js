document.addEventListener("DOMContentLoaded", () => {
    // Diagnosis functionality
    const submitButton = document.querySelector(".submit-btn");
    const symptomsInput = document.querySelector(".symptoms-input");
    const diagnosisOutput = document.querySelector(".diagnosis");

    if (!submitButton || !symptomsInput || !diagnosisOutput) {
        console.error("❌ Required elements are missing in the HTML.");
        return;
    }

    submitButton.addEventListener("click", async () => {
        const symptomsText = symptomsInput.value.trim().toLowerCase();

        if (!symptomsText) {
            alert("⚠️ Please enter at least one symptom.");
            return;
        }

        const symptomList = symptomsText.split(",").map(symptom => symptom.trim());

        try {
            // Fetch symptoms data
            const response = await fetch("symptoms.json");
            if (!response.ok) throw new Error("Failed to load symptoms data.");
            const data = await response.json();

            let allConditions = new Set();
            let details = "";

            symptomList.forEach(symptom => {
                // Case-insensitive lookup
                const symptomKey = Object.keys(data.symptoms).find(key => key.toLowerCase() === symptom);
                if (symptomKey) {
                    const symptomData = data.symptoms[symptomKey];
                    const conditions = symptomData.possible_conditions.map(condition => condition.name);
                    conditions.forEach(condition => allConditions.add(condition));
                    details += `🩺 **Symptom:** ${symptomKey.toUpperCase()}\n\n` +
                               `📌 **Possible Conditions:** ${conditions.join(", ")}\n\n` +
                               `📖 **Description:** ${symptomData.description}\n\n` +
                               `⚠️ **Severity:** ${symptomData.possible_conditions.map(condition => `${condition.name} (${condition.urgency})`).join(", ")}\n\n` +
                               `🌍 **Kenya Context:** ${symptomData.kenya_specific_notes}\n\n` +
                               `💡 **Advice:** ${symptomData.recommended_actions.join(", ")}\n\n-----------------\n`;
                }
            });

            diagnosisOutput.value = allConditions.size > 0 ? details : "No matching conditions found. Please consult a doctor.";
        } catch (error) {
            console.error("Error:", error);
            alert("Error fetching diagnosis.");
        }
    });

    // Appointment booking functionality
    const bookBtn = document.querySelector(".book-btn");

    bookBtn.addEventListener("click", async () => {
        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const specialist = document.getElementById("specialist").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!name || !age || !email || !phone || !specialist || !date || !time) {
            alert("Please fill in all fields.");
            return;
        }

        const appointment = {
            name,
            age,
            email,
            phone,
            specialist,
            date,
            time
        };

        try {
            const response = await fetch("http://localhost:3000/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointment)
            });

            if (response.ok) {
                alert("Appointment booked successfully!");
                document.querySelector(".appointment-form").reset();
            } else {
                alert("Failed to book appointment.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Jitsi Meet functionality
    const startMeetingButton = document.getElementById("start-meeting");
    let jitsiAPI = null; // Store Jitsi API instance
    let moderator = false; // Track if the user is the admin

    startMeetingButton.addEventListener("click", function () {
        // If a Jitsi session is already running, do nothing
        if (jitsiAPI) {
            alert("A video session is already active.");
            return;
        }

        const domain = "meet.jit.si";
        const options = {
            roomName: "TeleMedX_Session_123",
            width: "100%",
            height: 600,
            parentNode: document.querySelector("#jitsi-container"),
            configOverwrite: {
                prejoinPageEnabled: false,
            },
        };

        jitsiAPI = new JitsiMeetExternalAPI(domain, options);

        jitsiAPI.addEventListener("participantJoined", (event) => {
            if (!moderator) {
                return; // Only moderators handle approvals
            }

            const participantId = event.id;
            const participantName = event.displayName || "Unknown User";

            // Show approval popup
            const approve = confirm(`Approve ${participantName} to join?`);
            if (!approve) {
                jitsiAPI.executeCommand("kickParticipant", participantId);
            }
        });

        jitsiAPI.addEventListener("videoConferenceJoined", () => {
            moderator = true; // First user to join is the admin
        });
    });
});




