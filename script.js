document.addEventListener("DOMContentLoaded", () => {
    // Diagnosis Functionality
    const submitButton = document.querySelector(".submit-btn");
    const symptomsInput = document.querySelector(".symptoms-input");
    const diagnosisOutput = document.querySelector(".diagnosis");

    if (submitButton && symptomsInput && diagnosisOutput) {
        submitButton.addEventListener("click", () => {
            const symptomsText = symptomsInput.value.trim().toLowerCase();
            if (!symptomsText) {
                alert("⚠️ Please enter at least one symptom.");
                return;
            }

            const symptomList = symptomsText.split(",").map(symptom => symptom.trim());

            fetch("symptoms.json")
                .then(response => {
                    if (!response.ok) throw new Error("Failed to load symptoms data.");
                    return response.json();
                })
                .then(data => {
                    let allConditions = new Set();
                    let details = "";

                    symptomList.forEach(symptom => {
                        const symptomKey = Object.keys(data.symptoms).find(key => key.toLowerCase() === symptom);
                        if (symptomKey) {
                            const symptomData = data.symptoms[symptomKey];
                            const conditions = symptomData.possible_conditions.map(c => c.name);
                            conditions.forEach(c => allConditions.add(c));

                            details += `
Symptom: ${symptomKey.toUpperCase()}
Possible Conditions: ${conditions.join(", ")}
Description: ${symptomData.description}
Severity: ${symptomData.possible_conditions.map(c => `${c.name} (${c.urgency})`).join(", ")}
Kenya Context: ${symptomData.kenya_specific_notes}
Advice: ${symptomData.recommended_actions.join(", ")}
-----------------
`;
                        }
                    });

                    
                    diagnosisOutput.value = allConditions.size > 0 ? details : "No matching conditions found. Please consult a doctor.";
                })
                .catch(error => {
                    console.error("❌ Error:", error);
                    alert("⚠ Error fetching diagnosis.");
                });
        });
    }

    // Appointment Booking 
    const bookButton = document.querySelector(".book-btn");

    if (bookButton) {
        bookButton.addEventListener("click", async (event) => {
            event.preventDefault();
    
            const name = document.getElementById("name").value.trim();
            const age = document.getElementById("age").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const specialist = document.getElementById("specialist").value;
            const date = document.getElementById("date").value;
            const time = document.getElementById("time").value;
    
            if (!name || !age || !email || !phone || !specialist || !date || !time) {
                alert("⚠ Please fill in all fields!");
                return;
            }
    
            // 
            const appointment = {
                id: Date.now(), // Unique ID 
                name,
                age,
                email,
                phone,
                specialist,
                date,
                time
            };
    
            const jsonBinURL = "https://api.jsonbin.io/v3/b/67e4d92a8561e97a50f3a751";
            const apiKey = "$2a$10$ZfCf8N58PAXmNVuDZfvXDOAk3psSJ6D5nRv0Br3MXuoxM0pslEMU."; 
    
            try {
                // Fetch existing data
                const response = await fetch(jsonBinURL, {
                    method: "GET",
                    headers: { "X-Master-Key": apiKey }
                });
    
                if (!response.ok) throw new Error("Failed to fetch existing appointments.");
                
                const data = await response.json();
                const appointments = data.record.appointments || [];
    
                // Add the new appointment
                appointments.push(appointment);
    
                // Update JSONBin
                const updateResponse = await fetch(jsonBinURL, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Master-Key": apiKey
                    },
                    body: JSON.stringify({ appointments }) 
                });
    
                if (!updateResponse.ok) throw new Error("Failed to update appointments.");
                
                alert("🎉 Appointment booked successfully!");
                document.querySelector(".appointment-form").reset();
            } catch (error) {
                console.error("❌ Error:", error);
                alert("⚠ Failed to book appointment.");
            }
        });
    }
    
    // Jitsi Meet Functionality
    const startMeetingButton = document.getElementById("start-meeting");
    let jitsiAPI = null;
    let moderator = false;

    if (startMeetingButton) {
        startMeetingButton.addEventListener("click", () => {
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
                configOverwrite: { prejoinPageEnabled: false }
            };

            try {
                jitsiAPI = new JitsiMeetExternalAPI(domain, options);
                jitsiAPI.addEventListener("participantJoined", (event) => {
                    if (!moderator) return;
                    const participantId = event.id;
                    const participantName = event.displayName || "Unknown User";

                    if (!confirm(`Approve ${participantName} to join?`)) {
                        jitsiAPI.executeCommand("kickParticipant", participantId);
                    }
                });

                jitsiAPI.addEventListener("videoConferenceJoined", () => {
                    moderator = true;
                });
            } catch (error) {
                console.error("❌ Jitsi API error:", error);
                alert("⚠ Failed to start the meeting.");
            }
        });
    }
});
  // contact section
 
const submitFeedback = document.getElementById("submit-feedback");

if (submitFeedback) {
    submitFeedback.addEventListener("click", async (event) => {
        event.preventDefault();

        const contactName = document.getElementById("contact-name").value.trim();
        const contactEmail = document.getElementById("contact-email").value.trim();
        const contactFeedback = document.getElementById("feedback").value.trim();

        if (!contactName || !contactEmail || !contactFeedback) {
            alert("⚠ Please fill out all the fields.");
            return;
        }

        const feedback = {
            id: Date.now(),
            contactName,
            contactEmail,
            contactFeedback
        };

        const jsonBinURL = "https://api.jsonbin.io/v3/b/67e513fc8960c979a5795749";
        const apiKey = "$2a$10$ZfCf8N58PAXmNVuDZfvXDOAk3psSJ6D5nRv0Br3MXuoxM0pslEMU.";

        try {
            // Fetch existing feedbacks
            const response = await fetch(jsonBinURL, {
                method: "GET",
                headers: { "X-Master-Key": apiKey }
            });

            if (!response.ok) throw new Error("Failed to fetch feedbacks.");

            const data = await response.json();
            const feedbacks = data.record?.feedbacks || []; // Ensure feedbacks is an array

            // Add the new feedback
            feedbacks.push(feedback);

            // Update JSONBin with the new feedback
            const updateResponse = await fetch(jsonBinURL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": apiKey
                },
                body: JSON.stringify({ feedbacks })
            });

            if (!updateResponse.ok) throw new Error("Failed to update feedback.");

            alert("🎉 Feedback submitted successfully!");
            document.getElementById("contact-name").value = "";
            document.getElementById("contact-email").value = "";
            document.getElementById("feedback").value = "";
        } catch (error) {
            console.error("❌ Error submitting feedback:", error);
            alert("⚠ Failed to submit feedback. Please try again later.");
        }
    });
}
