var theToggle = document.getElementById('toggle');
var theSpan = document.getElementById('span');
function hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}


/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function toggleClass(elem, className) {
    var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, " ") + ' ';

    if (hasClass(elem, className)) {
        while (newClass.indexOf(" " + className + " ") >= 0) {
            newClass = newClass.replace(" " + className + " ", " ");
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
        elem.className = 'off';
    }
    else {
        elem.className = className;
    }
}

/*change the toggle*/
theToggle.onclick = function () {
    toggleClass(this, 'on');
    return false;
}


/* Add event listener to menu items in the menu */
document.querySelectorAll("#menu ul li a").forEach(element =>
    element.addEventListener("click", event => {
        event.preventDefault();

        const target = document.querySelector(event.target.getAttribute("href"));

        window.scrollTo({
            top: target.offsetTop,
            left: 0,
            behavior: "smooth"
        });

        console.log("click");

    })
);
/* Add event listener to menu items in the main */
document.querySelectorAll("main").forEach(element => {
    element.addEventListener("click", event => {
        console.log("click");

        if (theToggle.className == "on") {
            toggleClass(theToggle, 'on');
        }

    });
});

/* Add event listener to menu items in the navbar */
document.querySelectorAll(".navbar a").forEach(element => {
    element.addEventListener("click", event => {
        event.preventDefault();

        const target = document.querySelector(event.target.getAttribute("href"));

        window.scrollTo({
            top: target.offsetTop,
            left: 0,
            behavior: "smooth"
        });
    });
});
document.querySelector(".arrow").addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop-50,
            behavior: "smooth",
        });
    }
});