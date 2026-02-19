import { qs } from "./utils.mjs";

const GEMINI_API_KEY = 'AIzaSyC0DrxWVirAWQz2ptnFAOfM25VqQCSPas8'; 

export async function startQuiz(subject, topic) {
    const modal = qs('#quizModal');
    const body = qs('#quizBody');
    const progressBar = qs('#quiz-progress-bar');
    const closeBtn = qs('#closeQuizTop');

    // Ensure the close button works even during the quiz
    closeBtn.addEventListener('click', () => modal.close());
    
    // 1. Initial UI State
    progressBar.style.width = "0%";
    body.innerHTML = `
        <div class="ai-loader">
            <i class="fas fa-brain fa-spin"></i>
            <p>Gemini is crafting a <strong>${subject}</strong> quiz about <strong>${topic}</strong>...</p>
        </div>`;
    modal.showModal();

    // 2. Fetch from Gemini
    const questions = await fetchQuizFromAI(subject, topic);
    
    if (questions && questions.length > 0) {
        runQuizFlow(questions, 0, 0);
    } else {
        body.innerHTML = `
            <div class="error-msg">
                <p>The AI is currently unavailable. Please try again in a moment.</p>
                <button class="filter-btn" id="closeQuizError" title="Close Quiz">Close</button>
            </div>`;
        // Use the utility and add listener instead of inline onclick for cleaner code
        qs('#closeQuizError').addEventListener('click', () => modal.close());
    }
}

async function fetchQuizFromAI(subject, topic) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    
    // Pro-Tip: Adding "Return ONLY a valid JSON array" helps prevent the AI from adding conversational text
    const prompt = `Generate a JSON array of 5 multiple-choice questions for a Pisay NCE review. 
    Subject: ${subject}. Specific Topic: ${topic}. 
    Each object must have: "question", "options" (array of 4 strings), "answer" (index 0-3), and "explanation".
    Return ONLY the raw JSON array. No markdown, no preamble.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        
        // Added safety check for the data path
        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            throw new Error("Invalid response from Gemini");
        }

        const text = data.candidates[0].content.parts[0].text;
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (err) {
        console.error("Gemini API Error:", err);
        return null;
    }
}

function runQuizFlow(questions, index, score) {
    const body = qs('#quizBody');
    const progressBar = qs('#quiz-progress-bar');
    
    if (index >= questions.length) {
        progressBar.style.width = "100%";
        body.innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Complete!</h3>
                <p class="score-display">You scored <strong>${score}</strong> out of ${questions.length}</p>
                <p>${score >= 4 ? "Excellent work, Scholar!" : "Keep studying and try again!"}</p>
                <button class="filter-btn" id="finishQuizBtn">Finish</button>
            </div>`;
        
        qs('#finishQuizBtn').addEventListener('click', () => qs('#quizModal').close());
        return;
    }

    const q = questions[index];
    progressBar.style.width = `${(index / questions.length) * 100}%`;

    body.innerHTML = `
        <div class="question-container">
            <span class="q-count">Question ${index + 1} of ${questions.length}</span>
            <p class="q-text">${q.question}</p>
            <div id="options-grid">
                ${q.options.map((opt, i) => `<button class="option-btn" data-idx="${i}">${opt}</button>`).join('')}
            </div>
            <div id="quiz-feedback" class="hidden"></div>
        </div>
    `;

    // Handle Option Clicks
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedIdx = parseInt(e.currentTarget.dataset.idx);
            const feedback = qs('#quiz-feedback');
            
            // Disable all buttons immediately to prevent multiple clicks
            optionButtons.forEach(b => b.disabled = true);

            if (selectedIdx === q.answer) {
                e.currentTarget.classList.add('correct');
                score++;
                feedback.innerHTML = `<p class="correct-text"><i class="fas fa-check-circle"></i> Correct! ${q.explanation}</p>`;
            } else {
                e.currentTarget.classList.add('incorrect');
                // Highlight the correct answer for the student
                optionButtons[q.answer].classList.add('correct');
                feedback.innerHTML = `<p class="incorrect-text"><i class="fas fa-times-circle"></i> Incorrect. ${q.explanation}</p>`;
            }
            
            feedback.classList.remove('hidden');
            setTimeout(() => runQuizFlow(questions, index + 1, score), 5000);
        });
    });
}