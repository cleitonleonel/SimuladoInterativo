document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('tema');
    if (savedTheme === 'escuro') {
        body.classList.add('dark-mode');
        updateIcons(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = body.classList.toggle('dark-mode');
            localStorage.setItem('tema', isDark ? 'escuro' : 'claro');
            updateIcons(isDark);
        });
    }

    function updateIcons(isDark) {
        const sun = document.querySelector('.sun-icon');
        const moon = document.querySelector('.moon-icon');
        if (sun && moon) {
            if (isDark) {
                sun.style.display = 'block';
                moon.style.display = 'none';
            } else {
                sun.style.display = 'none';
                moon.style.display = 'block';
            }
        }
    }
});
