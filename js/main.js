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
        $('#footer').replaceWith(data);
    });

    // Show/Hide Photos Nav Link Based on Time
    function isPhotosPageEnabled() {
        // const enableTime = new Date('2025-11-09T17:00:00-05:00'); // 5 PM EST
        const enableTime = new Date('2025-09-09T17:00:00-05:00'); // For testing
        const now = new Date();
        return now >= enableTime;
    }

    function togglePhotosNavLink() {
        // Wait for navbar to load, then show/hide photos link
        const photosLink = document.querySelector('a[href="pics.html"]');
        if (photosLink) {
            if (isPhotosPageEnabled()) {
                photosLink.closest('li').style.display = 'block';
            } else {
                photosLink.closest('li').style.display = 'none';
            }
        }
    }

    // Navbar replacement
    $('#navbar').load('partials/navbar.html', function () {
        togglePhotosNavLink();

        document.querySelectorAll('.collapse').forEach(function (el) {
            new bootstrap.Collapse(el, { toggle: false });
        });
    });

    // Page Banner Generation
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

    // Timeline fade-in on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');

    function revealTimeline() {
        timelineItems.forEach(item => {
            const top = item.getBoundingClientRect().top;
            if (top < window.innerHeight - 50) {
                item.classList.add('in-view');
            }
        });
    }

    window.addEventListener('scroll', revealTimeline);
    window.addEventListener('load', revealTimeline);
});