import {SITE, icon, nusMark, rel, soundControl} from '../layout.mjs';
import {REVIEW, money} from './data.mjs';
import {REVIEW_PAGES, reviewHref} from './manifest.mjs';
export const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function reviewShell(entry,release) {
  const r=rel(entry.depth);
  const links=(mobile=false)=>REVIEW_PAGES.map(p=>`<a href="${reviewHref(p.slug,entry.depth)}"${p.slug===entry.slug?' aria-current="page"':''}><span class="review-nav__n">${p.number}</span><span><b>${p.title}</b>${mobile?'':`<small>${p.blurb}</small>`}</span></a>`).join('');
  const status=escape(release?.tag_name||'Release not verified');
  const header=`<header class="reviewhead"><div class="reviewhead__in">
    <a class="mark" href="${reviewHref('',entry.depth)}" aria-label="nus review — overview">${nusMark}<span class="wordmark">nus</span></a>
    <span class="reviewhead__label cap">/ REVIEW</span>
    <div class="reviewhead__status cap"><span>${REVIEW.edition}</span><span>${status}</span><span>${money(REVIEW.request)} proposed</span></div>
    <nav class="reviewhead__exit" aria-label="Outside the review room"><a href="${SITE.repo}" aria-label="Application source">${icon('github-logo')}</a><a href="${r}/" aria-label="Exit to public site">${icon('arrow-right')}</a></nav>
    <div class="controls"><div class="signalpick" data-signalpick role="group" aria-label="Signal colour"></div>${soundControl()}<button class="iconbtn" type="button" data-theme-toggle data-cuelume-toggle="toggle" aria-label="Switch theme"><span data-sun hidden>${icon('sun')}</span><span data-moon>${icon('moon')}</span></button></div>
    </div><nav class="review-mobile" aria-label="Review pages">${links(true)}</nav></header>`;
  const footer=`<footer class="review-foot"><span>nus / REVIEW · ${REVIEW.date}</span><span>Unlisted, not confidential. <a href="${r}/">Public site ↗</a></span></footer>`;
  const rail=`<aside class="review__rail"><p class="cap">Review / ${REVIEW.edition}</p><nav class="review-nav" aria-label="Review room">${links()}</nav><div class="review__rail-end"><a href="${SITE.repo}">Source ↗</a><a href="${reviewHref('try',entry.depth)}">Download ↗</a><span>${status}</span></div></aside>`;
  const index=REVIEW_PAGES.indexOf(entry);
  const adjacent=[REVIEW_PAGES[index-1],REVIEW_PAGES[index+1]];
  const pager=`<nav class="review-pager" aria-label="Adjacent review pages">${adjacent.map((p,i)=>p?`<a href="${reviewHref(p.slug,entry.depth)}" data-review-nav><span class="cap">${i?'Next':'Previous'}</span><span>${i?'':'← '}${p.title}${i?' →':''}</span></a>`:'<span></span>').join('')}</nav>`;
  return {header,footer,rail,pager};
}
