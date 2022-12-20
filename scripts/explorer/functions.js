/*                                            
 ___       ___  ___  ________   ________  ___  ___     
|\  \     |\  \|\  \|\   ___  \|\   ____\|\  \|\  \    
\ \  \    \ \  \\\  \ \  \\ \  \ \  \___|\ \  \\\  \   
 \ \  \    \ \  \\\  \ \  \\ \  \ \  \    \ \   __  \  
  \ \  \____\ \  \\\  \ \  \\ \  \ \  \____\ \  \ \  \ 
   \ \_______\ \_______\ \__\\ \__\ \_______\ \__\ \__\
    \|_______|\|_______|\|__| \|__|\|_______|\|__|\|__|
                                                        */

let { STARDATA, STARS, TYPES, BUFFS, FACTIONS, REGIONS, ROUTES } = [],
  { UNUSEDIMGAMOUNT, UNUSEDIMGOPENED, ROUTELISTOPENED, ISADMIN, ISLOGIN, TIME } = 0,
  WORKER = new Worker(PATH_JS + 'worker.js'),
  C = parseFloat(cookie.get('scale')) || 4,
  NEVERWELCOME = JSON.parse(cookie.get('neverWelcome') || 0),
  SHOWMETA = JSON.parse(cookie.get('showMeta') || 0),
  OVERLAY = JSON.parse(cookie.get('overlay') || 0),
  CHARTOVERLAY = JSON.parse(cookie.get('chartOverlay') || 0),
  LOCATESTYLE = Number(cookie.get('locateStyle') || 0),
  CANVASBACKGROUNDCOLOR = COLOR_BG_DEFAULT,
  CANVASSTARCOLOR = COLOR_STAR_DEFAULT,
  LOGO = PATH_LOGO_DEFAULT;

