document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded');
    const productLinks = document.querySelectorAll('.product-link');
    console.log('Found product links:', productLinks.length);

    productLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const category = this.getAttribute('data-category');
            const index = this.getAttribute('data-index');

            selectedCategory = category;

            localStorage.setItem('selectedCategory', category);

            setTimeout(() => {
                window.location.href = this.href;
            }, 100);
        });
    });
});

function toggleDropdown(event) {
    event.preventDefault();
    const dropdownContent = event.target.nextElementSibling;
    dropdownContent.classList.toggle('show');


    const otherDropdowns = document.querySelectorAll('.dropdown-content');
    otherDropdowns.forEach(content => {
        if (content !== dropdownContent) {
            content.classList.remove('show');
        }
    });
}


window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }
}