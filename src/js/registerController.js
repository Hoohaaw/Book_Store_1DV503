function validateEmail(email) {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email)
}

function validateZipcode(zipcode) {

    if(!zipcode) return false;
    const z = String(zipcode).trim()
    return /^[0-9]{5}$/.test(z)
    
}

module.exports = { validateEmail, validateZipcode}