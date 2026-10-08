/* The Master Cookbook — app */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const app = $('#app');

const ICON = {
  clock: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6l4.2 2.5-.8 1.3L11 13.5V7h2v5.6z" fill="currentColor"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M18 16.1a3 3 0 0 0-2.2 1L8.9 12.7a3.3 3.3 0 0 0 0-1.4l6.9-4.4A3 3 0 1 0 15 5c.3 0 .7.1 1 .2L8.6 9.9a3 3 0 0 0 0 4.2l7.4 4.7c-.3.1-.7.2-1 .2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" fill="currentColor"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z" fill="currentColor"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" fill="currentColor"/></svg>',
  chef: '<svg viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 9c0 2.4 1.2 4.2 2.7 5.7L12 22l4.3-7.3C17.8 13.2 19 11.4 19 9c0-4-3-7-7-7z" fill="currentColor"/></svg>'
};

const state = { q:'', cat:null, time:'all', maxMains:99, sort:'featured' };
const bySlug = {};
RECIPES.forEach(r => bySlug[r.slug] = r);
const CATS = [...new Set(RECIPES.map(r => r.category))].sort();
const MAXMAINS = Math.max(...RECIPES.map(r => r.mains));

function fmtTime(t){ return t == null ? '—' : (t >= 60 ? Math.round(t/60*10)/10 + ' hr' : t + ' min'); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function filtered(){
  let list = RECIPES.filter(r => {
    if (state.cat && r.category !== state.cat) return false;
    if (state.q){
      const q = state.q.toLowerCase();
      const hay = (r.title + ' ' + (r.description||'') + ' ' + r.ingredients.join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.time === 'u30' && !(r.timeMin != null && r.timeMin < 30)) return false;
    if (state.time === '3060' && !(r.timeMin != null && r.timeMin >= 30 && r.timeMin <= 60)) return false;
    if (state.time === 'o60' && !(r.timeMin != null && r.timeMin > 60)) return false;
    if (r.mains > state.maxMains) return false;
    if (r.stub && state.maxMains < MAXMAINS) return false;
    return true;
  });
  if (state.sort === 'time') list.sort((a,b) => (a.timeMin==null?1e9:a.timeMin) - (b.timeMin==null?1e9:b.timeMin));
  else if (state.sort === 'az') list.sort((a,b) => a.title.localeCompare(b.title));
  else if (state.sort === 'few') list.sort((a,b) => a.mains - b.mains);
  return list;
}

function cardHTML(r){
  const meta = r.stub
    ? `<span class="meta"><span>Full recipe at the source</span></span>`
    : `<span class="meta">
        <span>${ICON.clock}${fmtTime(r.timeMin)}</span>
        <span>${ICON.list}${r.mains} ingredients</span>
      </span>`;
  return `<button class="card" data-slug="${r.slug}">
    <span class="ph"><img src="${esc(r.photo)}" alt="${esc(r.title)}" loading="lazy"></span>
    <span class="body">
      <span class="tag">${esc(r.category)}</span>
      <h3>${esc(r.title)}</h3>
      ${meta}
    </span>
  </button>`;
}

function homeHTML(){
  const list = filtered();
  const catCards = CATS.map(c => {
    const inCat = RECIPES.filter(r => r.category === c);
    const img = inCat[0].photo;
    return `<button class="cat-card" data-cat="${esc(c)}">
      <img src="${esc(img)}" alt="" loading="lazy"><span class="scrim"></span>
      <span class="label"><b>${esc(c)}</b><span>${inCat.length} recipes</span></span>
    </button>`;
  }).join('');
  const chips = ['<button class="chip" data-tcat="" aria-pressed="'+(state.cat===null)+'">All</button>']
    .concat(CATS.map(c => `<button class="chip" data-tcat="${esc(c)}" aria-pressed="${state.cat===c}">${esc(c)}</button>`)).join('');
  const sliderLabel = state.maxMains >= MAXMAINS ? 'Any number' : '≤ ' + state.maxMains;
  return `
  <section class="hero">
    <div class="kicker">From-scratch · ${RECIPES.length} recipes</div>
    <h1>Real food, <em>made simple.</em></h1>
    <p>Every recipe from your favorite creators in one beautiful book — filter by craving, cook time, or how many ingredients you feel like dealing with.</p>
  </section>
  <h2 class="section-title">Browse by craving <span class="count">${RECIPES.length} recipes</span></h2>
  <div class="cat-grid">${catCards}</div>
  <div class="filterbar">
    <div class="filter-row">
      <button class="chip" data-time="all" aria-pressed="${state.time==='all'}">Any time</button>
      <button class="chip" data-time="u30" aria-pressed="${state.time==='u30'}">Under 30 min</button>
      <button class="chip" data-time="3060" aria-pressed="${state.time==='3060'}">30–60 min</button>
      <button class="chip" data-time="o60" aria-pressed="${state.time==='o60'}">Over 60 min</button>
      <span class="slider-wrap">
        <label for="mains">Ingredients</label>
        <input type="range" id="mains" min="3" max="${MAXMAINS}" value="${state.maxMains}" step="1" aria-label="Maximum main ingredients">
        <output id="mainsOut">${sliderLabel}</output>
      </span>
      <select class="sortsel" id="sort" aria-label="Sort recipes">
        <option value="featured" ${state.sort==='featured'?'selected':''}>Featured</option>
        <option value="time" ${state.sort==='time'?'selected':''}>Quickest first</option>
        <option value="few" ${state.sort==='few'?'selected':''}>Fewest ingredients</option>
        <option value="az" ${state.sort==='az'?'selected':''}>A–Z</option>
      </select>
    </div>
    <div class="filter-row" style="margin-top:10px">${chips}</div>
  </div>
  <p class="result-count">${list.length} recipe${list.length===1?'':'s'}${state.cat?` in <b>${esc(state.cat)}</b>`:''}</p>
  <div class="grid">${list.map(cardHTML).join('') || `<div class="empty"><h3>Nothing on the menu</h3><p>Try loosening a filter or two.</p></div>`}</div>`;
}

function recipeHTML(r){
  if (r.stub){
    return `
    <button class="backbtn" data-back>${ICON.back}All recipes</button>
    <div class="recipe-hero"><img src="${esc(r.photo)}" alt="${esc(r.title)}"></div>
    <div class="recipe-head">
      <div class="tag">${esc(r.category)}</div>
      <h1>${esc(r.title)}</h1>
      <p class="byline">by <b>${esc(r.creatorName)}</b></p>
      <div class="recipe-notes"><b>From the creator's kitchen</b>Brentley shares the full version of this recipe — ingredients, steps, and all — on his Substack. Tap below to get it straight from the source.</div>
      <div class="srcrow">
        <a class="srclink" href="${esc(r.source)}" target="_blank" rel="noopener">${ICON.ext}Get the full recipe on Substack</a>
      </div>
      <button class="sharebtn" id="shareBtn">${ICON.share}Share this recipe</button>
      ${r.photoCredit ? `<p class="photo-credit">Photo: ${esc(r.photoCredit)}</p>` : ''}
    </div>`;
  }
  const ings = r.ingredients.map(i =>
    `<li class="${i.season?'season':''}">${esc(i.text)}</li>`).join('');
  const steps = r.steps.map(s => `<li>${esc(s)}</li>`).join('');
  return `
  <button class="backbtn" data-back>${ICON.back}All recipes</button>
  <div class="recipe-hero"><img src="${esc(r.photo)}" alt="${esc(r.title)}"></div>
  <div class="recipe-head">
    <div class="tag">${esc(r.category)}</div>
    <h1>${esc(r.title)}</h1>
    <p class="byline">by <b>${esc(r.creatorName)}</b>${r.description ? ' — ' + esc(r.description) : ''}</p>
    <div class="stat-row">
      <span class="stat">${ICON.clock}<span><b>${fmtTime(r.timeMin)}</b> total</span></span>
      <span class="stat">${ICON.list}<span><b>${r.mains}</b> main ingredients</span></span>
      <span class="stat">${ICON.chef}<span>Serves up <b>real food</b></span></span>
    </div>
    <button class="sharebtn" id="shareBtn">${ICON.share}Share this recipe</button>
    <div class="recipe-cols">
      <div><h2>Ingredients</h2><ul class="ing-list">${ings}</ul></div>
      <div><h2>Method</h2><ol class="step-list">${steps}</ol>
        ${r.notes ? `<div class="recipe-notes"><b>Good to know</b>${esc(r.notes)}</div>` : ''}
      </div>
    </div>
    <div class="srcrow">
      <a class="srclink" href="${esc(r.source)}" target="_blank" rel="noopener">${ICON.ext}View original by ${esc(r.creatorName)}</a>
    </div>
    ${r.photoCredit ? `<p class="photo-credit">Photo: ${esc(r.photoCredit)}</p>` : ''}
  </div>`;
}

function render(){
  const params = new URLSearchParams(location.search);
  const slug = params.get('recipe');
  if (slug && bySlug[slug]){
    document.title = bySlug[slug].title + ' — The Master Cookbook';
    app.innerHTML = recipeHTML(bySlug[slug]);
    window.scrollTo(0,0);
    bindRecipe();
  } else {
    document.title = 'The Master Cookbook';
    app.innerHTML = homeHTML();
    window.scrollTo(0,0);
    bindHome();
  }
}

function go(url){ history.pushState({}, '', url); render(); }

function bindHome(){
  app.querySelectorAll('[data-slug]').forEach(el =>
    el.addEventListener('click', () => go('?recipe=' + el.dataset.slug)));
  app.querySelectorAll('[data-cat]').forEach(el =>
    el.addEventListener('click', () => { state.cat = el.dataset.cat; render(); }));
  app.querySelectorAll('[data-tcat]').forEach(el =>
    el.addEventListener('click', () => { state.cat = el.dataset.tcat || null; render(); }));
  app.querySelectorAll('[data-time]').forEach(el =>
    el.addEventListener('click', () => { state.time = el.dataset.time; render(); }));
  const slider = $('#mains');
  slider.addEventListener('input', () => {
    state.maxMains = parseInt(slider.value, 10);
    $('#mainsOut').textContent = state.maxMains >= MAXMAINS ? 'Any number' : '≤ ' + state.maxMains;
    clearTimeout(slider._t);
    slider._t = setTimeout(render, 250);
  });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
}

function bindRecipe(){
  app.querySelector('[data-back]').addEventListener('click', () => go('./'));
  $('#shareBtn').addEventListener('click', async () => {
    const url = location.href;
    const title = document.title;
    if (navigator.share){
      try { await navigator.share({ title, url }); } catch(e){}
    } else {
      try { await navigator.clipboard.writeText(url); toast('Link copied'); }
      catch(e){ toast('Copy this link: ' + url); }
    }
  });
}

function toast(msg){
  let t = document.querySelector('.toast');
  if (!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

window.addEventListener('popstate', render);
$('#q').addEventListener('input', e => {
  state.q = e.target.value;
  clearTimeout($('#q')._t);
  $('#q')._t = setTimeout(() => {
    if (new URLSearchParams(location.search).get('recipe')) go('./');
    else render();
  }, 300);
});
document.querySelector('[data-nav]').addEventListener('click', e => {
  e.preventDefault(); state.q=''; state.cat=null; state.time='all'; state.maxMains=MAXMAINS; state.sort='featured';
  $('#q').value=''; go('./');
});

render();
})();