function processGotMessage(ifpc = 1) {
  const wikiPlanet = decodeURI($_GET['planet']),
    factionView = $_GET['faction'];
  if (wikiPlanet !== undefined) {
    let star = STARS.find((item) => {
      if (item.name_cn === wikiPlanet) {
        return item;
      }
    });
    if (star) {
      if (ifpc) {
        if (factionView !== undefined) {
          vFaction(1);
        }
        locate(star.x * C, star.y * C, 0);
        $('#infoPanel').removeClass('d-none');
        $('#showInfoPanel').addClass('btn-secondary').removeClass('btn-starmap').prop('disabled', true);
      }
      setInfo(star);
    }
  }
  if (wikiPlanet === undefined && factionView !== undefined) {
    vFaction(1);
  }
}
function processGotEditlog(editlog) {
  editlog = editlog
    .replace(/([0-9]{4}\-[0-1][0-9]\-[0-3][0-9]\ [0-2][0-9]\:[0-5][0-9]\:[0-5][0-9]$)/, '<span class="edited-time">$1</span>')
    .replace('edited', '<i class="fa-solid fa-pen"></i>')
    .replace('route added', '<i class="fa-solid fa-code-commit"></i>')
    .replace(/({.*})/, '<span class="edited-content">$1</span>');
  return editlog;
}
function ajax() {
  return new Promise((resolve) => {
    $.ajax({
      url: `${PATH_SCRIPTS}getStars.php`,
      async: false,
      type: 'POST',
      success: function (data) {
        try {
          STARDATA = JSON.parse(data);
        } catch (e) {
          console.log(data);
        }
      },
    });
    STARS = STARDATA[0];
    TYPES = STARDATA[1];
    BUFFS = STARDATA[2];
    FACTIONS = STARDATA[3];
    REGIONS = STARDATA[4];
    ROUTES = STARDATA[5];
    resolve();
  });
}
function setTheme(theme) {
  switch (theme) {
    case 'violet':
      CANVASBACKGROUNDCOLOR = COLOR_BG_VIOLET;
      CANVASSTARCOLOR = COLOR_STAR_VIOLET;
      LOGO = PATH_LOGO_DEFAULT;
      break;
    case 'light':
      CANVASBACKGROUNDCOLOR = COLOR_BG_LIGHT;
      CANVASSTARCOLOR = COLOR_STAR_LIGHT;
      LOGO = PATH_LOGO_LIGHT;
      break;
    case 'arctic':
      CANVASBACKGROUNDCOLOR = COLOR_BG_ARCTIC;
      CANVASSTARCOLOR = COLOR_STAR_ARCTIC;
      LOGO = PATH_LOGO_DEFAULT;
      break;
    default:
      break;
  }
}
async function initialize() {
  await ajax();
  return new Promise((resolve) => {
    ajax();
    setTheme(theme);
    if (!NEVERWELCOME) {
      $('#aboutModal').modal('show');
    }
    initializeInfoPanel();
    $('#type').html('').append(`<option value=''>${TEXT_UNSELECTED}</option>`);
    TYPES.forEach((type) => {
      $('#type').append(`<option value='${parseInt(type.id)}'>${'◽' + type.id + '&nbsp;' + type.name_cn}</option>`);
    });
    $('#buff').html('').append(`<option value=''>${TEXT_UNSELECTED}</option>`);
    BUFFS.forEach((buff) => {
      $('#buff').append(`<option value='${parseInt(buff.id)}'>${buff.name_cn}</option>`);
    });
    $('#faction').html('').append(`<option value=''>${TEXT_UNSELECTED}</option>`);
    FACTIONS.forEach((faction) => {
      $('#faction').append(`<option value='${parseInt(faction.id)}'>${'◽' + faction.id + '&nbsp;' + faction.name_cn}</option>`);
    });
    $('#region').html('').append(`<option value=''>${TEXT_UNSELECTED}</option>`);
    REGIONS.forEach((region) => {
      $('#region').append(`<option value='${parseInt(region.id)}'>${'◽' + region.id + '&nbsp;' + region.name_cn}</option>`);
    });
    $('.titleLogoContainer').append(`<img class="welogo" src="${LOGO}" title="Whiteverse: Explorer">`);
    $('#userLogged').addClass('d-none');
    $('.user-text').html(TEXT_UNLOGGED);
    $('.alert-text').html(TEXT_UNAUTHORIZED);
    $('.version').html(VERSION);
    $('#showMeta').prop({ checked: SHOWMETA });
    $('#locateStyle').prop({ checked: LOCATESTYLE });
    $('#neverWelcome').prop({ checked: NEVERWELCOME });
    if (!SHOWMETA) {
      $('#metaDataContainer').addClass('d-none');
      SHOWMETA = 0;
    } else {
      $('#metaDataContainer').removeClass('d-none');
      SHOWMETA = 1;
    }
    $('#overlay').prop({ checked: OVERLAY });
    $('#chartOverlay').prop({ checked: CHARTOVERLAY });
    $('#themeRadio_' + theme).prop({ checked: true });
    $('#showInfoPanel').removeClass('btn-secondary').addClass('btn-starmap').prop('disabled', false);

    let userName = undefined;
    $.ajax({
      url: `${PATH_SCRIPTS}userCookies.php`,
      async: false,
      type: 'GET',
      success: function (data) {
        userName = data;
        if (data) {
          ISLOGIN = 1;
          $('.user-text').html(userName + TEXT_WELCOME);
          $('#userLogged,#submitChange').removeClass('d-none');
          $('#userLoginInputs').addClass('d-none');
          $.ajax({
            url: `administrators.json`,
            async: false,
            type: 'GET',
            success: function (data) {
              ISADMIN = data.includes(userName) ? 1 : 0;
            },
          });
          if (ISADMIN) {
            for (let i = 0; i <= PLANET_IMAGE_MAX; i++) {
              let imgs = STARS.filter((item) => {
                return parseInt(item.img) === i;
              });
              if (imgs.length === 0) {
                UNUSEDIMGAMOUNT++;
                $('#unusedImgPanel').append(`<li class="list-group-item list-group-item-action unused-img list-style">${i}</li>`);
              }
            }
            $('#downloadStarCSV').removeClass('btn-secondary').addClass('btn-starmap').prop('disabled', false);
            return;
          }
        }
        $('#CSVModal,#submitChange,#addNewRoute').remove();
      },
    });
    if (!mobile) {
      (async () => {
        const font = new FontFace('whiteversepixel', 'url("../resources/whiteversepixel.ttf")');
        await font.load();
        document.fonts.add(font);
        document.fonts.ready.then(() => {
          drawAll();
          const canvasLeft =
            parseInt($('#toolbar').css('width')) + (window.innerWidth - parseInt($('#toolbar').css('width')) - CANVAS.width) / 2;
          $('.starmap').css({ left: canvasLeft });
          whiteverse();
          processGotMessage();
        });
      })();
      summary(); //after ajax for unused Image Amount
    } else {
      $('.starmap-canvas-container').remove();
      if (!$_GET['planet']) {
        $('#shuffle').trigger('click');
      }
      processGotMessage(0);
    }
    resolve();
  });
}
function initializeInfoPanel() {
  $('#planet,#countImg,#countEdited,#buffIdDisplay,#buffArea,.title,#planetID').html('&nbsp;');
  $('.form-control,#type,#buff,#region,#faction,#capital').val('');
  $('#editedInfo,#locateAll,#locateThis,.btn-nano,.mini-info,.editedInfo').addClass('d-none');
  $('#wikiLink_planet').removeClass('link-green').addClass('d-none').addClass('link-red');
  $('#planetInfo').attr({ starid: '', hasbuff: '' });
  $('.star-route-viewer').addClass(!mobile ? 'd-none' : '');
  $('#showRouteList').html('<i class="fa-regular fa-circle-' + ROUTELISTOPENED ? 'left' : 'right' + '"></i>');
  $('#submitChange').removeClass('btn-starmap').addClass('btn-secondary').prop('disabled', true);
}
function randomInt(from, to) {
  return parseInt(Math.random() * (to - from + 1) + from);
}
function createAndDownloadFile(fileName, content) {
  let aTag = document.createElement('a'),
    blob = new Blob(['\uFEFF' + content]);
  aTag.download = fileName;
  aTag.href = URL.createObjectURL(blob);
  aTag.click();
  URL.revokeObjectURL(blob);
}
function hexToRGB(color) {
  let r, g, b;
  if (color.charAt(0) === '#') {
    color = color.substr(1);
  }
  r = color.charAt(0) + '' + color.charAt(1);
  g = color.charAt(2) + '' + color.charAt(3);
  b = color.charAt(4) + '' + color.charAt(5);
  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function setInfo(star, index = 0) {
  const s = star[index] || star,
    countImg = STARS.filter((item) => {
      return parseInt(item.img) == s.img;
    }),
    hasBuff = s.buff,
    capital_id = REGIONS[s.region_id - 1].capital_id,
    capital_name_cn = STARS.find((item) => {
      return item.id == capital_id;
    }).name_cn;
  $('.mini-info').removeClass('d-none');
  $('#hasRoute').addClass('d-none');
  $('#buffArea').html('');
  if (s.buff) {
    $('#buffRecord').val(s.buff);
    starBuffs = s.buff.split(',');
    for (let i = 0; i < starBuffs.length; i++) {
      $('#buffArea').append(
        `<span class='badge badge-primary m-1 badge-buff' data-toggle="tooltip" data-placement="top" title="${
          BUFFS[starBuffs[i] - 1].description_cn
        }" buffid='${starBuffs[i]}'>${BUFFS[starBuffs[i] - 1].name_cn}</span>`
      );
    }
  }
  $('#planetInfo').attr({
    starid: s.id,
    hasbuff: hasBuff,
  });
  $('#locateAll').removeClass(countImg.length ? 'd-none' : '');
  let hasRoute = ROUTES.filter((route) => {
    return s.id == route.starid1 || s.id == route.starid2;
  });
  if (hasRoute[0]) {
    $('#hasRoute').removeClass('d-none');
    $('.star-route-viewer').removeClass(ROUTELISTOPENED ? 'd-none' : '');
    $('#routeList').html('');
    hasRoute.forEach((item) => {
      let theOtherStarID = s.id == item.starid1 ? item.starid2 : item.starid1;
      const template = `<li class="list-group-item list-group-item-action listed-route list-style" starid="${STARS[theOtherStarID].id}">${STARS[theOtherStarID].name_cn}<small> #${STARS[theOtherStarID].id}</small></li>`;
      $('#routeList').append(template);
    });
  }
  $('#planetID').html(`#${s.id}`);
  $('#planet').html(`<img class='planetImg' src='${PATH_IMG_PLANETS + s.img}.png'/>`);
  $('#buffIdDisplay').html(hasBuff);
  $('#countImg').html(countImg.length);
  $('#countEdited').html(s.edited);
  $('#planet_img').val(s.img);
  $('#type').val(s.type);
  $('#coordX').val(s.x);
  $('#coordY').val(s.y);
  $('#name_en').val(s.name_en);
  $('#name_cn').val(s.name_cn);
  $('#name_tn').val(s.name_tn);
  $('.title').html(`${s.name_cn} | ${s.name_en}`);
  if (s.description_cn) {
    $('#descriptionContainer').addClass('show');
    $('#desc_cn').val(s.description_cn);
    $('#desc_en').val(s.description_en);
    $('#desc_tn').val(s.description_tn);
  } else {
    $('#descriptionContainer').removeClass('show');
  }
  $('#constellationArea').html(s.area);
  $('#region').val(s.region_id);
  $('#faction').val(s.faction_id);
  $('#capital').val(capital_name_cn);
  $('#locateThis').removeClass('d-none').attr({ capitalid: capital_id });
  $.get('https://wiki.whiteverse.com/api.php', { action: 'opensearch', search: s.name_cn, limit: 1 }, (data) => {
    const result = JSON.parse(JSON.stringify(data));
    if (result[3][0] != undefined) {
      $('#wikiLink_planet')
        .html('<i class="fa-solid fa-link"></i>')
        .removeClass('d-none')
        .removeClass('link-red')
        .addClass('link-green')
        .attr({ href: result[3][0] });
    } else {
      $('#wikiLink_planet')
        .html('<i class="fa-solid fa-link-slash"></i>')
        .removeClass('d-none')
        .attr({ href: PATH_WIKI + s.name_cn });
    }
  });

  if (parseInt(s.faction_id)) {
    $('#wikiLink_faction')
      .removeClass('d-none')
      .attr({ href: PATH_WIKI + FACTIONS[s.faction_id - 1].name_cn });
  }
  if (ISADMIN) {
    $('#submitChange').addClass('btn-starmap').removeClass('btn-secondary').prop('disabled', false);
  }
  return s;
}
function submitChange() {
  const id = $('#planetInfo').attr('starid'),
    img = $('#planet_img').val(),
    type = $('#type').val(),
    coordX = $('#coordX').val(),
    coordY = $('#coordY').val(),
    name_en = $('#name_en').val(),
    name_cn = $('#name_cn').val(),
    name_tn = $('#name_tn').val(),
    description_cn = $('#desc_cn').val(),
    description_tn = $('#desc_tn').val(),
    description_en = $('#desc_en').val(),
    buff = $('#planetInfo').attr('hasbuff'),
    faction = $('#faction').val(),
    region = $('#region').val();
  if (!img || !type || !coordX || !coordY || !region || !name_en || !name_cn || !name_tn) {
    $('#submitChange').next().html('<i class="fa-regular fa-circle-xmark"></i>').removeClass('d-none');
    return;
  }
  $.ajax({
    url: `${PATH_SCRIPTS}editStar.php`,
    async: true,
    type: 'POST',
    data: {
      id: id,
      img: img,
      type: type,
      coordX: coordX,
      coordY: coordY,
      name_en: name_en,
      name_cn: name_cn,
      name_tn: name_tn,
      description_cn: description_cn,
      description_tn: description_tn,
      description_en: description_en,
      buff: buff,
      region: region,
      faction: faction,
    },
    success: (data) => {
      switch (data) {
        case 'success':
          let countEdited = parseInt($('#countEdited').html()) + 1;
          STARS[id].edited = parseInt(STARS[id].edited) + 1;
          $('#countEdited').html(countEdited);
          $('#submitChange').next().html('<i class="fa-regular fa-circle-check"></i>').removeClass('d-none');
          break;
        case 'nochange':
          $('#submitChange').next().html('<i class="fa-regular fa-circle"></i>').removeClass('d-none');
          break;
        default:
          $('#submitChange').next().html('<i class="fa-regular fa-circle-xmark"></i>').removeClass('d-none');
      }
    },
  });
}
function submitRoute() {
  const starID = parseInt($('#route').val()),
    currentID = parseInt($('#planetInfo').attr('starid'));
  if (starID == currentID) {
    return;
  }
  $.post(
    `${PATH_SCRIPTS}addRoute.php`,
    {
      s1: currentID,
      s2: starID,
    },
    function () {
      ROUTES.push({ starid1: currentID, starid2: starID });
      drawStarRoute(1);
    }
  );
}
function locate(xRaw, yRaw, _lstyle = LOCATESTYLE) {
  const _ctx = CTX_MARKS;
  const _style = _lstyle;
  _ctx.fillStyle = COLOR_AUXILIARY;
  switch (_style) {
    case 0: //十字方格
      _ctx.fillRect(xRaw, 0, C, yRaw - 2 * C);
      _ctx.fillRect(xRaw, yRaw + 3 * C, C, CANVAS.width - yRaw);
      _ctx.fillRect(0, yRaw, xRaw - 2 * C, C);
      _ctx.fillRect(xRaw + 3 * C, yRaw, CANVAS.width - xRaw, C);
    case 1: //方格
      _ctx.fillRect(xRaw - 2 * C, yRaw - 2 * C, 5 * C, C);
      _ctx.fillRect(xRaw - 2 * C, yRaw - C, C, 4 * C);
      _ctx.fillRect(xRaw + 2 * C, yRaw - C, C, 4 * C);
      _ctx.fillRect(xRaw - C, yRaw + 2 * C, 3 * C, C);
      break;
    case 2: //菱形
      xRaw += 0.5 * C;
      yRaw += 0.5 * C;
      _ctx.strokeStyle = COLOR_AUXILIARY;
      _ctx.lineWidth = C;
      _ctx.beginPath();
      _ctx.setLineDash([0, 0]);
      _ctx.moveTo(xRaw - 2 * C, yRaw);
      _ctx.lineTo(xRaw, yRaw - 2 * C);
      _ctx.lineTo(xRaw + 2 * C, yRaw);
      _ctx.lineTo(xRaw, yRaw + 2 * C);
      _ctx.lineTo(xRaw - 2 * C, yRaw);
      _ctx.closePath();
      _ctx.stroke();
      break;
    case 3: //圆环
      xRaw += 0.5 * C;
      yRaw += 0.5 * C;
      _ctx.strokeStyle = COLOR_AUXILIARY;
      _ctx.lineWidth = C;
      _ctx.beginPath();
      _ctx.setLineDash([0, 0]);
      _ctx.arc(xRaw, yRaw, 1.5 * C, 0, 2 * Math.PI);
      _ctx.stroke();
      break;
  }
}
function whiteverse() {
  let canvasLogo = CANVAS_CONTROL,
    ctx = canvasLogo.getContext('2d'),
    x = 20 * C,
    y = canvasLogo.height - 31 * C;
  canvasLogo.style.letterSpacing = -1 * C + 'px';
  ctx.font = 4 * C + 'px whiteversepixel';
  ctx.fillStyle = COLOR_AUXILIARY;
  ctx.fillRect(x, y, 11 * C, C);
  ctx.fillRect(x, y + 10 * C, 11 * C, C);
  ctx.fillRect(x, y + 1 * C, C, 9 * C);
  ctx.fillRect(x + 10 * C, y + 1 * C, C, 9 * C);
  ctx.fillRect(x + 3 * C, y + 2 * C, 2 * C, C);
  ctx.fillRect(x + 6 * C, y + 2 * C, 2 * C, C);
  ctx.fillRect(x + 2 * C, y + 3 * C, 2 * C, C);
  ctx.fillRect(x + 7 * C, y + 3 * C, 2 * C, C);
  ctx.fillRect(x + 2 * C, y + 4 * C, C, C);
  ctx.fillRect(x + 8 * C, y + 4 * C, C, C);
  ctx.fillRect(x + 4 * C, y + 4 * C, C, 3 * C);
  ctx.fillRect(x + 6 * C, y + 4 * C, C, 3 * C);
  ctx.fillRect(x + 2 * C, y + 6 * C, C, C);
  ctx.fillRect(x + 8 * C, y + 6 * C, C, C);
  ctx.fillRect(x + 2 * C, y + 7 * C, 2 * C, C);
  ctx.fillRect(x + 7 * C, y + 7 * C, 2 * C, C);
  ctx.fillRect(x + 3 * C, y + 8 * C, 2 * C, C);
  ctx.fillRect(x + 6 * C, y + 8 * C, 2 * C, C);
  ctx.fillText(VERSION, 2 * C, 5 * C);
}
function drawAll() {
  CANVAS.width = C * 500;
  CANVAS.height = C * 500;
  CANVAS_STARS.width = CANVAS.width;
  CANVAS_STARS.height = CANVAS.height;
  CANVAS_MARKS.width = CANVAS.width;
  CANVAS_MARKS.height = CANVAS.height;
  CANVAS_CONTROL.width = CANVAS.width;
  CANVAS_CONTROL.height = CANVAS.height;
  CTX.fillStyle = CANVASBACKGROUNDCOLOR;
  CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
  drawStars();
}
function drawCell(cell) {
  if (!cell) return false;
  CTX.beginPath();
  CTX.moveTo(cell[0][0], cell[0][1]);
  for (let j = 1; j < cell.length; ++j) {
    CTX.lineTo(cell[j][0], cell[j][1]);
  }
  CTX.closePath();
  return true;
}
function drawStars(_color = CANVASSTARCOLOR, _content = STARS, _starStyle = true, _locate = 0, _locateStyle = 0) {
  _content.forEach((star) => {
    CTX_STARS.fillStyle = _color;
    if (_starStyle) {
      /* 小问题：绘制两次圆形星星后会变方 */
      CTX_STARS.beginPath();
      CTX_STARS.arc(star.x * C + 0.5 * C, star.y * C + 0.5 * C, C * 0.5, 0, 2 * Math.PI);
      CTX_STARS.fill();
      CTX_STARS.closePath();
    } else {
      CTX_STARS.fillRect(star.x * C, star.y * C, C, C);
    }
    if (_locate) {
      locate(star.x * C, star.y * C, _locateStyle);
    }
  });
}
function drawStarRoute(_locateStar = false, _times = 1) {
  const _ctx = CTX_MARKS;
  _ctx.strokeStyle = COLOR_AUXILIARY;
  _ctx.lineWidth = C;
  for (let i = 0; i < _times; i++) {
    ROUTES.forEach((route) => {
      _ctx.beginPath();
      _ctx.setLineDash([8, 20]);
      _ctx.moveTo(STARS[route.starid1].x * C + 0.5 * C, STARS[route.starid1].y * C + 0.5 * C);
      _ctx.lineTo(STARS[route.starid2].x * C + 0.5 * C, STARS[route.starid2].y * C + 0.5 * C);
      _ctx.closePath();
      _ctx.stroke();
      if (_locateStar) {
        locate(STARS[route.starid1].x * C, STARS[route.starid1].y * C, 2);
        locate(STARS[route.starid2].x * C, STARS[route.starid2].y * C, 2);
      }
    });
  }
}
function drawChangeScale(_range) {
  const size = _range / 10;
  C = size;
  drawAll();
  drawStars();
  whiteverse();
}
function vPoints(alpha = '00') {
  let points = [];
  for (let i = 0; i < STARS.length; i++) {
    points[i] = {
      x: parseInt(STARS[i].x) * C,
      y: parseInt(STARS[i].y) * C,
      faction_id: STARS[i].faction_id,
      color: CANVASBACKGROUNDCOLOR + alpha,
      area: '',
    };
  }
  return points;
}
function vDraw(points, line = 0) {
  let voronoi = d3
    .voronoi()
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    })
    .extent([
      [-5, -5],
      [500 * C + 5, 500 * C + 5],
    ]);
  let polygons = voronoi(points).polygons();
  CTX.strokeStyle = COLOR_AUXILIARY;
  CTX.lineWidth = 0.1;
  for (let i = 0; i < polygons.length; ++i) {
    drawCell(polygons[i]);
    CTX.fillStyle = points[i].color;
    CTX.fill();
    line ? CTX.stroke() : '';
  }
  // drawStars();
}
function vStars(dye = false, _overlay = OVERLAY) {
  !_overlay ? drawAll() : '';
  let voronoi = d3
      .voronoi()
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      })
      .extent([
        [-5, -5],
        [500 * C + 5, 500 * C + 5],
      ]),
    points = vPoints(),
    color = [],
    polygons = voronoi(points).polygons();
  CTX.strokeStyle = COLOR_AUXILIARY;
  CTX.lineWidth = 0.1;
  CTX.setLineDash([0, 0]);
  for (let i = 0; i < polygons.length; ++i) {
    drawCell(polygons[i]);
    if (dye) {
      color[i] = `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;
      CTX.fillStyle = color[i];
      CTX.fill();
    } else {
      CTX.stroke();
    }
    points[i].color = color[i];
  }
  return points;
}
function vRegion(_overlay = OVERLAY) {
  !_overlay ? drawAll() : '';
  let points = vPoints();
  for (let i = 0; i < REGIONS.length; i++) {
    let star_index = REGIONS[i].capital_id, //在regions中找到capital star id
      targetColor = hexToRGB(STARS[star_index].color),
      includedStars = STARS.filter((star) => {
        return star.region_id == REGIONS[i].id;
      });
    for (let k = 0; k < includedStars.length; k++) {
      points[includedStars[k].id].color = `rgba${targetColor.substring(0, targetColor.length - 1).substring(3)},0.3)`;
    }
  }
  vDraw(points, 1);
}
function vFaction(_overlay = OVERLAY) {
  !_overlay ? drawAll() : '';
  let points = vPoints('BB');
  for (let i = 0; i < FACTIONS.length; i++) {
    let targetColor = hexToRGB(FACTIONS[i].color),
      includedStars = STARS.filter((star) => {
        return star.faction_id == FACTIONS[i].id;
      });
    for (let k = 0; k < includedStars.length; k++) {
      points[includedStars[k].id].color = `rgba${targetColor.substring(0, targetColor.length - 1).substring(3)},0.3)`;
    }
  }
  vDraw(points, 1);
}
function vTheFaction(_faction_id, _overlay = OVERLAY) {
  !_overlay ? drawAll() : '';
  let points = vPoints(),
    targetColor = hexToRGB(FACTIONS[_faction_id - 1].color);
  points.forEach(function (item, index, points) {
    if (item.faction_id == _faction_id) {
      points[index].color = `rgba${targetColor.substring(0, targetColor.length - 1).substring(3)},0.3)`;
    }
  });
  vDraw(points);
}
function vStrandingZone() {
  let points = vPoints();
  for (let i = 0; i < REGIONS.length; i++) {
    if (parseInt(REGIONS[i].stranding_zone) == 1) {
      let starsInThisRegion = STARS.filter((star) => {
        return star.region_id == REGIONS[i].id;
      });
      for (let k = 0; k < starsInThisRegion.length; k++) {
        points[[starsInThisRegion[k].id]].color = COLOR_SECTOR_STRANDINGZONE;
      }
    }
  }
  vDraw(points);
}
function vSectorsArea() {
  TIME = Date.now();
  let points = vStars(1),
    pixelData = CTX.getImageData(0, 0, CANVAS.width, CANVAS.height).data;
  drawAll();
  if (window.Worker) {
    if (!WORKER) {
      WORKER = new Worker(PATH_JS + 'worker.js');
    }
    WORKER.postMessage([C, points, pixelData, STARS]);
    return new Promise((resolve) => {
      WORKER.onmessage = function (e) {
        STARS = e.data;
        WORKER.terminate();
        let timeConsumption = (Date.now() - TIME) / 1000 + 's';
        WORKER = false;
        resolve(timeConsumption);
      };
    });
  } else {
    let promise = new Promise((resolve) => {
      for (let i = 0; i < pixelData.length; i++) {
        let data = pixelData.slice(i, i + 4);
        rgbaStr = `rgb(${data[0]},${data[1]},${data[2]})`;
        colorList[rgbaStr] = colorList[rgbaStr] ? colorList[rgbaStr] + 1 : 1;
      }
      for (let o = 0; o < STARS.length; o++) {
        STARS[o].color = rgbToHex_str(points[o].color);
        STARS[o].area = parseInt(colorList[points[o].color] / Math.pow(C, 2));
      }
      drawAll();
      let timeConsumption = (Date.now() - TIME) / 1000;
      resolve(timeConsumption);
    });
    return promise;
  }
}
function summary() {
  let editedAmount = 0,
    lackImgAmount = 0,
    onsaleAmount = 0,
    strandingZoneAmount = 0;
  STARS.forEach((star) => {
    editedAmount += parseInt(star.edited);
    if (parseInt(star.img) == 0) {
      lackImgAmount++;
    }
    if (parseInt(star.onsale)) {
      onsaleAmount++;
    }
  });
  REGIONS.forEach((item, index, regions) => {
    if (parseInt(item.stranding_zone) == 1) {
      let strandingStars = STARS.filter((ele) => {
        return ele.region_id == regions[index].id;
      });
      strandingZoneAmount += strandingStars.length;
    }
  });
  $('#starAmount').html(STARS.length);
  $('#regionAmount').html(REGIONS.length);
  $('#routeAmount').html(ROUTES.length);
  $('#strandingZoneAmount').html(strandingZoneAmount);
  $('#editedAmount').html(editedAmount);
  $('#unusedImageAmount').html(UNUSEDIMGAMOUNT);
  $('#lackImgAmount').html(lackImgAmount);
  $('#onsaleAmount').html(onsaleAmount);
  chart(TEXT_CELESCIAL_AMOUNT, TYPES, 'type', 'name_cn', 'bar');
}
function chart(_labelName, _content, _starObjectName, _contentObjectName = 'name_cn', _chartType = 'bar') {
  $('#summaryChart').remove();
  $('#chartContainer').append('<canvas id="summaryChart"></canvas>');
  let label = [],
    database = [],
    colorset = [];
  _content.forEach((item) => {
    label.push(item[_contentObjectName]);
    if (_starObjectName == 'faction_id') {
      colorset.push(item.color + 'cf');
    }
  });
  for (let i = 0; i < label.length; i++) {
    database[i] = 0;
    STARS.forEach((star) => {
      if (star[_starObjectName] == i + 1) {
        database[i]++;
      }
    });
  }
  for (let i = 0; i < database.length; i++) {
    if (database[i] == 0) {
      database.splice(i, 1);
      label.splice(i, 1);
      if (_starObjectName == 'faction_id') {
        colorset.splice(i, 1);
      }
      i--;
    }
  }
  if (_starObjectName != 'faction_id') {
    for (let i = 0; i < label.length; i++) {
      let color = `rgba(${randomInt(100, 120)},${randomInt(77, 80)},${randomInt(100, 200)},0.9)`;
      colorset.push(color);
    }
  }
  $(function () {
    chartTypes = new Chart(document.getElementById('summaryChart').getContext('2d'), {
      type: _chartType,
      data: {
        labels: label,
        datasets: [
          {
            label: _labelName,
            data: database,
            borderWidth: 0,
            backgroundColor: colorset,
          },
        ],
      },
      options: {
        onClick: (e) => {
          const canvasPosition = Chart.helpers.getRelativePosition(e, chartTypes);
          const dataX = chartTypes.scales.x.getValueForPixel(canvasPosition.x);
          const target = _content.find((item) => {
            return item[_contentObjectName] == label[dataX];
          });
          if (!CHARTOVERLAY) {
            $('#summaryModal').modal('hide');
            drawAll();
          }
          if (_starObjectName == 'faction_id') {
            vTheFaction(target.id, 1);
          } else {
            const hl = STARS.filter((star) => {
              return star[_starObjectName] == target.id;
            });
            drawStars(CANVASSTARCOLOR, hl, 1, 1, 3);
          }
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: _chartType !== 'pie',
            title: {
              display: true,
            },
          },
          y: {
            display: _chartType !== 'pie',
            title: {
              display: false,
              text: 'Value',
            },
          },
        },
      },
    });
  });
}
