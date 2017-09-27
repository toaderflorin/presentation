(function () {
  puppeteer = {};
  puppeteer.animations = {};
  puppeteer._allGroups = [];
  puppeteer._allElements = [];
  puppeteer._allScreens = [];
  puppeteer._allGroupElements = [];
  puppeteer._allElementsSet = new Set();
  puppeteer._windowOffset = 0;
  puppeteer._scrollUp = false;
  puppeteer._screen = null;
  puppeteer._scrolling = false;
  puppeteer._scrollDestination = -1;
  puppeteer._scrollStep = -1;

  puppeteer._update = function () {
    puppeteer._allElementsSet.forEach(function (elem) {
      var rect = elem.getBoundingClientRect();
      var anim = elem.getAttribute('p-animation');
      var animMethod = puppeteer.snakeToCamel(anim);

      if (rect.top < window.innerHeight && rect.top > 0 && !puppeteer._scrollUp) {
        if (!elem.visible) {
          eval(`puppeteer.animations.${animMethod}(elem)`);
          elem.visible = true;
        }
      } else if (puppeteer._scrollUp && rect.top > window.innerHeight) {
        elem.visible = false;
      }
    });   

    puppeteer._allGroups.forEach(function (grp) {
      var rect = grp.BoundingClientRect();

      if (rect.top < window.innerHeight && rect.top > 0 && !puppeteer._scrollUp) {
        if (!grp.visible) {
          puppeteer._allElements.forEach(function (e) {
            var anim = e.getAttribute('p-animation');
            var animMethod = puppeteer.snakeToCamel(anim);
            var delay = e.getAttribute('p-delay');

            eval(`puppeteer.animations.${animMethod}(e)`);
          });
        }

        grp.visible = true;
      } else if (rect.bottom > window.innerHeight) {
        grp.visible = false;
      }
    });

    puppeteer._allScreens.forEach(function (screen) {
      var rect = screen.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.top > 0 && !puppeteer._scrollUp) {
        puppeteer._screen = screen;        
        console.log('here');
        puppeteer._scrollTo(rect.top);      
      }
    });
  }

  puppeteer._scrollTo = function (destination) {
    var dist = destination - puppeteer._windowOffset;
    var step = destination / 50;
    var count = 0;
    var pos = puppeteer._windowOffset;
    var scrolling = false;

    var f = function () {
      console.log('here2');
      pos += step;
      window.scroll(0, pos);
      count++;

      if (count < 50) {
        setTimeout(f, 3);
      } else {
        puppeteer._scrolling = false;
      }
    }  

    if (!puppeteer._scrolling) {
      setTimeout(f, 3);
      puppeteer._scrolling = true;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    puppeteer._allElements = document.querySelectorAll('[p-animation]');
    puppeteer._allElements.forEach(function (e) {
      puppeteer._allElementsSet.add(e);
    });

    puppeteer._allGroups = document.querySelectorAll('[p-group]');
    puppeteer._allScreens = document.querySelectorAll('[p-screen]');

    puppeteer._allGroups.forEach(function (grp) {
      var groupName = grp.getAttribute('p-group');
      var elements = document.querySelectorAll(`[p-group="${groupName}"] [p-animation]`);

      puppeteer._allGroupElements.push(elements);
      elements.forEach(function (e) {
        puppeteer._allElementsSet.delete(e);
      });
    });

    puppeteer._update();
  });

  document.addEventListener('scroll', function (e) {
    if (window.pageYOffset < puppeteer._windowOffset) {
      puppeteer._scrollUp = true;
    } else {
      puppeteer._scrollUp = false;
    }

    puppeteer._windowOffset = window.pageYOffset;
    puppeteer._update();
  });

  puppeteer.snakeToCamel = function (s) {
    return s.replace(/(\-\w)/g, function (m) { return m[1].toUpperCase(); });
  }

  puppeteer.animations.vertical = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = 20;
    }

    elem.animate([{
      transform: `translateY(${param}px)`
    }, {
      transform: 'translateY(0px)'
    }], {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }

  puppeteer.animations.blur = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = 5;
    }

    if (param < 0) {
      throw new Error('Value needs to be a positive integer indicating the number of pixels used for the blur filter.');
    }

    elem.animate([{
      filter: `blur(${param}px)`,
    }, {
      filter: 'blur(0px)',
    }], {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }

  puppeteer.animations.fade = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = 0;
    }

    if (param < 0 || param > 1) {
      throw new Error('Value needs to be a number between 0 and 1.');
    }

    elem.animate([{
      opacity: param
    }, {
      opacity: 1
    }],
      {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }

  puppeteer.animations.colorize = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = 1;
    }

    if (param < 0 || param > 1) {
      throw new Error('Value needs to be a number between 0 and 1.');
    }

    elem.animate([{
      filter: `grayscale(${param})`
    }, {
      filter: 'grayscale(0)'
    }], {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }

  puppeteer.animations.horizontal = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = -40;
    }

    elem.animate([{
      transform: `translateX(${param}px)`
    },
    {
      transform: 'translateX(0px)'
    }], {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }

  puppeteer.animations.rotate = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = 15;
    }

    var offset = delay / (delay + duration);

    elem.animate([{
      transform: `rotate(${param}deg)`
    },
    {
      transform: 'rotate(0deg)'
    }],
      {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }

  puppeteer.animations.scale = function (elem) {
    var delay = parseInt(elem.getAttribute('p-delay'));
    var duration = parseInt(elem.getAttribute('p-duration'));
    var param = parseInt(elem.getAttribute('p-param'));

    if (isNaN(delay)) {
      delay = 0;
    }

    if (isNaN(duration)) {
      duration = 500;
    }

    if (isNaN(param)) {
      param = 0.7;
    }

    elem.animate([{
      transform: `scale(${param})`
    },
    {
      transform: 'scale(1)'
    }], {
        fill: 'both',
        delay: delay,
        duration: duration
      }
    );
  }
})();