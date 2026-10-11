// Navbar scroll effect
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if(window.scrollY > 50){
        header.classList.add('scrolled');
    }else{
        header.classList.remove('scrolled');
    }
});

// Simple fade-in animation
const cards = document.querySelectorAll('.card');

window.addEventListener('scroll', () => {
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;

        if(cardTop < window.innerHeight - 100){
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// Initial card state
cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
});console.log("Elite Events Website Loaded");