$(function () {
    // Header replacement
    $.get('partials/header.html', function (data) {
        $('#header').replaceWith(data); // replaces #header div with header.html content

        // Fill in title and subtitle after inserting header
        const title = $('body').data('title') || "M&M Wedding";
        const subtitle = $('body').data('subtitle') || "";
        $('#page-title').text(title);
        $('#page-subtitle').text(subtitle);
    });

    // Footer replacement
    $.get('partials/footer.html', function (data) {
        $('#footer').replaceWith(data); // replaces #footer div with footer.html content
    });

    // Navbar replacement remains the same
    $('#navbar').load('partials/navbar.html', function () {
        var bsCollapse = new bootstrap.Collapse(document.querySelectorAll('.collapse'), {
            toggle: false
        });
    });

    $(function () {
        const title = $("html").data("title") || "M&M Wedding";
        const subtitle = $("html").data("subtitle") || "";
        const bg = $("html").data("bg") || "img/placeholders/default.jpg";

        const bannerHtml = `
    <div class="page-banner" style="background-image: url('${bg}');">
        <div class="banner-overlay"></div>
        <div class="banner-text text-center py-5">
            <h1 class='mb-4'>${title}</h1>
            <p>${subtitle}</p>
        </div>
    </div>
    `;

        $("#page-banner-container").html(bannerHtml);
    });
});
