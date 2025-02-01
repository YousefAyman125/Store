document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navButtons = document.querySelector('.nav-buttons');

    mobileMenuBtn?.addEventListener('click', () => {
        // Toggle active class on menu button (for animation)
        mobileMenuBtn.classList.toggle('active');

        // Toggle menu visibility
        navLinks.classList.toggle('active');
        navButtons.classList.toggle('active');

        // Toggle aria-expanded for accessibility
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navLinks.classList.remove('active');
            navButtons.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
});