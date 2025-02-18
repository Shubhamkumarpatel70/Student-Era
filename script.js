// Auto update the year in the footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Initialize Swiper for carousel/slider
const swiper = new Swiper('.swiper', {
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

// Mobile Menu Toggle
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuButton.classList.toggle('active');
});

// Show scroll-up icon when the user scrolls down 200px from the top
window.onscroll = function () {
    const scrollUpIcon = document.querySelector('.scroll-up-icon-container');
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollUpIcon.style.display = 'block';
    } else {
        scrollUpIcon.style.display = 'none';
    }
};

// Page loading spinner logic
document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('show');
        spinner.style.opacity = 0;
        setTimeout(() => (spinner.style.display = 'none'), 500);
    }
});

// Show thank you message after contact form submission
function showThankYouMessage(event) {
    event.preventDefault(); // Prevent the form from submitting
    const contactForm = document.getElementById('contact-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    // Hide form and show thank-you message
    contactForm.classList.add('hidden');
    thankYouMessage.classList.remove('hidden');

    // Reset form and toggle views after 10 seconds
    setTimeout(() => {
        contactForm.reset();
        thankYouMessage.classList.add('hidden');
        contactForm.classList.remove('hidden');
    }, 10000);
}

// Certificate verification form submission
document.getElementById('certificate-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const btnText = document.getElementById('btn-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const submitBtn = document.getElementById('submit-btn');

    // Show spinner and disable button
    btnText.textContent = 'Please wait, checking records...';
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    // Simulate server response delay
    setTimeout(() => {
        btnText.textContent = 'Verify Certificate';
        loadingSpinner.classList.add('hidden');
        submitBtn.disabled = false;
        alert('Certificate check completed.');
    }, 3000);
});

// Fetch student projects
document.getElementById('fetchProjectForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    // Input values
    const studentName = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;

    // Simulate fetching projects
    const projects = [
        { title: 'Project 1', description: 'Description of Project 1' },
        { title: 'Project 2', description: 'Description of Project 2' },
    ];

    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = ''; // Clear previous results

    if (projects.length === 0) {
        projectsList.innerHTML = '<p>No projects found for this student.</p>';
    } else {
        projects.forEach((project) => {
            const projectItem = document.createElement('div');
            projectItem.classList.add('bg-gray-100', 'p-4', 'rounded-md', 'shadow-sm');

            const projectTitle = document.createElement('h4');
            projectTitle.classList.add('text-xl', 'font-bold', 'text-teal-600');
            projectTitle.textContent = project.title;

            const projectDescription = document.createElement('p');
            projectDescription.classList.add('text-gray-700');
            projectDescription.textContent = project.description;

            projectItem.appendChild(projectTitle);
            projectItem.appendChild(projectDescription);
            projectsList.appendChild(projectItem);
        });
    }

    document.getElementById('projectsContainer').classList.remove('hidden');
});
