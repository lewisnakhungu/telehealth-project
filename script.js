// Global API Key
const apiKey = "$2a$10$uJZg0FIkstKez5HwKk8rbe6HgrQXhNurd8obr3QDcYvVuo5j6FUhW";

document.addEventListener("DOMContentLoaded", () => {
    // Diagnosis Functionality
    const submitButton = document.querySelector(".submit-btn");
    const symptomsInput = document.querySelector(".symptoms-input");
    const diagnosisContainer = document.getElementById("diagnosis-container");
    const diagnosisResults = document.getElementById("diagnosis-results");
    
    function getSeverityColor(severity) {
        switch (severity.toLowerCase()) {
            case "low": return "green";
            case "medium": return "orange";
            case "high": return "red";
            case "emergency": return "purple";
            default: return "black";
        }
    }
    
    if (submitButton && symptomsInput) {
        submitButton.addEventListener("click", () => {
            const symptomsText = symptomsInput.value.trim().toLowerCase();
            if (!symptomsText) {
                alert("⚠️ Please enter at least one symptom.");
                return;
            }
    
            const symptomList = symptomsText.split(/\s+/).map(symptom => symptom.trim());
    
            fetch("https://api.jsonbin.io/v3/b/67e3a8dc8960c979a578aa82", {
                headers: {
                    "X-Master-Key": apiKey
                }
            })
            .then(response => {
                if (!response.ok) throw new Error("Failed to load symptoms data.");
                return response.json();
            })
            .then(data => {
                console.log("Fetched Data:", data);
                const symptomsData = data.record; 
    
                if (!symptomsData.symptoms) {
                    throw new Error("Invalid data format: 'symptoms' key missing.");
                }
    
                let foundConditions = [];
    
                symptomList.forEach(symptom => {
                    const symptomKey = Object.keys(symptomsData.symptoms).find(key => key.toLowerCase() === symptom);
                    if (symptomKey) {
                        const symptomData = symptomsData.symptoms[symptomKey];
    
                        if (symptomData && symptomData.possible_conditions) {
                            symptomData.possible_conditions.forEach(condition => {
                                foundConditions.push({
                                    symptom: symptomKey,
                                    condition: condition.name,
                                    severity: condition.urgency,
                                    advice: symptomData.recommended_actions ? symptomData.recommended_actions.join(", ") : "No specific advice."
                                });
                            });
                        }
                    }
                });
    
                if (foundConditions.length > 0) {
                    diagnosisResults.innerHTML = foundConditions.map(entry => `
                        <tr>
                            <td>${entry.symptom}</td>
                            <td>${entry.condition}</td>
                            <td style="color: ${getSeverityColor(entry.severity)}; font-weight:bold;">
                                ${entry.severity}
                            </td>
                            <td>${entry.advice}</td>
                        </tr>
                    `).join("");
                    diagnosisContainer.style.display = "block";
                } else {
                    diagnosisResults.innerHTML = "<tr><td colspan='4'>No matching conditions found. Please consult a doctor.</td></tr>";
                    diagnosisContainer.style.display = "block";
                }
            })
            .catch(error => {
                console.error("❌ Error fetching diagnosis:", error);
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

            const appointment = {
                id: Date.now(),
                name,
                age,
                email,
                phone,
                specialist,
                date,
                time
            };

            const jsonBinURL = "https://api.jsonbin.io/v3/b/67e4d92a8561e97a50f3a751";

            try {
                const response = await fetch(jsonBinURL, {
                    method: "GET",
                    headers: { "X-Master-Key": apiKey }
                });

                if (!response.ok) throw new Error("Failed to fetch existing appointments.");

                const data = await response.json();
                const appointments = data.record?.appointments || [];

                appointments.push(appointment);

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

    // Feedback Submission
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

            try {
                const response = await fetch(jsonBinURL, {
                    method: "GET",
                    headers: { "X-Master-Key": apiKey }
                });

                if (!response.ok) throw new Error("Failed to fetch feedbacks.");

                const data = await response.json();
                const feedbacks = data.record?.feedbacks || [];

                feedbacks.push(feedback);

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

    // Menu Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }
});