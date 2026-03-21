const yesBtn = document.querySelector('.js-yes-btn');
const noBtn = document.querySelector('.js-no-btn');
const questionContainer = document.querySelector('.question-container');
const resultContainer = document.querySelector('.result-container');

// Yes button par click karne ka logic
yesBtn.addEventListener('click', () => {
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
});

// No button ko bhagane ka logic
noBtn.addEventListener('mouseover', () => {
    // Screen size ke hisab se random jagah nikalna
    const maxX = window.innerWidth - noBtn.offsetWidth;
    const maxY = window.innerHeight - noBtn.offsetHeight;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Button ko random position par set karna
    noBtn.style.position = 'fixed';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
});
