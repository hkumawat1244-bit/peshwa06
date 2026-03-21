const yesBtn = document.querySelector('.js-yes-btn');
const noBtn = document.querySelector('.js-no-btn');
const questionContainer = document.querySelector('.question-container');
const resultContainer = document.querySelector('.result-container');

// 1. Logic for clicking "Yes"
yesBtn.addEventListener('click', () => {
    // Hide the question and show the result
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
});

// 2. Logic to make the "No" button dodge the mouse
noBtn.addEventListener('mouseover', () => {
    // Get screen dimensions minus button size so it stays on screen
    const maxX = window.innerWidth - noBtn.offsetWidth;
    const maxY = window.innerHeight - noBtn.offsetHeight;

    // Generate random coordinates
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Apply the new position
    noBtn.style.position = 'fixed'; // Ensures it moves relative to the window
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
});
