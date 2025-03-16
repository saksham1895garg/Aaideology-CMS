document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".side").style.transform = "translateX(0)";
});
document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".side").style.transform = "translateX(-300px)";
});

const passwordField = document.querySelector(".log-password-input");
const hiddenEye = document.querySelector(".log-pass-eye-hidden");
const visibleEye = document.querySelector(".log-pass-eye");

hiddenEye.addEventListener("click", () => {
    passwordField.type = "text";
    hiddenEye.style.display = "none";
    visibleEye.style.display = "block";
});
visibleEye.addEventListener("click", () => {
    passwordField.type = "password";
    hiddenEye.style.display = "block";
    visibleEye.style.display = "none";
});

// Function to validate email
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic regex for email validation
    return email.length >= 5 && email.length <= 254 && emailPattern.test(email);
}
const a = document.getElementsByClassName("email-not-valid")[0];
console.log(a);


const emailToValidate = document.querySelector(".log-email-input");
emailToValidate.addEventListener("blur", () => {
    const emailValue = emailToValidate.value;
    if (validateEmail(emailValue)) {
        a.style.display = "none";
    } else {
        a.style.display = "block";
    }
}); 
