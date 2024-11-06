document.addEventListener("DOMContentLoaded", function () {
    // Get references to the switch input element and the website URL
    const switchInput = document.getElementById("language-toggle");

    // Define the URLs you want to redirect to when the switch is toggled
    const franceURL = "http://fr.jimmy-legg.site";
    const RUURL = "http://jimmy-legg.site";
    const currentURL = window.location.href;

    if (currentURL.includes("france")) {
        // If the URL contains "france", it means you're in the French version
        // So, check the switch for French (ON)
        document.getElementById("language-toggle").checked = true;
      } else {
        // If not, assume you're in the default language (e.g., English) and set the switch to OFF
        document.getElementById("language-toggle").checked = false;
      }
      
      
      
      
      
    // Add an event listener to the switch input element
    switchInput.addEventListener("change", function () {
        if (switchInput.checked) {
            // If the switch is checked, redirect to the France URL
            window.location.href = franceURL;
        } else {
            // If the switch is not checked, redirect to the Russia URL
            window.location.href = RUURL;
        }
    });
});