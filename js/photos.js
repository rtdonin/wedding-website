$(function () {
    // -------------------------------
    // Photo Upload Configuration
    // -------------------------------

    // Replace these with your actual Cloudinary settings
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
                    window: "#FFFFFF",
                    windowBorder: "#90A0B3",
                    tabIcon: "#6d8460",
                    menuIcons: "#5A616A",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                    link: "#B76E79",
                    action: "#6d8460",
                    inactiveTabIcon: "#90A0B3",
                    error: "#F44235",
                    inProgress: "#0078FF",
                    complete: "#20B832",
                    sourceBg: "#E4EBF1"
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
        // Submit all photos (bound after partial loads)
        $(document).on('click', '#submit-all-photos', handlePhotoSubmission);

        // Show/hide public warning when checkboxes change
        $(document).on('change', '.photo-public', togglePublicWarning);
    }

    // -------------------------------
    // Public Warning Toggle
    // -------------------------------
    function togglePublicWarning() {
        const $publicWarning = $('#public-warning');
        const hasPublicPhotos = $('.photo-public:checked').length > 0;

        if (hasPublicPhotos) {
            $publicWarning.show();
        } else {
            $publicWarning.hide();
        }
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
    // Photo Form Generation
    // -------------------------------
    function generatePhotoFormHtml(photo, index) {
        const taskOptions = SCAVENGER_HUNT_TASKS.map(task =>
            `<option value="${task}">${task}</option>`
        ).join('');

        return `
            <div class="photo-form-item" data-photo-index="${index}">
                <div class="photo-preview">
                    <img src="${photo.secure_url}" alt="Selected photo ${index + 1}">
                </div>
                <div class="photo-details">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="guest-name-${index}" class="form-label">Your Name</label>
                            <input type="text" class="form-control guest-name" id="guest-name-${index}" 
                                   placeholder="Enter your full name" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="task-${index}" class="form-label">Scavenger Hunt Task</label>
                            <select class="form-select photo-task" id="task-${index}" required>
                                <option value="">Choose a task...</option>
                                ${taskOptions}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 mb-3">
                            <div class="form-check">
                                <input class="form-check-input photo-public" type="checkbox" 
                                       id="public-${index}" checked>
                                <label class="form-check-label" for="public-${index}">
                                    Make this photo public (it will appear in the wedding gallery)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

        // Create a form for each selected photo using the helper function
        selectedPhotos.forEach((photo, index) => {
            const formHtml = generatePhotoFormHtml(photo, index);
            $formsContainer.append(formHtml);
        });

        // Show the form container
        $container.show();

        // Check initial warning state (photos default to public)
        togglePublicWarning();

        // Scroll to the form
        $container[0].scrollIntoView({ behavior: 'smooth' });
    }

    // -------------------------------
    // Form Submission
    // -------------------------------
    function handlePhotoSubmission() {
        const photoData = [];
        let allValid = true;

        $('.photo-form-item').each(function (index) {
            const $form = $(this);
            const guestName = $form.find('.guest-name').val().trim();
            const task = $form.find('.photo-task').val();
            const isPublic = $form.find('.photo-public').is(':checked');

            if (!guestName || !task) {
                allValid = false;
                return false; // Break out of each loop
            }

            photoData.push({
                ...selectedPhotos[index],
                guestName: guestName,
                scavengerTask: task,
                isPublic: isPublic,
                uploadedAt: new Date().toISOString()
            });
        });

        if (!allValid) {
            alert('Please fill in all required fields for each photo.');
            return;
        }

        showLoading();
        processPhotoSubmissions(photoData);
    }

    // -------------------------------
    // Photo Processing
    // -------------------------------
    function processPhotoSubmissions(photoData) {
        // Here you would typically send the data to your backend
        // For now, we'll simulate processing and store locally

        console.log('Processing photo submissions:', photoData);

        // Store submissions (you might want to send to a backend instead)
        const existingPhotos = JSON.parse(localStorage.getItem('weddingPhotos') || '[]');
        const allPhotos = [...existingPhotos, ...photoData];
        localStorage.setItem('weddingPhotos', JSON.stringify(allPhotos));

        // Hide loading and form
        hideLoading();
        $('#photo-form-container').hide();

        // Show success message
        $('#success-message').show();

        // Add public photos to gallery
        const publicPhotos = photoData.filter(p => p.isPublic);
        publicPhotos.forEach(photo => addPhotoToGallery(photo));

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

        // Create photo item
        const photoHtml = `
            <div class="photo-item">
                <img src="${photoInfo.secure_url}" alt="${photoInfo.scavengerTask}" loading="lazy">
                <div class="photo-info">
                    <h6>${photoInfo.scavengerTask}</h6>
                    <p>by ${photoInfo.guestName}</p>
                </div>
            </div>
        `;

        // Add to beginning of gallery
        $gallery.prepend(photoHtml);
    }

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