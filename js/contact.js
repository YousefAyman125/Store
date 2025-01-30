import * as path from "path";
import {join} from "path";
require('dotenv').config({ path: join(__dirname, '..', '.env') });

document.addEventListener("DOMContentLoaded", function () {
    document
        .getElementById("contact-form")
        .addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the default form submission
            console.log(process.env.EMAIL_JS_SERVICE_ID);
            // Send the form data using EmailJS
            emailjs
                .sendForm(
                    process.env.EMAIL_JS_SERVICE_ID, // Replace with your EmailJS Service ID
                    process.env.EMAIL_JS_TEMPLATE_ID, // Replace with your EmailJS Template ID
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