document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-icon');
    const sideMenu = document.querySelector('.side-menu');
    const body = document.body;

    burgerMenu.addEventListener('click', () => {
        burgerMenu.classList.toggle('active');
        sideMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target) && 
            !burgerMenu.contains(e.target) && 
            sideMenu.classList.contains('active')) {
            burgerMenu.classList.remove('active');
            sideMenu.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
}); 