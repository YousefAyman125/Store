// Slider actions
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const bullets = document.querySelectorAll('.bullet');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    const slideCount = slides.length;
    let slideInterval;

    // Function to show specific slide
    function showSlide(index) {
        // Handle circular navigation
        if (index >= slideCount) {
            index = 0;
        } else if (index < 0) {
            index = slideCount - 1;
        }

        // Remove active class from all slides and bullets
        slides.forEach(slide => slide.classList.remove('active'));
        bullets.forEach(bullet => bullet.classList.remove('active'));

        // Add active class to current slide and bullet
        slides[index].classList.add('active');
        bullets[index].classList.add('active');

        currentSlide = index;
    }

    // Function to show next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // Function to show previous slide
    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Add click event listeners to navigation buttons
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    // Add click event listeners to bullets
    bullets.forEach((bullet, index) => {
        bullet.addEventListener('click', () => {
            showSlide(index);
            resetInterval();
        });
    });

    // Function to reset interval
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            nextSlide(); // For RTL layout
            resetInterval();
        } else if (e.key === 'ArrowRight') {
            prevSlide(); // For RTL layout
            resetInterval();
        }
    });

    // Optional: Pause slider on hover
    const sliderContainer = document.querySelector('.slider-container');

    sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    sliderContainer.addEventListener('mouseleave', () => {
        resetInterval();
    });

    // Initialize slider
    function initSlider() {
        showSlide(0);
        resetInterval();
    }

    // Start the slider
    initSlider();
});


// -----------
document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scrollToTop');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        // Show button after scrolling down 300px
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});