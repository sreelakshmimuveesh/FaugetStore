function productValidation() {
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;

    const priceValue = parseFloat(price);
    const quantityValue = parseInt(quantity);

    // Check if the price is not a number or less than or equal to zero
    if (isNaN(priceValue) || priceValue <= 0) {
        // Display an error message
        alert("Price should be a number and greater than zero");
        return false;
    } 
    // Check if the quantity is not a number or negative
    else if (isNaN(quantityValue) || quantityValue < 0) {
        alert("Quantity should be a negative number");
        return false;
    } 
    else {
        return true;
    }
}
