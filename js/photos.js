$(function () {
    // -------------------------------
    // Photo Upload Configuration
    // -------------------------------
    const CLOUDINARY_CONFIG = {
        cloudName: 'dqsxgzr9g',
        uploadPreset: 'wedding-uploads'
    };

    // Scavenger hunt tasks
    const SCAVENGER_HUNT_TASKS = [
        "Just Because",
        "Fit Check",
        "Tisch / Kabbalat Panim",
        "Your Drink of Choice",
        "Schtick",
        "A Photo of Your Table",
        "Your Favorite Decoration",
        "A Sweet Moment",
        "The Dance Floor",
        "A Candid of Rita and Matthew",
        "New or Reunited Friends"
    ];

    let selectedPhotos = [];
    let uploadWidget;

    // -------------------------------
    // Initialize Photo Upload
    // -------------------------------
    function initializePhotoUpload() {
        // Only initialize if we're on the photos page
        if (!document.getElementById('upload-widget-btn')) {
            return;
        }

        // Load photo form partial
        loadPhotoFormPartial();

        // Initialize Cloudinary widget
        initializeCloudinaryWidget();

        // Load existing public photos
        loadPublicPhotoGallery();

        // Initialize lightbox
        initializeLightbox();
    }

    // -------------------------------
    // Load Photo Form Partial
    // -------------------------------
    function loadPhotoFormPartial() {
        $.get('partials/photo-form.html', function (data) {
            $('#photo-form-placeholder').html(data);
            // Hide the form initially
            $('#photo-form-container').hide();
            // Bind event listeners after partial is loaded
            bindPhotoEventListeners();
        }).fail(function () {
            console.error('Failed to load photo form partial');
        });
    }

    // -------------------------------
    // Initialize Cloudinary Widget
    // -------------------------------
    function initializeCloudinaryWidget() {
        uploadWidget = cloudinary.createUploadWidget({
            cloudName: CLOUDINARY_CONFIG.cloudName,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
            multiple: true,
            maxFiles: 10,
            maxFileSize: 10000000, // 10MB
            sources: ['local', 'camera'],
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'heic'],
            cropping: false,
            folder: 'wedding-guest-photos',
            tags: ['wedding', 'guest-photos'],
            showAdvancedOptions: false,
            showInsecurePreview: false,
            autoMinimize: false,
            styles: {
                palette: {
                    window: "#ffffff",              // var(--white)
                    windowBorder: "#6d8460",        // var(--sage-green)
                    tabIcon: "#6d8460",             // var(--sage-green)
                    menuIcons: "#2B3C23",           // var(--deep-emerald)
                    textDark: "#2B3C23",            // var(--deep-emerald)
                    textLight: "#ffffff",           // var(--white)
                    link: "#B76E79",                // var(--soft-pink)
                    action: "#6d8460",              // var(--sage-green)
                    inactiveTabIcon: "#B76E79",     // var(--soft-pink)
                    error: "#F44235",               // Keep error red as is
                    inProgress: "#d4af37",          // var(--gold)
                    complete: "#6d8460",            // var(--sage-green)
                    sourceBg: "#f8f9fa"            // Light gray to match form backgrounds
                }
            }
        }, handleUploadResult);

        // Upload button click handler
        $('#upload-widget-btn').on('click', function () {
            selectedPhotos = []; // Reset
            uploadWidget.open();
        });
    }

    // -------------------------------
    // Event Listeners
    // -------------------------------
    function bindPhotoEventListeners() {
        // Submit all photos
        $(document).on('click', '#submit-all-photos', handlePhotoSubmission);

        // Modal confirmation
        $(document).on('click', '#confirm-submission', function () {
            const photoData = $('#finalConfirmationModal').data('photoData');

            $('#finalConfirmationModal').modal('hide');
            showLoading();
            processPhotoSubmissions(photoData);
        });
    }

    // -------------------------------
    // Upload Handling
    // -------------------------------
    function handleUploadResult(error, result) {
        if (!error && result && result.event === "success") {
            // Store the uploaded photo info
            selectedPhotos.push(result.info);
            console.log('Photo selected:', result.info);
        }

        if (result && result.event === "close") {
            // When upload widget closes, show the labeling form
            if (selectedPhotos.length > 0) {
                showPhotoLabelingForm();
            }
        }

        if (error) {
            console.error('Upload error:', error);
            hideLoading();
            alert('Upload failed. Please try again.');
        }
    }

    // -------------------------------
    // Photo Labeling Form
    // -------------------------------
    function showPhotoLabelingForm() {
        const $container = $('#photo-form-container');
        const $formsContainer = $('#photo-forms');

        console.log('Showing photo labeling form for', selectedPhotos.length, 'photos');

        // Clear previous forms
        $formsContainer.empty();

        // Hide upload button while form is shown
        $('#upload-widget-btn').hide();

        // Create a form for each selected photo (WITHOUT individual name fields)
        selectedPhotos.forEach((photo, index) => {
            const formHtml = `
                <div class="photo-form-item" data-photo-index="${index}">
                    <div class="row align-items-center">
                        <div class="col-md-3 col-4">
                            <div class="photo-preview-thumb">
                                <img src="${photo.secure_url}" alt="Selected photo ${index + 1}" 
                                     style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px;">
                            </div>
                        </div>
                        <div class="col-md-9 col-8">
                            <label for="task-${index}" class="form-label">Photo ${index + 1} - Scavenger Hunt Task</label>
                            <select class="form-select photo-task" id="task-${index}" required>
                                <option value="">Choose a task...</option>
                                ${SCAVENGER_HUNT_TASKS.map(task =>
                `<option value="${task}">${task}</option>`
            ).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            `;
            $formsContainer.append(formHtml);
        });

        // Show the form container
        $container.show();

        // Scroll to the form
        $container[0].scrollIntoView({ behavior: 'smooth' });
    }

    // -------------------------------
    // Form Submission
    // -------------------------------
    function handlePhotoSubmission() {
        const photoData = [];
        let allValid = true;

        // Get the single name field value (plain text, no sanitization)
        const guestNameAll = $('#guest-name-all').val().trim();

        if (!guestNameAll) {
            alert('Please enter your name.');
            return;
        }

        $('.photo-form-item').each(function (index) {
            const $form = $(this);
            const task = $form.find('.photo-task').val();

            if (!task) {
                allValid = false;
                return false; // Break out of each loop
            }

            photoData.push({
                ...selectedPhotos[index],
                guestName: guestNameAll, // Store as plain text
                scavengerTask: task, // Store as plain text
                isPublic: true, // All photos are public now
                uploadedAt: new Date().toISOString()
            });
        });

        if (!allValid) {
            alert('Please select a scavenger hunt task for each photo.');
            return;
        }

        // Show confirmation modal
        $('#finalConfirmationModal').modal('show');

        // Store photo data temporarily for when user confirms
        $('#finalConfirmationModal').data('photoData', photoData);
    }

    // -------------------------------
    // Photo Processing
    // -------------------------------
    function processPhotoSubmissions(photoData) {
        console.log('Processing photo submissions:', photoData);

        // Store submissions
        const existingPhotos = JSON.parse(localStorage.getItem('weddingPhotos') || '[]');
        const allPhotos = [...existingPhotos, ...photoData];
        localStorage.setItem('weddingPhotos', JSON.stringify(allPhotos));

        // Hide loading and form
        hideLoading();
        $('#photo-form-container').hide();

        // Show upload button again
        $('#upload-widget-btn').show();

        // Show success message
        $('#success-message').show();

        // Add photos to gallery
        photoData.forEach(photo => addPhotoToGallery(photo));

        // Reset selected photos
        selectedPhotos = [];

        // Hide success message after 5 seconds
        setTimeout(() => {
            $('#success-message').hide();
        }, 5000);
    }

    // -------------------------------
    // Gallery Management
    // -------------------------------
    function loadPublicPhotoGallery() {
        const storedPhotos = JSON.parse(localStorage.getItem('weddingPhotos') || '[]');
        const publicPhotos = storedPhotos.filter(p => p.isPublic);

        if (publicPhotos.length > 0) {
            publicPhotos.forEach(photo => addPhotoToGallery(photo));
        }
    }

    function addPhotoToGallery(photoInfo) {
        const $recentUploads = $('#recent-uploads');

        // Create gallery container if it doesn't exist
        let $gallery = $('.photo-gallery');
        if ($gallery.length === 0) {
            $recentUploads.html('<h3>Wedding Photo Gallery</h3>');
            $gallery = $('<div class="photo-gallery"></div>');
            $recentUploads.append($gallery);
        }

        // Create the photo item container
        const $photoItem = $('<div class="photo-item"></div>');
        $photoItem.attr('data-full-image', photoInfo.secure_url);
        $photoItem.attr('data-caption', photoInfo.scavengerTask);

        // Add the image
        const $img = $('<img>');
        $img.attr('src', photoInfo.secure_url);
        $img.attr('alt', photoInfo.scavengerTask);
        $img.attr('loading', 'lazy');

        // Create the info section
        const $photoInfo = $('<div class="photo-info"></div>');

        // Add task name as plain text
        const $taskName = $('<h6></h6>');
        $taskName.text(photoInfo.scavengerTask); // .text() ensures it's treated as plain text

        // Add uploader name as plain text (hover-only)
        const $uploaderName = $('<p class="photo-uploader-hover"></p>');
        $uploaderName.text('by ' + photoInfo.guestName); // .text() ensures it's treated as plain text

        // Assemble the elements
        $photoInfo.append($taskName);
        $photoInfo.append($uploaderName);
        $photoItem.append($img);
        $photoItem.append($photoInfo);

        // Add to gallery
        $gallery.prepend($photoItem);
    }

    // -------------------------------
    // Lightbox Functionality
    // -------------------------------
    function initializeLightbox() {
        // Create lightbox HTML if it doesn't exist
        if ($('#photo-lightbox').length === 0) {
            const lightboxHtml = `
                <div id="photo-lightbox" class="photo-lightbox">
                    <span class="lightbox-close">&times;</span>
                    <img class="lightbox-content" id="lightbox-img">
                    <div class="lightbox-caption"></div>
                </div>
            `;
            $('body').append(lightboxHtml);
        }

        // Bind close events
        $('.lightbox-close').on('click', closeLightbox);
        $('#photo-lightbox').on('click', function (e) {
            if (e.target === this) {
                closeLightbox();
            }
        });

        // ESC key to close
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    function openLightbox(imageSrc, caption) {
        const $lightbox = $('#photo-lightbox');
        const $img = $('#lightbox-img');
        const $caption = $('.lightbox-caption');

        $img.attr('src', imageSrc);
        $caption.text(caption || '');
        $lightbox.fadeIn(200);
        $('body').css('overflow', 'hidden'); // Prevent scrolling
    }

    function closeLightbox() {
        $('#photo-lightbox').fadeOut(200);
        $('body').css('overflow', 'auto'); // Re-enable scrolling
    }

    // Event Delegation for Gallery Clicks
    $(document).on('click', '.photo-item', function () {
        const fullImage = $(this).data('full-image');
        const caption = $(this).data('caption');
        openLightbox(fullImage, caption);
    });

    // -------------------------------
    // Utility Functions
    // -------------------------------
    function showLoading() {
        $('#loading').show();
    }

    function hideLoading() {
        $('#loading').hide();
    }

    // -------------------------------
    // Initialize when document is ready
    // -------------------------------
    initializePhotoUpload();
});