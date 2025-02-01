// Show the button when the user scrolls down 100px from the top
window.onscroll = function () {
    const scrollToTopButton = document.getElementById("scrollToTop");
    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
        scrollToTopButton.style.display = "block";
    } else {
        scrollToTopButton.style.display = "none";
    }
};

// Scroll to the top when the button is clicked
document.getElementById("scrollToTop").onclick = function () {
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// Scroll to Top Button Functionality
const scrollToTopButton = document.getElementById('whatsapp-btn');

// Show button when scrolling down
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopButton.classList.add('show');
    } else {
        scrollToTopButton.classList.remove('show');
    }
});

// Scroll to top when button is clicked
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});