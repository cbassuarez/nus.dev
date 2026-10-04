/* One set of native captures serves the tour and the product documentation. */
export const PRODUCT_CAPTURES = {
 home:{file:'nus-home-project.png',width:2105,height:1246,alt:'The nus Home prompt with three saved commands and links, the Hello World project, and its resumable development server.',caption:'Hello World, with its saved commands and development server ready to return to.'},
 workspace:{file:'nus-hero-poster.png',width:2240,height:1520,alt:'The Hello World development server in a real nus terminal beside its working browser page, with the native nus topbar retained.',caption:'The running server and its working page, in the same window.'},
 editor:{file:'nus-editor-detail.png',width:1433,height:957,alt:'The real nus editor showing main.js, the seven lines that make the Hello World counter work. The file tab remains visible; the window topbar is omitted.',caption:'The main.js source behind the counter, in the native editor.'},
 history:{file:'nus-history-detail.png',width:1176,height:1208,alt:'The Hello World session in nus command history, with command search, actual output and the scrollable map at the right.',caption:'The commands, their output, and a map of the Hello World session.'},
 hatch:{file:'nus-hatch-project.png',width:1920,height:936,alt:'The real nus Hatch overview showing the Hello World development server running and its source check finished.',caption:'The development server is running; the project checks have finished.'}
};

export function productFigure(key,{prefix='../assets/films/',className='tour__shot',eager=false}={}) {
 const shot=PRODUCT_CAPTURES[key];
 if(!shot)throw new Error('Unknown product capture: '+key);
 return `<figure class="${className}"><a href="${prefix}${shot.file}" target="_blank" rel="noopener" aria-label="View the full-size ${key} capture"><img src="${prefix}${shot.file}" width="${shot.width}" height="${shot.height}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" alt="${shot.alt}"></a><figcaption>${shot.caption}</figcaption></figure>`;
}

export function applyProductCaptures(html) {
 return html.replace(/<p>\{\{capture:([a-z]+)\}\}<\/p>/g,(_,key)=>productFigure(key,{prefix:'../../assets/films/',className:'product-shot'}));
}
