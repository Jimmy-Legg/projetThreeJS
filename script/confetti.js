(function () {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

    NUM_CONFETTI = 300;

    COLORS = [[238, 170, 69], [216, 112, 32], [169, 51, 0], [238, 132, 87], [248, 182, 70]];

    PI_2 = 2 * Math.PI;

    canvas = document.getElementById("canvas");
    home = document.getElementById("home");

    context = canvas.getContext("2d");

    context.fillStyle = "white";

    window.w = 0;

    window.h = 0;

    /*resize the canvas*/
    resizeWindow = function () {
        window.w = canvas.width = window.innerWidth*2;
        return window.h = canvas.height = window.innerHeight*2;
    };

    window.addEventListener('resize', resizeWindow, false);

    window.onload = function () {
        return setTimeout(resizeWindow, 0);
    };

    range = function (a, b) {
        return (b - a) * Math.random() + a;
    };

    /*draw the circle*/
    drawCircle = function (x, y, r, style) {
        context.beginPath();
        context.arc(x, y, r, 0, PI_2, false);
        context.fillStyle = style;
        return context.fill();
    };

    xpos = 0.5;

    /*get the position of the mouse*/
    document.onmousemove = function (e) {
        return xpos = e.pageX*2 / w;
    };

    /*request animation frame*/
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();

    /*Confetti class*/
    Confetti = class Confetti {
        constructor() {
            this.style = COLORS[~~range(0, 5)];
            this.rgb = `rgba(${this.style[0]},${this.style[1]},${this.style[2]}`;
            this.r = ~~range(2, 6);
            this.r2 = 2 * this.r;
            this.replace();
        }
        /*replace the confetti*/
        replace() {
            this.opacity = 0;
            this.dop = 0.005 * range(1, 4);
            this.x = range(-this.r2, w - this.r2);
            this.y = range(-20, h - this.r2);
            this.xmax = w - this.r;
            this.ymax = h - this.r;
            this.vx = range(0, 2) + 8 * xpos - 5;
            return this.vy = 0.7 * this.r + range(-1, 1);
        }
        /*draw the confetti and text*/
        draw() {
            var ref;
            this.x += this.vx;
            this.y += this.vy;
            this.opacity += this.dop;
            if (this.opacity > 1) {
                this.opacity = 1;
                this.dop *= -1;
            }
            if (this.opacity < 0 || this.y > this.ymax) {
                this.replace();
            }
            if (!((0 < (ref = this.x) && ref < this.xmax))) {
                this.x = (this.x + this.xmax) % this.xmax;
            }
            context.fillStyle = "white";
            const fontSize = Math.min(canvas.width, canvas.height) / 15; // You can adjust the divisor to control the text size
            context.font = `${fontSize}px Arial`;
            context.textAlign = "center";

            canvas.style.width = window.height + 'px';
            canvas.style.height = window.innerHeight + 'px';
            return drawCircle(~~this.x, ~~this.y, this.r, `${this.rgb},${this.opacity})`);
        }
    };


    /*create the confetti*/
    confetti = (function () {
        var j, ref, results;
        results = [];
        for (i = j = 1, ref = NUM_CONFETTI; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
            results.push(new Confetti());
        }
        return results;
    })();

    /*draw the confetti*/
    window.step = function () {
        var c, j, len, results;
        requestAnimationFrame(step);
        context.clearRect(0, 0, w, h);
        results = [];
        for (j = 0, len = confetti.length; j < len; j++) {
            c = confetti[j];
            results.push(c.draw());
        }
        return results;
    };

    step();

})();