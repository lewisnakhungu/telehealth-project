document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-btn");
    const symptomsInput = document.querySelector(".symptoms-input input");
    const diagnosisOutput = document.querySelector(".diagnosis");

    if (!submitButton || !symptomsInput || !diagnosisOutput) {
        console.error("❌ Required elements are missing in the HTML.");
        return;
    }

    submitButton.addEventListener("click", async () => {
        const symptomsText = symptomsInput.value.trim().toLowerCase();

        if (!symptomsText) {
            alert("Please enter at least one symptom.");
            return;
        }

        const symptomList = symptomsText.split(",").map(symptom => symptom.trim());

        try {
            // Fetch the JSON data
            const response = await fetch("symptoms.json"); // Ensure this file exists in your project
            if (!response.ok) throw new Error("Failed to load symptoms data.");
            const data = await response.json();

            let allConditions = new Set();
            let details = "";

            symptomList.forEach(symptom => {
                if (data[symptom]) {
                    const { conditions, description, severity, advice } = data[symptom];

                    conditions.forEach(condition => allConditions.add(condition));

                    details += `
                        <div class="symptom-card">
                            <h4>🩺 ${symptom.charAt(0).toUpperCase() + symptom.slice(1)}</h4>
                            <ul>
                                <li><strong>Possible Conditions:</strong> ${conditions.join(", ")}</li>
                                <li><strong>Description:</strong> ${description}</li>
                                <li><strong>Severity:</strong> <span class="severity ${severity.toLowerCase()}">${severity}</span></li>
                                <li><strong>Advice:</strong> ${advice}</li>
                            </ul>
                        </div>
                    `;
                } else {
                    details += `<p class="not-found">❌ No data found for: <strong>${symptom}</strong></p>`;
                }
            });

            // Update diagnosis results
            diagnosisOutput.innerHTML = `
                <h3>📋 Diagnosis Report</h3>
                <p><strong>Overall Possible Conditions:</strong> ${[...allConditions].join(", ")}</p>
                ${details}
            `;
        } catch (error) {
            console.error("❌ Error fetching or processing data:", error);
            diagnosisOutput.innerHTML = `<p class="error">❌ An error occurred while fetching the data. Please try again later.</p>`;
        }
    });
});
