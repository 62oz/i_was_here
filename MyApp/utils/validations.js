function isValidEmail(email) {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return pattern.test(email);
}

function isValidPassword(password) {
    const pattern = /^[a-zA-Z0-9._-]{6,}$/;
    return pattern.test(password);
}

export { isValidEmail, isValidPassword };
