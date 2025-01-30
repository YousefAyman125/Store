
document.addEventListener("DOMContentLoaded", function () {
    document
        .getElementById("contact-form")
        .addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the default form submission

            // Send the form data using EmailJS
            emailjs
                .sendForm(
                    "Store test", // Replace with your EmailJS Service ID
                    "template_b49k33x", // Replace with your EmailJS Template ID
                    this // The form element
                )
                .then(
                    function (response) {
                        alert("تم إرسال الرسالة بنجاح!"); // Success message
                        console.log("SUCCESS!", response.status, response.text);
                    },
                    function (error) {
                        alert("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."); // Error message
                        console.log("FAILED...", error);
                    }
                );
        });
});