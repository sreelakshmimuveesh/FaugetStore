function newUserValidation() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmpassword = document.getElementById('confirmpassword').value;
  const phone = document.getElementById('phone').value;

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const phoneRegex = /^\d{10}$/;

  if (!email.match(emailRegex)) {
    alert("Email not valid");
    return false;
  } else if (!phone.match(phoneRegex)) {
    alert("Phone number must be 10 digits");
    return false;
  } else if (/^0+$/.test(phone)) {
    alert("Phone number cannot be all zeros");
    return false;
  } else if (!password.match(passwordRegex)) {
    alert("Password must contain at least 8 characters with an uppercase letter, a lowercase letter, a digit, and a special character.");
    return false;
  } else if (password !== confirmpassword) {
    alert("Passwords don't match");
    return false;
  } else {
    return true;
  }
}

  