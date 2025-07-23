import '../config';

// https://www.trysmudford.com/blog/linear-interpolation-functions/
export const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
export const invlerp = (x: number, y: number, a: number) => clamp((a - x) / (y - x));

// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
// TODO: look into TinyColor: https://github.com/bgrins/TinyColor
//       https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
export const isDark = (bgColor) => {
    let rgb = bgColor.split( ',' );
    let r=parseInt( rgb[0].substring(4) ); // skip rgb(
    let g=parseInt( rgb[1] ); 
    let b=parseInt( rgb[2] ); // parseInt scraps trailing )
    // threshold of 122 seems to work better than original value of 186 for these palettes
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 122) ? false : true;
};

export const colormap = require('colormap');
export const colors_remain = colormap({
    colormap: global.config.colormap_colors_remain,
    nshades: 100,
    format: 'hex',
    alpha: 1
});
export const colors_ranks = colormap({
    colormap: global.config.colormap_colors_ranks,
    nshades: 100,
    format: 'hex',
    alpha: 1
});
