/*                                            
 ___       ___  ___  ________   ________  ___  ___     
|\  \     |\  \|\  \|\   ___  \|\   ____\|\  \|\  \    
\ \  \    \ \  \\\  \ \  \\ \  \ \  \___|\ \  \\\  \   
 \ \  \    \ \  \\\  \ \  \\ \  \ \  \    \ \   __  \  
  \ \  \____\ \  \\\  \ \  \\ \  \ \  \____\ \  \ \  \ 
   \ \_______\ \_______\ \__\\ \__\ \_______\ \__\ \__\
    \|_______|\|_______|\|__| \|__|\|_______|\|__|\|__|
                                                        */
let { mobile, override } = false;
let http_page = '';
let http_parms = '?';
const $_GET = (() => {
  url = window.document.location.href.toString();
  let u = url.split('?');
  http_page = u[0];
  if (typeof u[1] == 'string') {
    u = u[1].split('&');
    let get = {};
    u.forEach((item) => {
      let j = item.split('=');
      get[j[0]] = j[1];
    });
    return get;
  } else {
    return {};
  }
})();
override = JSON.parse($_GET['override'] || false);
if (!override) {
  if (http_page != 'https://whiteverse.com/explorer_mobile.html') {
    try {
      var urlhash = window.location.hash;
      if (!urlhash.match('fromapp')) {
        if (navigator.userAgent.match(/(iPhone|iPod|Android)/i)) {
          window.location = 'https://whiteverse.com/explorer_mobile.html' + http_parms == '?undefined' ? '' : http_parms;
        }
      }
    } catch (err) {}
  } else {
    mobile = override ? false : true;
  }
}

document.onreadystatechange = async () => {
  if (document.readyState == 'complete') {
    await initialize();
    document.getElementById('loading').classList.add('fadeout');
    setTimeout(() => {
      document.body.style.cssText = 'overflow-y:auto!important';
      document.getElementById('loading').classList.add('d-none');
    }, 500); //500ms for fadeout animation(550ms)
  }
};
let dynamicLoading = {
    css: (path) => {
      if (!path || path.length === 0) {
        throw new Error('argument "path" is required !');
      }
      let head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');
      link.href = path;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.id = 'theme-link';
      head.appendChild(link);
    },
    js: (path) => {
      if (!path || path.length === 0) {
        throw new Error('argument "path" is required !');
      }
      let head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');
      script.src = path;
      script.type = 'text/javascript';
      head.appendChild(script);
    },
  },
  cookie = {
    get: (cname) => {
      const name = cname + '=',
        ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
      }
      return '';
    },
    set: (cname, value, days = COOKIE_EXPIRE_DAYS) => {
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = date.toGMTString();
      } else var expires = '';
      cookieString = cname + '=' + value;
      if (expires) cookieString += ';expires=' + expires;
      document.cookie = cookieString;
    },
  };
var theme = cookie.get('theme') || 'light';
switch (theme) {
  case 'violet':
    dynamicLoading.css('css/explorer-theme-violet.css');
    break;
  case 'light':
    dynamicLoading.css('css/explorer-theme-light.css');
    break;
  case 'arctic':
    dynamicLoading.css('css/explorer-theme-arctic.css');
    break;
}
