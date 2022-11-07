/*                                            
 ___       ___  ___  ________   ________  ___  ___     
|\  \     |\  \|\  \|\   ___  \|\   ____\|\  \|\  \    
\ \  \    \ \  \\\  \ \  \\ \  \ \  \___|\ \  \\\  \   
 \ \  \    \ \  \\\  \ \  \\ \  \ \  \    \ \   __  \  
  \ \  \____\ \  \\\  \ \  \\ \  \ \  \____\ \  \ \  \ 
   \ \_______\ \_______\ \__\\ \__\ \_______\ \__\ \__\
    \|_______|\|_______|\|__| \|__|\|_______|\|__|\|__|
                                                        */
self.addEventListener(
  'message',
  (e) => {
    let c = e.data[0],
      points = e.data[1],
      pixelData = e.data[2],
      stars = e.data[3],
      rgbaStr = '',
      colorList = {};
    for (let i = 0; i < pixelData.length; i++) {
      let data = pixelData.slice(i, i + 4);
      rgbaStr = `rgb(${data[0]},${data[1]},${data[2]})`;
      colorList[rgbaStr] = colorList[rgbaStr] ? colorList[rgbaStr] + 1 : 1;
    }
    for (let o = 0; o < stars.length; o++) {
      stars[o].color = rgbToHex_str(points[o].color);
      stars[o].area = parseInt(colorList[points[o].color] / Math.pow(c, 2));
    }
    self.postMessage(stars);
    self.close();
  },
  false
);
function rgbToHex_str(rgbStr) {
  const arr = rgbStr.match(/\d+/g).map(Number),
    toHex = (num) => {
      const hex = num.toString(16);
      return hex.lenght === 1 ? `0${hex}` : hex;
    };
  return `#${toHex(arr[0])}${toHex(arr[1])}${toHex(arr[2])}`;
}
