/*                                            
 ___       ___  ___  ________   ________  ___  ___     
|\  \     |\  \|\  \|\   ___  \|\   ____\|\  \|\  \    
\ \  \    \ \  \\\  \ \  \\ \  \ \  \___|\ \  \\\  \   
 \ \  \    \ \  \\\  \ \  \\ \  \ \  \    \ \   __  \  
  \ \  \____\ \  \\\  \ \  \\ \  \ \  \____\ \  \ \  \ 
   \ \_______\ \_______\ \__\\ \__\ \_______\ \__\ \__\
    \|_______|\|_______|\|__| \|__|\|_______|\|__|\|__|
                                                        */
const VERSION = 'Whiteverse: Explorer 1.3.3',
  CANVAS = document.getElementById('starmap'),
  CTX = CANVAS.getContext('2d'),
  CANVAS_STARS = document.getElementById('starmap_stars'),
  CTX_STARS = CANVAS_STARS.getContext('2d'),
  CANVAS_MARKS = document.getElementById('starmap_marks'),
  CTX_MARKS = CANVAS_MARKS.getContext('2d'),
  CANVAS_CONTROL = document.getElementById('starmap_control'),
  CTX_CONTROL = CANVAS_CONTROL.getContext('2d', { willReadFrequently: true }),
  COLOR_AUXILIARY = '#ffffff50',
  COLOR_BG_DEFAULT = '#000215',
  COLOR_BG_VIOLET = COLOR_BG_DEFAULT,
  COLOR_BG_LIGHT = COLOR_BG_DEFAULT,
  COLOR_BG_ARCTIC = COLOR_BG_DEFAULT,
  COLOR_STAR_DEFAULT = '#999',
  COLOR_STAR_VIOLET = COLOR_STAR_DEFAULT,
  COLOR_STAR_LIGHT = COLOR_STAR_DEFAULT,
  COLOR_STAR_ARCTIC = COLOR_STAR_DEFAULT,
  COLOR_STAR_WHITE = '#ffffff',
  COLOR_STAR_HIGHTLIGHTED = '#FFBE00',
  COLOR_STAR_LACKIMG = '#FF2E2E',
  COLOR_ROUTE = '#ffffffdd',
  COLOR_SECTOR_STRANDINGZONE = '#ac393955',
  COOKIE_EXPIRE_DAYS = 7,
  PLANET_IMAGE_MAX = 633,
  PATH_HTTP = 'https://whiteverse.com/',
  PATH_SCRIPTS = PATH_HTTP + 'scripts/',
  PATH_IMG_PLANETS = PATH_HTTP + 'resources/planets/',
  PATH_IMG_FACTIONS = PATH_HTTP + 'resources/factions/',
  PATH_CSS = PATH_HTTP + 'css/',
  PATH_JS = PATH_HTTP + 'scripts/explorer/',
  PATH_LOG = PATH_HTTP + 'explorer_log.md',
  PATH_DESKTOP = PATH_HTTP + 'explorer.html',
  PATH_MOBILE = PATH_HTTP + 'explorer_mobile.html',
  PATH_LOGO_DEFAULT = PATH_HTTP + 'resources/welogo.svg',
  PATH_LOGO_LIGHT = PATH_HTTP + 'resources/welogo_light.svg',
  PATH_LOGO_ANIMATED = PATH_HTTP + 'resources/welogo_animated.svg',
  PATH_WIKI = 'https://wiki.whiteverse.com/index.php?title=',
  PATH_WIKI_STRANDING_ZONE = PATH_WIKI + '禁滞区',
  PATH_WIKI_AROURA = PATH_WIKI + '极光工业',
  PATH_WIKI_JOIN = PATH_WIKI + '%E7%89%B9%E6%AE%8A:%E5%88%9B%E5%BB%BA%E8%B4%A6%E6%88%B7',
  PATH_FEEDBACK = 'https://wp.whiteverse.com/?p=1195#comments',
  TEXT_UNSELECTED = '无',
  TEXT_WELCOME = ',欢迎你!',
  TEXT_UNAUTHORIZED = '看起来你的权限不够。<br>请向<a href="mailto:Lunch@whiteverse.com">Lunch@whiteverse.com</a>提交使用申请。',
  TEXT_UNLOGGED = '登入你的Whiteverse账户',
  TEXT_ENTER_PASSWORD = "<i class='fa-solid fa-circle-exclamation'></i>&nbsp;请输入密码",
  TEXT_WRONG_NAME_PASSWORD = "<i class='fa-solid fa-circle-xmark'></i>&nbsp;用户名或密码错误",
  TEXT_CELESCIAL_AMOUNT = '天体数',
  TEXT_CELESCIAL_INCONTROL_AMOUNT = '控制天体数',
  TEXT_TIME_CONSUMPTION = '共耗时',
  TEXT_LOADING_ICON = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
