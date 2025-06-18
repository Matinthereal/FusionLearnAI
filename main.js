let contentText = ''; // Store content for chatbot

// Handle form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('notes').innerHTML = '';
    document.getElementById('flashcards').innerHTML = '';
    document.getElementById('quiz').innerHTML = '';
    document.getElementById('chatbotOutput').innerHTML = '';

    const fileInput = document.getElementById('fileInput').files[0];
    const youtubeUrl = document.getElementById('youtubeUrl').value;

    if (!fileInput && !youtubeUrl) {
        alert('Please upload a PDF or enter a YouTube URL.');
        return;
    }

    // Process content
    if (fileInput && fileInput.type === 'application/pdf') {
        contentText = await processPDF(fileInput);
    } else if (youtubeUrl) {
        contentText = await processYouTube(youtubeUrl);
    } else {
        alert('Invalid input. Please upload a PDF or enter a valid YouTube URL.');
        return;
    }

    // Generate notes (mock AI processing)
    const notes = generateNotes(contentText);
    document.getElementById('notes').innerHTML = `<h2>Notes</h2><pre>${notes}</pre>`;

    // Generate flashcards (mock)
    const flashcards = generateFlashcards(contentText);
    const flashcardsDiv = document.getElementById('flashcards');
    flashcardsDiv.innerHTML = '<h2>Flashcards</h2>';
    flashcards.forEach(card => {
        flashcardsDiv.innerHTML += `<div class="card"><strong>Q:</strong> ${card.question}<br><strong>A:</strong> ${card.answer}</div>`;
    });

    // Generate quiz (mock)
    const quiz = generateQuiz(contentText);
    const quizDiv = document.getElementById('quiz');
    quizDiv.innerHTML = '<h2>Quiz</h2>';
    quiz.forEach((q, index) => {
        quizDiv.innerHTML += `<div class="quiz"><strong>Q${index + 1}:</strong> ${q.question}<br>${q.options.map(opt => `<label><input type="radio" name="q${index}">${opt}</label>`).join('<br>')}</div>`;
    });
});

// Process PDF using pdf.js
async function processPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + ' ';
        }
        return text;
    } catch (error) {
        alert('Error reading PDF: ' + error.message);
        return '';
    }
}

// Process YouTube URL
async function processYouTube(url) {
    try {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error('Invalid YouTube URL');
        const response = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: { client: { clientName: 'WEB', clientVersion: '2.20210721.00.00' } },
                params: btoa(`\n\x0b${videoId}`)
            })
        });
        const data = await response.json();
        if (data.actions) {
            return data.actions[0].updateEngagementsAction.content.transcriptSearchPanelContent.transcript.segments.map(s => s.text).join(' ');
        }
        return 'No transcript available.';
    } catch (error) {
        alert('Error fetching YouTube transcript: ' + error.message);
        return 'Error: Could not fetch transcript.';
    }
}

// Mock AI: Generate notes
function generateNotes(text) {
    if (!text) return 'No content to summarize.';
    const sentences = text.split('. ').slice(0, 3).join('. ');
    return `Summary:\n- Key points: ${sentences}\n- (This is a mock summary; real AI would be better!)`;
}

// Mock AI: Generate flashcards
function generateFlashcards(text) {
    return [
        { question: 'What is the main topic?', answer: 'Main idea (mock)' },
        { question: 'Key term 1?', answer: 'Definition 1 (mock)' },
        { question: 'Key term 2?', answer: 'Definition 2 (mock)' },
        { question: 'Important fact?', answer: 'Fact (mock)' },
        { question: 'Another fact?', answer: 'Fact (mock)' }
    ];
}

// Mock AI: Generate quiz
function generateQuiz(text) {
    return [
        { question: 'What is the main idea?', options: ['A (mock)', 'B', 'C', 'D'], correct: 'A' },
        { question: 'Key detail?', options: ['A (mock)', 'B', 'C', 'D'], correct: 'A' },
        { question: 'Another detail?', options: ['A (mock)', 'B', 'C', 'D'], correct: 'A' },
        { question: 'Fact 1?', options: ['A (mock)', 'B', 'C', 'D'], correct: 'A' },
        { question: 'Fact 2?', options: ['A (mock)', 'B', 'C', 'D'], correct: 'A' }
    ];
}

// Chatbot
document.getElementById('chatbotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const question = document.getElementById('chatbotInput').value;
    if (!contentText) {
        document.getElementById('chatbotOutput').innerHTML = 'No content loaded. Please process a file or URL first.';
        return;
    }
    const answer = contentText.includes(question.split(' ')[0]) ? `Found: ${question} relates to the content.` : 'Sorry, I couldn’t find an answer in the content.';
    document.getElementById('chatbotOutput').innerHTML = `<div class="chatbot"><strong>Answer:</strong> ${answer} (This is a mock chatbot.)</div>`;
});
