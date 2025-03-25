document.addEventListener("DOMContentLoaded", () => {
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
                const symptomKey = Object.keys(data).find(key => key.toLowerCase() === symptom);
                if (symptomKey) {
                    const conditions = data[symptomKey].conditions;
                    conditions.forEach(condition => allConditions.add(condition));
                    details += `Symptom: ${symptomKey}\nConditions: ${conditions.join(", ")}\n\n`;
                }
            });

            diagnosisOutput.value = allConditions.size > 0 ? details : "No matching conditions found. Please consult a doctor.";
        } catch (error) {
            console.error("Error:", error);
            alert("Error fetching diagnosis.");
        }
    });
});