/* One set of native captures serves the tour and the product documentation. */
export const PRODUCT_CAPTURES = {
 browser:{file:'nus-browser-find.png',width:2208,height:1434,alt:'The working Hello World page in the native nus browser, with its address row and Find bar searching for Hello. The page match is highlighted and the counter reads count is 1.',caption:'Find in the live page, with the browser controls in reach.'},
 workspace:{file:'nus-workspace-page.png',width:2240,height:1520,alt:'The working Hello World browser page occupies most of a native nus window, beside a narrow terminal running its development server. The native window topbar is retained.',caption:'Give the page room; keep its running server beside it.'},
 editor:{file:'nus-source-page.png',width:2208,height:1434,alt:'The native nus editor shows the complete main.js counter source beside its working Hello World browser page. The file tab and browser address row remain visible; the window topbar is omitted.',caption:'The source and its working page, side by side.'},
 kept:{file:'nus-kept-pages.png',width:2208,height:790,alt:'The native nus Kept collection lists the saved Hello World page, with its title, localhost address and actions to open or manage the bookmark.',caption:'A saved page, ready to find and open again.'},
 home:{file:'nus-home-links.png',width:2105,height:1246,alt:'The nus Home prompt with a saved Hello World link first, saved project commands, the Hello World project and a resumable session.',caption:'The page, project commands and a session to return to.'},
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
