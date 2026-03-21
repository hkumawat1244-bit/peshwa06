const yesBtn = document.querySelector('.js-yes-btn');
const noBtn = document.querySelector('.js-no-btn');
const questionContainer = document.querySelector('.question-container');
const resultContainer = document.querySelector('.result-container');

// 1. When "Yes" is clicked, show the result
yesBtn.addEventListener('click', () => {
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
});

// 2. Make the "No" button run away!
noBtn.addEventListener('mouseover', () => {
    // Calculate random positions
    const x = Math.floor(Math.random() * (window.innerWidth - noBtn.offsetWidth));
    const y = Math.floor(Math.random() * (window.innerHeight - noBtn.offsetHeight));

    // Apply new position
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});
