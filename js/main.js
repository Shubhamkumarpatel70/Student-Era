(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 5,
        time: 500
    });


    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Project carousel
    $(".project-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        nav: false,
        dots: true,
        dotsData: true,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    
})(jQuery);


    document.addEventListener("DOMContentLoaded", function() {
        var phoneInput = document.getElementById("phone");
        var phoneError = document.getElementById("phoneError");

        phoneInput.addEventListener("input", function(event) {
            var inputValue = event.target.value.trim();
            if (!/^\d+$/.test(inputValue)) {
                phoneError.textContent = "Please enter mobile number only.";
            } else if (inputValue.length !== 10) {
                phoneError.textContent = "Please enter a 10-digit mobile number.";
            } else {
                phoneError.textContent = "";
            }
        });
    });

  
    document.getElementById('signupButton').addEventListener('click', function() {
        var email = document.getElementById('emailInput').value;
        if (email.trim() === "") {
            alert('Please enter your email.');
            return;
        }
        
        // Perform signup process (e.g., sending data to server)
        // Here, you can replace the alert with an AJAX call to send the email data to your server
        
        // Show success message
        alert('Thank you for signing up!');

        // Clear the input field
        document.getElementById('emailInput').value = '';

        // Refresh the newsletter form after 5 seconds
        setTimeout(function() {
            window.location.reload();
        }, 5000);
    });

    document.addEventListener("DOMContentLoaded", function() {
        var currentYear = new Date().getFullYear();
        document.getElementById("copyright").innerHTML +=
            " " + currentYear;
    });

// Update the copyright year
document.getElementById("currentYear").textContent = new Date().getFullYear();


document.getElementById("newsletterForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Show the thank you message
    document.getElementById("thankYouMessage").style.display = "block";

    // Hide the form
    document.getElementById("newsletterForm").style.display = "none";
});


const form = document.getElementById("form");
const result = document.getElementById("result");

form.addEventListener("submit", function (e) {
  const formData = new FormData(form);
  e.preventDefault();

  const file = document.getElementById("attachment");
  const filesize = file.files[0].size / 1024;

  if (filesize > 1000) {
    alert("Please upload file less than 1 MB");
    return;
  }

  result.innerHTML = "Please wait...";

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData
  })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        result.innerHTML = json.message;
        result.classList.remove("text-gray-500");
        result.classList.add("text-green-500");
      } else {
        console.log(response);
        result.innerHTML = json.message;
        result.classList.remove("text-gray-500");
        result.classList.add("text-red-500");
      }
    })
    .catch((error) => {
      console.log(error);
      result.innerHTML = "Something went wrong!";
    })
    .then(function () {
      form.reset();
      setTimeout(() => {
        result.style.display = "none";
      }, 5000);
    });
});
