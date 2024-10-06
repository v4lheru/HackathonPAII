let levelsData = {};

document.addEventListener('DOMContentLoaded', () => {
    const levelButtons = document.querySelector('.level-buttons');
    for (let i = 0; i <= 10; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => selectLevel(i));
        levelButtons.appendChild(button);
    }

    document.getElementById('evaluateBtn').addEventListener('click', evaluatePrompt);
    document.getElementById('saveBtn').addEventListener('click', saveToJSON);

    // Load levels data from localStorage if available
    const savedLevelsData = localStorage.getItem('levelsData');
    if (savedLevelsData) {
        levelsData = JSON.parse(savedLevelsData);
    }
});

function selectLevel(level) {
    document.querySelectorAll('.level-buttons button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (levelsData[`level_${level}`]) {
        const levelData = levelsData[`level_${level}`];
        document.getElementById('promptTemplate').value = levelData.prompt;
        document.getElementById('modelSelect').value = levelData.model;
    } else {
        document.getElementById('promptTemplate').value = '';
        document.getElementById('modelSelect').value = 'gpt-4o'; // Default model
    }
}

async function evaluatePrompt() {
    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('modelSelect').value;
    const promptTemplate = document.getElementById('promptTemplate').value;
    const userPrompt = document.getElementById('userPrompt').value;

    try {
        const response = await fetch('/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey,
                model,
                promptTemplate,
                userPrompt,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        document.getElementById('expectedCompletion').textContent = data.expectedCompletion;
        document.getElementById('modelCompletion').textContent = data.modelCompletion;
        document.getElementById('evaluation').textContent = data.evaluation;
        document.getElementById('tokenCount').textContent = data.tokenCount;
        document.getElementById('fullPrompt').textContent = data.fullPrompt;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while evaluating the prompt. Please check the console for more details.');
    }
}

function saveToJSON() {
    const activeLevel = document.querySelector('.level-buttons button.active');
    if (!activeLevel) {
        alert('Please select a level before saving.');
        return;
    }

    const level = activeLevel.textContent;
    const prompt = document.getElementById('promptTemplate').value;
    const model = document.getElementById('modelSelect').value;

    levelsData[`level_${level}`] = { prompt, model };
    localStorage.setItem('levelsData', JSON.stringify(levelsData));

    // Create a Blob with the JSON data
    const jsonData = JSON.stringify(levelsData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link and trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'levels_data.json';
    document.body.appendChild(downloadLink); // Append to body
    downloadLink.click();
    document.body.removeChild(downloadLink); // Remove after clicking

    alert('JSON file saved and downloaded successfully!');
}