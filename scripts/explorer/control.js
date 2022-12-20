/*                                            
 ___       ___  ___  ________   ________  ___  ___     
|\  \     |\  \|\  \|\   ___  \|\   ____\|\  \|\  \    
\ \  \    \ \  \\\  \ \  \\ \  \ \  \___|\ \  \\\  \   
 \ \  \    \ \  \\\  \ \  \\ \  \ \  \    \ \   __  \  
  \ \  \____\ \  \\\  \ \  \\ \  \ \  \____\ \  \ \  \ 
   \ \_______\ \_______\ \__\\ \__\ \_______\ \__\ \__\
    \|_______|\|_______|\|__| \|__|\|_______|\|__|\|__|
                                                        */
$(function () {
  $('.title').mousedown(function (e) {
    $(this).parent().parent().removeClass('blur');
    $(this).removeClass('color-title-bga').addClass('color-title-bg');
    $(this).prev().removeClass('color-leftCollapse-bga').addClass('color-leftCollapse-bg');
    $(this).parent().next().removeClass('color-info-bga').addClass('color-info-bg');
    const xO = parseInt($(this).parent().parent().css('left')) - e.clientX,
      yO = parseInt($(this).parent().parent().css('top')) - e.clientY;
    $(this)
      .on('mousemove', function (e) {
        const x = xO + e.clientX,
          y = yO + e.clientY;
        $(this).parent().parent().css({ left: x, top: y });
      })
      .mouseup(function () {
        $(this).off('mousemove');
        $(this).addClass('color-title-bga').removeClass('color-title-bg');
        $(this).parent().parent().addClass('blur');
        $(this).prev().addClass('color-leftCollapse-bga').removeClass('color-leftCollapse-bg');
        $(this).parent().next().addClass('color-info-bga').removeClass('color-info-bg');
      });
  });
  $('#starmap_control').mousemove((e) => {
    const xR = e.offsetX,
      yR = e.offsetY,
      x = Math.floor(xR / C),
      y = Math.floor(yR / C);
    planet = STARS.find((star) => {
      return star.x == x && star.y == y;
    });
    $('#currentPlanet').html(planet ? `${planet.name_cn} #${planet.id}` : `?`);
    $('#currentCoordinate').html(`(${x},${y}),raw(${xR},${yR})`);
    $('#starmap_control').mouseleave(() => {
      $('#currentPlanet,#currentCoordinate').html('--');
    });
  });
  $('#starmap_control').click((e) => {
    initializeInfoPanel();
    let x = Math.floor(e.offsetX / C),
      y = Math.floor(e.offsetY / C),
      xC = x * C,
      yC = y * C;
    let star = STARS.find((item) => {
      if (parseInt(item.x) === x && parseInt(item.y) === y) {
        return item;
      }
    });
    if (star) {
      $('#infoPanel').fadeIn(function () {
        $(this).removeClass('d-none').css({ display: 'flex' });
      });
      $('#showInfoPanel').addClass('btn-secondary').removeClass('btn-starmap').prop('disabled', true);
      locate(xC, yC);
      setInfo(star);
      return;
    } else {
      $('#infoPanel').fadeOut();
      $('#showInfoPanel').removeClass('btn-secondary').addClass('btn-starmap').prop('disabled', false);
    }
  });
  $('[data-toggle="tooltip"]').tooltip();
  $('#refresh').click(async () => {
    $('#refresh').children().addClass('rotateit');
    $('#refreshLogo').fadeIn(function () {
      $(this).removeClass('d-none').css({ display: 'flex' });
    });
    await ajax();
    drawAll();
    $('#refreshLogo').fadeOut(() => {
      $('#refresh').children().removeClass('rotateit');
    });
  });
  $('#leftCollapse').click(() => {
    $('#infoPanel').fadeOut();
    $('#showInfoPanel').removeClass('btn-secondary').addClass('btn-starmap').prop('disabled', false);
  });

  $('#showInfoPanel').click(() => {
    $('#infoPanel').fadeIn(function () {
      $(this).removeClass('d-none').css({ display: 'flex' });
    });
    $('#showInfoPanel').addClass('btn-secondary').removeClass('btn-starmap').prop('disabled', true);
  });
  $('#showRouteList').click(function () {
    if (!ROUTELISTOPENED) {
      $('.star-route-viewer').removeClass('d-none');
      $(this).html('<i class="fa-regular fa-circle-left"></i>');
      ROUTELISTOPENED = 1;
    } else {
      $('.star-route-viewer').addClass('d-none');
      $(this).html('<i class="fa-regular fa-circle-right"></i>');
      ROUTELISTOPENED = 0;
    }
  });
  $('#showRouteList-mobile').click(function () {
    if (!ROUTELISTOPENED) {
      $(this).html('<i class="fa-regular fa-circle-left"></i>');
      ROUTELISTOPENED = 1;
    } else {
      $(this).html('<i class="fa-regular fa-circle-right"></i>');
      ROUTELISTOPENED = 0;
    }
  });
  $('#submitNewRoute').click(function () {
    submitRoute();
  });
  $('#shuffleImg').click(() => {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    }
    const imgid = randomInt(0, PLANET_IMAGE_MAX),
      countImg = STARS.filter((item) => {
        return parseInt(item.img) == imgid;
      });
    $('#planet').html(`<img class='planetImg' src='${PATH_IMG_PLANETS + imgid}.png'/>`);
    $('#planet_img').val(imgid);
    $('#countImg').html(countImg.length);
  });

  $('#addBuff').click(() => {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    }
    const buffid = parseInt($('#buff').val());
    if (!buffid) {
      return;
    }
    let hasBuff = $('#planetInfo').attr('hasbuff'); //使用索引定位星球，而不是filter，可能会有id缺失时的映射风险
    if (hasBuff) {
      hasBuff = hasBuff.split(',');
      for (let i = 0; i < hasBuff.length; i++) {
        if (hasBuff[i] == buffid) {
          return;
        }
      }
    }
    $('#buffArea').append(
      `<span class='badge badge-primary m-1 badge-buff' buffid='${buffid}'>${BUFFS[buffid - 1].name_cn}</span>`
    );
    let newHasBuff = `${hasBuff ? hasBuff : ''},${buffid}`;
    if (newHasBuff.charAt(0) == ',') {
      newHasBuff = newHasBuff.substring(1);
    }
    $('#buffIdDisplay').html(newHasBuff);
    $('#planetInfo').attr({ hasbuff: newHasBuff });
  });

  $('#goToPlace').click(() => {
    const place = $('#search').val();
    $('#search').val(place);
    let star = STARS.find((item) => {
      return item.name_cn === place || item.name_en === place || item.name_tn === place;
    });
    if (!star) {
      $('#search').addClass('shakeit');
      setTimeout(() => {
        $('#search').removeClass('shakeit');
      }, 500);
      return;
    }
    initializeInfoPanel();
    setInfo(star);
  });
  $('#shuffle').click(() => {
    let placeid = randomInt(1, STARS.length),
      place = STARS[placeid].name_cn;
    $('#search').val(place);
    let star = STARS.find((item) => {
      return item.name_cn === place;
    });
    if (star) {
      initializeInfoPanel();
      setInfo(star);
    }
  });

  $('#submitChange').click(() => {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    } else if (!ISADMIN) {
      $('#alertModal').modal('show');
      return;
    }
    submitChange();
  });
  $(document).on('click', '.badge-buff', function () {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    }
    const buffid = parseInt($(this).attr('buffid'));
    let hasBuff = $('#planetInfo').attr('hasbuff').split(','),
      newHasBuff = '';
    for (let i = 0; i < hasBuff.length; i++) {
      if (hasBuff[i] == buffid) {
        hasBuff.splice(i, 1);
      }
      newHasBuff += ',' + hasBuff[i];
    }
    newHasBuff = newHasBuff.slice(1);
    $('#buffIdDisplay').html(newHasBuff);
    $('#planetInfo').attr({ hasbuff: newHasBuff });
    $(this).remove();
  });
  $(document).on('click', '.listed-route', function () {
    const starid = $(this).attr('starid');
    locate(STARS[starid].x * C, STARS[starid].y * C, 2);
    initializeInfoPanel();
    setInfo(STARS[starid]);
  });
  $(document).on('click', '.unused-img', function () {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    }
    const imgid = parseInt($(this).html());
    $('#planet').html(`<img class='planetImg' src='${PATH_IMG_PLANETS + imgid}.png'/>`);
    $('#planet_img').val(imgid);
    $('#countImg').html(0);
  });
  $('#locateAll').click(() => {
    const currentImg = $('#planet_img').val(),
      countImg = STARS.filter((item) => {
        return parseInt(item.img) == currentImg;
      });
    countImg.forEach((star) => {
      locate(star.x * C, star.y * C);
    });
  });
  $('#locateThis').click(function () {
    const target = parseInt($(this).attr('capitalid')),
      targetStar = STARS.find((item) => {
        return item.id == target;
      });
    locate(targetStar.x * C, targetStar.y * C);
  });

  $('#myPosition').click(() => {
    const starid = $('#planetInfo').attr('starid');
    if (!starid) {
      $('#search').addClass('shakeit');
      setTimeout(() => {
        $('#search').removeClass('shakeit');
      }, 500);
      return;
    }
    const x = STARS[starid].x,
      y = STARS[starid].y,
      xC = x * C,
      yC = y * C;
    locate(xC, yC);
  });
  $('#showConstellation').click(() => {
    vStars();
  });
  $('#showRegion,#chartRegion').click(() => {
    vRegion();
  });
  $('#showFaction').click(() => {
    vFaction();
  });
  $('#showRoutes,#chartRoute').click(() => {
    drawStarRoute(1);
  });
  $('#monotone').click(() => {
    drawStars();
  });
  $('#eraser').click(() => {
    CTX_MARKS.clearRect(0, 0, CANVAS_MARKS.width, CANVAS_MARKS.height);
  });
  $('#hlEdited,#chartEdited').click(() => {
    !OVERLAY ? drawAll() : '';
    const hl = STARS.filter((item) => {
      return item.edited != 0;
    });
    drawStars(COLOR_STAR_HIGHTLIGHTED, hl, 1, 0);
  });
  $('#lackImg,#chartLackImg').click(() => {
    !OVERLAY ? drawAll() : '';
    const countImg = STARS.filter((item) => {
      return parseInt(item.img) == 0;
    });
    drawStars(COLOR_STAR_LACKIMG, countImg, 1, 0);
  });
  $('#unusedImg').click(() => {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    } else if (!ISADMIN) {
      $('#alertModal').modal('show');
      return;
    }
    if (!UNUSEDIMGOPENED) {
      $('#unusedImgPanel').removeClass('d-none');
      UNUSEDIMGOPENED = 1;
    } else {
      $('#unusedImgPanel').addClass('d-none');
      UNUSEDIMGOPENED = 0;
    }
  });
  $('#joinWiKi').click(() => {
    window.location.href = PATH_WIKI_JOIN;
  });
  $('#logoutBtnConfirm').click(() => {
    $.post(`${PATH_SCRIPTS}logout.php`);
    location.reload();
  });
  $('#loginBtnConfirm').click(() => {
    const name = $('input[name=userName').val(),
      password = $('input[name=userPassword').val(),
      ifChecked = $('#checkMe').is(':checked');
    if (!password) {
      $('#passwordDescription').html(TEXT_ENTER_PASSWORD);
      return;
    }
    $.post(
      `${PATH_SCRIPTS}login.php`,
      {
        userName: name,
        userPassword: password,
        checkMe: ifChecked,
      },
      (data) => {
        if (data) {
          ISLOGIN = true;
          location.reload();
        } else {
          $('#passwordDescription').html(TEXT_WRONG_NAME_PASSWORD);
        }
      }
    );
  });
  $('#renderImage').click(() => {
    drawAll();
    vStars();
    vStars(1);
    vRegion(1);
    vRegion(1);
    vFaction(1);
    vFaction(1);
    vFaction(1);
    vFaction(1);
    drawStars(COLOR_STAR_WHITE);
    drawStarRoute(1, 2);
  });

  $('#downloadStarCSV').click(() => {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    }
    $('#CSVModal').modal('show');
  });
  $('#calculateNewStarmap').click(async function () {
    $('#timeConsumption').html(TEXT_LOADING_ICON);
    $(this).prop('disabled', true);
    const text = await vSectorsArea();
    if (!$('#CSVModal').hasClass('show')) {
      $('#CSVModal').modal('show');
    }
    $('#timeConsumption').html(TEXT_TIME_CONSUMPTION + text);
    $(this).prop('disabled', false);
  });

  $('#confirmDownloadCSV').click(() => {
    if (!ISLOGIN) {
      $('#userLogin').modal('show');
      return;
    }
    const starCSV = d3.csvFormat(STARS);
    createAndDownloadFile('stars.csv', starCSV);
  });

  $('#settings').on('show.bs.modal', () => {
    const range = cookie.get('scale') * 10 || 40;
    $('#scaleRange').val(range);
  });
  $('#changeScale').click(() => {
    const range = $('#scaleRange').val();
    cookie.set('scale', range / 10);
    drawChangeScale(range);
  });
  $('#showMeta').click(() => {
    const ifChecked = $('#showMeta').is(':checked');
    cookie.set('showMeta', ifChecked);
    if (!ifChecked) {
      $('#metaDataContainer').addClass('d-none');
    } else {
      $('#metaDataContainer').removeClass('d-none');
    }
  });
  $('#locateStyle').click(() => {
    const ifChecked = Number($('#locateStyle').is(':checked'));
    cookie.set('locateStyle', ifChecked);
    LOCATESTYLE = ifChecked;
  });
  $('#overlay').click(() => {
    const ifChecked = $('#overlay').is(':checked');
    cookie.set('overlay', ifChecked);
    OVERLAY = ifChecked;
  });
  $('#chartOverlay').click(() => {
    const ifChecked = $('#chartOverlay').is(':checked');
    cookie.set('chartOverlay', ifChecked);
    CHARTOVERLAY = ifChecked;
  });
  $('#neverWelcome').click(() => {
    const ifChecked = $('#neverWelcome').is(':checked');
    cookie.set('neverWelcome', ifChecked);
    NEVERWELCOME = ifChecked;
  });
  $('.radio-theme').on('click', function () {
    let selectedTheme = '',
      themeLink = $('#theme-link');
    if ($(this).prop('checked')) {
      selectedTheme = $(this).attr('theme');
      switch (selectedTheme) {
        case 'violet':
          themeLink.attr('href', PATH_CSS + 'explorer-theme-violet.css');
          break;
        case 'light':
          themeLink.attr('href', PATH_CSS + 'explorer-theme-light.css');
          break;
        case 'arctic':
          themeLink.attr('href', PATH_CSS + 'explorer-theme-arctic.css');
          break;
      }
      cookie.set('theme', selectedTheme);
    }
  });
  $('#about').click(() => {
    $('#settings').modal('hide');
    $('#aboutModal').modal('show');
  });
  $('#whatever').click(function () {
    override = 1;
    cookie.set('override', override);
    window.location.href = PATH_DESKTOP + '?override=' + override;
  });
  $('#itmatters').click(function () {
    override = 0;
    cookie.set('override', override);
    window.location.href = PATH_MOBILE + '?override=' + override;
  });
  $('#openSettings').click(() => {
    $('#aboutModal').modal('hide');
    $('#settings').modal('show');
  });
  $('#log').click(() => {
    $('#settings').modal('hide');
    $.get(PATH_LOG, (data) => {
      $('.log-modal-content').html(marked.parse(data));
    });
    $('#logModal').modal('show');
  });
  $('#logModal').on('hidden.bs.modal', () => {
    $('#settings').modal('show');
  });
  $('#editlogBtn').click(() => {
    $('#summaryModal').modal('hide');
    $.get(PATH_EDITLOG, (data) => {
      $('.editlog-modal-content').html(processGotEditlog(data));
    });
    $('#editlogModal').modal('show');
  });
  $('#editlogModal').on('hidden.bs.modal', () => {
    $('#summaryModal').modal('show');
  });

  $('#feedback').click(() => {
    window.location.href = PATH_FEEDBACK;
  });
  $('#chartBtnTypes').click(() => {
    chart(TEXT_CELESCIAL_AMOUNT, TYPES, 'type', 'name_cn');
  });
  $('#chartBtnAreas').click(() => {
    chart(TEXT_CELESCIAL_INCONTROL_AMOUNT, FACTIONS, 'faction_id', 'name_cn');
  });
  $('#chartStrandingZone').click(() => {
    vStrandingZone();
  });
  $('#wikiLink_strandingZone').click(() => {
    window.location.href = PATH_WIKI_STRANDING_ZONE;
  });
  $('#wikiLink_aroura').click(() => {
    window.location.href = PATH_WIKI_AROURA;
  });
});
