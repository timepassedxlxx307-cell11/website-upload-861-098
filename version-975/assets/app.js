(function () {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            const open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(value);
        });
    });
})();
