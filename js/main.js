$(function () {
    // Load header inside placeholder
    $('#header').load('partials/header.html', function () {
        $('#page-title').text(title);
        $('#page-subtitle').text(subtitle);
    });

    // Load footer inside placeholder
    $('#footer').load('partials/footer.html');

    // Load navbar
    $('#navbar').load('partials/navbar.html', function () {
        var bsCollapse = new bootstrap.Collapse(document.querySelectorAll('.collapse'), {
            toggle: false
        });
    });
});
