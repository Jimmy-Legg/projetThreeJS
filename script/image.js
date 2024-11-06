let isEnlarged = false;
let currentImageId = null;

function toggleImageSize(imageId) {
    const img = document.getElementById(imageId);

    if (isEnlarged && currentImageId === imageId) {
        img.classList.remove("enlarged");
        currentImageId = null;
    } else {
        if (currentImageId) {
            const currentImg = document.getElementById(currentImageId);
            currentImg.classList.remove("enlarged");
        }

        img.classList.add("enlarged");
        currentImageId = imageId;

        // Center the enlarged image on the screen
        centerImage(img);
    }

    isEnlarged = !isEnlarged;
}
// Listen for clicks anywhere on the page
document.addEventListener("click", (event) => {
    // Check if the click is not on an enlarged image
    if (isEnlarged && !event.target.classList.contains("enlarged")) {
        closeImage();
    }
});
// Center the image on the screen
function centerImage(img) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const imgWidth = img.width;
    const imgHeight = img.height+500;

    // Calculate the position to center the image
    const left = (viewportWidth - imgWidth) / 2;
    const top = (viewportHeight - imgHeight) / 2;

    img.style.left = `${left}px`;
    img.style.top = `${top}px`;
}



function closeImage() {
    if (currentImageId) {
        const img = document.getElementById(currentImageId);

        img.classList.remove("enlarged");
        img.style.left = ""; // Reset the left position
        img.style.top = ""; // Reset the top position

        currentImageId = null;
        isEnlarged = false;
    }
}
