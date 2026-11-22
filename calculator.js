const DRINKS = window.drinkiqConfig.drinks;
const counts=Object.fromEntries(DRINKS.map(d=>[d.id,0]));
function $(id){return document.getElementById(id);}
function pad(n){return String(n).padStart(2,"0");}
function toLocal(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;}
function getTotalGrams() {
  return DRINKS.reduce((total, drink) => total + counts[drink.id] * drink.grams, 0);
}
function hhMm(h){const m=Math.max(0,Math.round(h*60));return `${Math.floor(m/60)}h ${m%60}m`;}
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function showError(id, message) {
  const error = $(id);
  error.textContent = '⚠️ ' + message;
  error.hidden = false;
}
function showCalcError(message) { showError('calcError', message); }
function showTimeError(message) { showError('timeError', message); }

function updateDiscBtn(){const ok=$('discCheck1').checked&&$('discCheck2').checked&&$('discCheck3').checked;$('discAgreeBtn').classList.toggle('enabled',ok);}
function agreeDisclaimer(){if(!$('discCheck1').checked||!$('discCheck2').checked||!$('discCheck3').checked)return;localStorage.setItem('drinkiq_disclaimer','1');$('disclaimerOverlay').classList.add('hidden');}

// Initialize disclaimer on page load
window.addEventListener('DOMContentLoaded', function() {
  // Set up checkbox listeners
  ['discCheck1','discCheck2','discCheck3'].forEach(id=>$(id).addEventListener('change',updateDiscBtn));

  // Check if user already accepted
  if(localStorage.getItem('drinkiq_disclaimer')==='1'){
    $('disclaimerOverlay').classList.add('hidden');
  } else {
    $('disclaimerOverlay').classList.remove('hidden');
  }

  // Initialize button state
  updateDiscBtn();
});

function openTC(){$('tcOverlay').classList.remove('hidden');}
function closeTC(){$('tcOverlay').classList.add('hidden');}

let currentUser=readSessionUser();
let historyMigrationMessage='';
function readSessionUser(){
  const user=localStorage.getItem('drinkiq_session');
  return user&&Object.prototype.hasOwnProperty.call(getUsers(),user)?user:null;
}
function invalidateHistoryView(){
  $('historyOverlay').classList.add('hidden');
  $('historyList').replaceChildren();
  $('historyMigrationNote').textContent='';
  $('historyMigrationNote').hidden=true;
}
function syncSession(){
  const user=readSessionUser();
  if(user!==currentUser){
    currentUser=user;
    invalidateHistoryView();
    updateAuthUI();
  }
  return user;
}
function setSession(user){
  if(user===null)localStorage.removeItem('drinkiq_session');
  else localStorage.setItem('drinkiq_session',user);
  currentUser=readSessionUser();
  invalidateHistoryView();
  updateAuthUI();
}
window.addEventListener('storage',event=>{
  if(event.storageArea===localStorage&&(event.key===null||event.key==='drinkiq_session'||event.key==='drinkiq_users'))syncSession();
});
window.addEventListener('focus',syncSession);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncSession();});
function simpleHash(s){let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36);}
function getUsers(){try{return JSON.parse(localStorage.getItem('drinkiq_users')||'{}');}catch(e){return{};}}
function saveUsers(u){localStorage.setItem('drinkiq_users',JSON.stringify(u));}
function updateAuthUI() {
  $('userChip').hidden = !currentUser;
  $('userChipName').textContent = currentUser ?? '';
  $('authBtn').hidden = !!currentUser;
  $('logoutBtn').hidden = !currentUser;
  $('histBtn').hidden = !currentUser;
}
function openAuth(){$('authMsg').textContent='';$('authOverlay').classList.remove('hidden');}
function closeAuth(){$('authOverlay').classList.add('hidden');}
function switchTab(t){$('loginForm').hidden=t!=='login';$('registerForm').hidden=t!=='register';$('tabLogin').classList.toggle('active',t==='login');$('tabRegister').classList.toggle('active',t==='register');$('authMsg').textContent='';}
function doLogin(){const u=$('loginUser').value.trim().toLowerCase(),p=$('loginPass').value;if(!u||!p){setAuthMsg('Please fill in all fields.','err');return;}const users=getUsers();if(!users[u]){setAuthMsg('Username not found.','err');return;}if(users[u].passwordHash!==simpleHash(p)){setAuthMsg('Incorrect password.','err');return;}setSession(u);closeAuth();}
function doRegister(){const u=$('regUser').value.trim().toLowerCase(),p=$('regPass').value,p2=$('regPass2').value;if(!u||!p||!p2){setAuthMsg('Please fill in all fields.','err');return;}if(u.length<3){setAuthMsg('Username must be at least 3 characters.','err');return;}if(p.length<6){setAuthMsg('Password must be at least 6 characters.','err');return;}if(p!==p2){setAuthMsg('Passwords do not match.','err');return;}const users=getUsers();if(users[u]){setAuthMsg('Username already taken.','err');return;}migrateLegacyAnonymousHistory();users[u]={passwordHash:simpleHash(p),createdAt:Date.now(),historyVersion:2};saveUsers(users);setSession(u);closeAuth();}
function doLogout(){setSession(null);}
function setAuthMsg(msg,type){const el=$('authMsg');el.textContent=msg;el.className='auth-msg '+(type||'');}
updateAuthUI();

function historyKey(user){return user===null?'drinkiq:v2:hist:anonymous':`drinkiq:v2:hist:user:${encodeURIComponent(user)}`;}
function migrateHistoryKey(legacyKey,destination){
  // Imports never write the live key. A concurrent live save always takes priority.
  const imported=destination+':legacy-import';
  const raw=localStorage.getItem(legacyKey);
  if(raw===null||localStorage.getItem(destination)!==null||localStorage.getItem(imported)!==null)return;
  if(!Array.isArray(JSON.parse(raw)))throw new Error('Invalid legacy history');
  localStorage.setItem(imported,raw);
  // Retain the original as a recovery copy, including during concurrent migration.
}
function migrateLegacyAnonymousHistory(){
  try{
    const raw=localStorage.getItem('drinkiq_hist_guest');
    if(raw===null||localStorage.getItem(historyKey(null)+':legacy-import')===raw)return;
    if(Object.prototype.hasOwnProperty.call(getUsers(),'guest')){
      // The old key has no ownership metadata. Retain it and an isolated copy.
      const archive='drinkiq:v2:hist:legacy-guest';
      if(localStorage.getItem(archive)===null)localStorage.setItem(archive,raw);
    }else{
      migrateHistoryKey('drinkiq_hist_guest',historyKey(null));
    }
  }catch(error){historyMigrationMessage='Older history could not be migrated. Its original stored data has been kept.';}
}
function migrateHistory(user){
  historyMigrationMessage='';
  migrateLegacyAnonymousHistory();
  try{
    // New accounts must not claim orphaned legacy records with the same name.
    if(user!==null&&user!=='guest'&&getUsers()[user]?.historyVersion!==2)migrateHistoryKey(`drinkiq_hist_${user}`,historyKey(user));
    if(localStorage.getItem('drinkiq:v2:hist:legacy-guest')!==null){
      historyMigrationMessage='Older history used one shared key for anonymous use and the account named guest. It has been preserved separately and has not been assigned to either profile.';
    }
  }catch(error){historyMigrationMessage='Older history could not be migrated. Its original stored data has been kept.';}
}
function isStoredNumber(value) {
  return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))
    && Number.isFinite(Number(value));
}
function isHistoryEntry(entry) {
  return entry !== null && typeof entry === 'object' && !Array.isArray(entry)
    && isStoredNumber(entry.ts) && Number.isFinite(new Date(Number(entry.ts)).getTime())
    && isStoredNumber(entry.bac) && Number(entry.bac) >= 0
    && isStoredNumber(entry.weight) && Number(entry.weight) > 0
    && ['soberBy', 'drinks', 'sex'].every(field => typeof entry[field] === 'string');
}
function getHistory(){
  const user=syncSession();
  migrateHistory(user);
  try{
    const key=historyKey(user);
    const raw=localStorage.getItem(key)??localStorage.getItem(key+':legacy-import')??'[]';
    const history=JSON.parse(raw);
    if (!Array.isArray(history)) return [];
    const valid = history.filter(isHistoryEntry);
    if (valid.length !== history.length && !historyMigrationMessage) {
      historyMigrationMessage = 'Some saved entries could not be displayed.';
    }
    return valid;
  }catch(error){return[];}
}
function saveHistory(history,expectedUser=currentUser){
  if(syncSession()!==expectedUser)return false;
  localStorage.setItem(historyKey(expectedUser),JSON.stringify(history.slice(0,20)));
  return true;
}
function addToHistory(e){const user=syncSession(),h=getHistory();if(currentUser!==user)return;h.unshift({...e,ts:Date.now()});saveHistory(h,user);}
function openHistory(){syncSession();renderHistory();$('historyMigrationNote').textContent=historyMigrationMessage;$('historyMigrationNote').hidden=!historyMigrationMessage;$('historyOverlay').classList.remove('hidden');}
function closeHistory(){$('historyOverlay').classList.add('hidden');}
function renderHistory() {
  const list = $('historyList');
  const history = getHistory();
  if (!history.length) {
    list.replaceChildren(makeElement('div', 'hist-empty', 'No calculations saved yet.'));
    return;
  }
  const { locale } = window.drinkiqCountry.current;
  list.replaceChildren(...history.slice(0, 20).map(entry => {
    const timestamp = new Date(Number(entry.ts)).toLocaleString(locale, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const item = makeElement('div', 'hist-item');
    const row = makeElement('div', 'hist-row');
    row.append(makeElement('div', 'hist-sober', entry.soberBy),
      makeElement('div', 'hist-bac', `BAC ~${Number(entry.bac).toFixed(3)}%`));
    item.append(makeElement('div', 'hist-date', timestamp), row,
      makeElement('div', 'hist-details', `${entry.drinks} · ${entry.weight} kg · ${entry.sex}`));
    return item;
  }));
}
function clearHistory(){
  const user=syncSession();
  const imported=historyKey(user)+':legacy-import';
  let legacy=null;
  if(user===null){
    const raw=localStorage.getItem('drinkiq_hist_guest');
    if(!Object.prototype.hasOwnProperty.call(getUsers(),'guest')||(raw!==null&&localStorage.getItem(imported)===raw))legacy='drinkiq_hist_guest';
  }else if(user!=='guest'&&getUsers()[user]?.historyVersion!==2){
    legacy=`drinkiq_hist_${user}`;
  }
  const legacyValue=legacy===null?null:localStorage.getItem(legacy);
  if(!confirm('Clear all history?'))return;
  // A session may change in another tab while the confirmation is open.
  if(syncSession()!==user)return;
  // Keep an empty v2 record so a retained legacy copy cannot reappear.
  if(saveHistory([],user)){
    localStorage.removeItem(imported);
    if(legacy!==null&&localStorage.getItem(legacy)===legacyValue)localStorage.removeItem(legacy);
    renderHistory();
    $('historyMigrationNote').textContent=historyMigrationMessage;
    $('historyMigrationNote').hidden=!historyMigrationMessage;
  }
}

function drinkName(drink) {
  const { units, locale } = window.drinkiqCountry.current;
  const volume = (drink.ml / units.mlPerUnit).toLocaleString(locale, { maximumFractionDigits: 2 });
  return `${drink.label} (${volume} ${units.volume})`;
}

function renderDrinks() {
  const box = $('drinksList');
  const { presets } = window.drinkiqCountry.current;
  const visible = DRINKS.filter(drink => presets.includes(drink.id) || counts[drink.id] > 0);
  box.replaceChildren();
  let lastGroup;
  for (const drink of visible) {
    if (drink.group !== lastGroup) {
      const heading = document.createElement('div');
      heading.className = 'drinks-group-title';
      heading.textContent = drink.group;
      box.append(heading);
      lastGroup = drink.group;
    }
    const name = drinkName(drink);
    const row = document.createElement('div');
    row.className = 'drink';
    row.classList.toggle('active', counts[drink.id] > 0);
    row.setAttribute('role', 'listitem');
    const details = document.createElement('div');
    const title = makeElement('div', 'drink-name', name);
    title.id = `drink-name-${drink.id}`;
    details.append(title, makeElement('div', 'drink-meta', `~${drink.abv}% ABV`));
    const stepper = makeElement('div', 'stepper');
    const minus = makeElement('button', 'btn minus', '-');
    const plus = makeElement('button', 'btn plus', '+');
    const count = makeElement('div', 'count', counts[drink.id]);
    minus.setAttribute('aria-label', 'Decrease quantity');
    minus.setAttribute('aria-describedby', title.id);
    plus.setAttribute('aria-label', `Add ${name}`);
    stepper.append(minus, count, plus);
    row.append(details, stepper);
    for (const [button, delta] of [[minus, -1], [plus, 1]]) {
      button.type = 'button';
      button.addEventListener('click', () => {
        const quantity = counts[drink.id] + delta;
        if (!Number.isSafeInteger(quantity) || quantity < 0) return;
        counts[drink.id] = quantity;
        count.textContent = counts[drink.id];
        row.classList.toggle('active', counts[drink.id] > 0);
      });
    }
    box.append(row);
  }
}

let displayedWeightUnit = 1;
let lastEstimate;

function applyCountry() {
  const { units } = window.drinkiqCountry.current;
  const input = $('weightKg');
  if (input.value !== '' && displayedWeightUnit !== units.kgPerUnit) {
    input.value = Number(input.value) * displayedWeightUnit / units.kgPerUnit;
  }
  displayedWeightUnit = units.kgPerUnit;
  $('weightLabel').textContent = `Weight (${units.weight})`;
  input.min = 30 / displayedWeightUnit;
  input.max = 220 / displayedWeightUnit;
  input.placeholder = units.weight === 'kg' ? 'e.g. 80' : 'e.g. 175';
  $('calcError').hidden = true;
  renderDrinks();
  if (lastEstimate) renderEstimate(lastEstimate);
  if (!$('historyOverlay').classList.contains('hidden')) renderHistory();
}

function drawChart(bacAtEnd,elimination,endDate){const theme=getComputedStyle(document.documentElement),token=name=>theme.getPropertyValue(name).trim();const canvas=$("bacCanvas"),ctx=canvas.getContext("2d");const dpr=window.devicePixelRatio||1,W=canvas.offsetWidth,H=160;canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);const totalH=Math.max(1,(bacAtEnd/elimination)+0.5),steps=120,maxBac=bacAtEnd>0?bacAtEnd:0.08;const pts=[];for(let i=0;i<=steps;i++){const h=(i/steps)*totalH;pts.push([h/totalH,Math.max(0,bacAtEnd-h*elimination)]);}const pL=6,pR=6,pT=16,pB=16,cW=W-pL-pR,cH=H-pT-pB;ctx.strokeStyle=token("--chart-grid");ctx.lineWidth=1;[.25,.5,.75,1].forEach(f=>{const y=pT+cH*(1-f);ctx.beginPath();ctx.moveTo(pL,y);ctx.lineTo(W-pR,y);ctx.stroke();});const grad=ctx.createLinearGradient(0,pT,0,pT+cH);grad.addColorStop(0,token("--chart-fill"));grad.addColorStop(1,token("--chart-fill"));ctx.beginPath();pts.forEach(([xF,b],i)=>{const x=pL+xF*cW,y=pT+cH*(1-Math.min(1,b/maxBac));i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.lineTo(W-pR,pT+cH);ctx.lineTo(pL,pT+cH);ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.beginPath();ctx.strokeStyle=token("--chart-line");ctx.lineWidth=3;ctx.lineJoin="round";ctx.lineCap="round";ctx.shadowColor=token("--chart-line");ctx.shadowBlur=0;pts.forEach(([xF,b],i)=>{const x=pL+xF*cW,y=pT+cH*(1-Math.min(1,b/maxBac));i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.shadowBlur=0;const labels=[];for(let i=0;i<=4;i++){const t=new Date(endDate.getTime()+(i/4)*totalH*3600000);labels.push(`${pad(t.getHours())}:${pad(t.getMinutes())}`);}$("chartAxis").replaceChildren(...labels.map(label => makeElement("span", "", label)));}

function clearEstimate() {
  lastEstimate = undefined;
  $('soberByText').textContent = 'Enter details, then tap Calculate.';
  for (const id of ['bacText', 'gramsText', 'rateText', 'untilText', 'soberAtText']) {
    $(id).textContent = '?';
  }
  $('driveBanner').hidden = true;
  $('chartWrap').hidden = true;
  $('calcError').hidden = true;
  $('timeError').hidden = true;
}

function clearanceTime({ bacAtEnd, zeroAt }) {
  return bacAtEnd === 0 ? 'Now' : zeroAt.toLocaleString(window.drinkiqCountry.current.locale, {
    weekday: 'short', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
  });
}

function renderEstimate(estimate) {
  const { bacAtEnd, end, elimination, grams, hoursUntil, pureMl } = estimate;
  const { alcoholMeasure, locale } = window.drinkiqCountry.current;
  const time = clearanceTime(estimate);
  $('gramsText').textContent = `~${grams.toFixed(1)} g`;
  if (alcoholMeasure) {
    const amount = alcoholMeasure.grams ? grams / alcoholMeasure.grams : pureMl / alcoholMeasure.ml;
    $('gramsText').textContent += ` ? ${amount.toLocaleString(locale, { maximumFractionDigits: 1 })} ${alcoholMeasure.label}`;
  }
  $('soberByText').textContent = bacAtEnd === 0 ? 'Estimated BAC is 0.00%' : `Est. 0.00% BAC by ${time}`;
  $('bacText').textContent = `~${bacAtEnd.toFixed(3)}% (estimate only)`;
  $('rateText').textContent = `${elimination.toFixed(3)}%/hr`;
  $('untilText').textContent = hhMm(hoursUntil);
  $('soberAtText').textContent = time;
  const banner = $('driveBanner');
  banner.className = 'drive-danger';
  banner.textContent = 'Do not drive after drinking. A BAC estimate cannot tell you when it is safe or legal to drive.';
  banner.hidden = false;
  $('chartWrap').hidden = bacAtEnd <= 0;
  if (bacAtEnd > 0) requestAnimationFrame(() => {
    if (lastEstimate === estimate) drawChart(bacAtEnd, elimination, end);
  });
}

function calculate() {
  clearEstimate();
  const input = $('weightKg');
  const displayWeight = Number(input.value);
  const { units, locale } = window.drinkiqCountry.current;
  if (!Number.isFinite(displayWeight) || displayWeight < Number(input.min) || displayWeight > Number(input.max)) {
    showCalcError(`Please enter a valid weight (${Number(input.min).toLocaleString(locale)} to ${Number(input.max).toLocaleString(locale)} ${units.weight}).`);
    return;
  }
  const weight = displayWeight * units.kgPerUnit;
  const r = Number($('sexR').value);
  if (r !== 0.68 && r !== 0.55) {
    showCalcError('Please select a valid biological sex option.');
    return;
  }
  if (!DRINKS.every(drink => Number.isSafeInteger(counts[drink.id]) && counts[drink.id] >= 0)) {
    showCalcError('Please reset and enter valid drink quantities.');
    return;
  }
  const elimination = $('slowMode').checked ? 0.012 : 0.015;
  const grams = getTotalGrams();
  if (!Number.isFinite(grams) || grams <= 0) {
    showCalcError('Please add at least one drink using the + buttons.');
    return;
  }
  const startStr = $('startTime').value;
  if (!startStr) {
    showTimeError('Please select a start time.');
    return;
  }
  const start = new Date(startStr);
  const still = $('stillDrinking').checked;
  if (!still && !$('endTime').value) {
    showTimeError('Please select an end time or tick Still drinking.');
    return;
  }
  const end = still ? new Date() : new Date($('endTime').value);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    showTimeError('Time format looks invalid.');
    return;
  }
  if (end.getTime() < start.getTime()) {
    showTimeError("End time can't be before start time.");
    return;
  }
  const hoursDrinking = (end.getTime() - start.getTime()) / 3600000;
  const bacPeak = (grams / (weight * 1000 * r)) * 100;
  const bacAtEnd = Math.max(0, bacPeak - hoursDrinking * elimination);
  const hoursUntil = bacAtEnd / elimination;
  const zeroAt = new Date(end.getTime() + hoursUntil * 3600000);
  if (!Number.isFinite(zeroAt.getTime())) {
    showCalcError('The estimate is outside the supported date range.');
    return;
  }
  const pureMl = DRINKS.reduce((total, drink) => total + counts[drink.id] * drink.ml * (drink.abv / 100), 0);
  lastEstimate = { bacAtEnd, end, elimination, grams, hoursUntil, zeroAt, pureMl };
  renderEstimate(lastEstimate);
  const drinks = DRINKS.filter(drink => counts[drink.id] > 0)
    .map(drink => `${counts[drink.id]} x ${drinkName(drink)}`).join(', ');
  addToHistory({
    soberBy: bacAtEnd === 0 ? 'Estimated BAC is 0.00%' : clearanceTime(lastEstimate),
    bac: bacAtEnd, weight, sex: r === 0.68 ? 'Male' : 'Female', drinks,
  });
}

function resetAll() {
  DRINKS.forEach(drink => { counts[drink.id] = 0; });
  renderDrinks();
  $('weightKg').value = '';
  $('sexR').value = '0.68';
  $('slowMode').checked = false;
  const now = new Date();
  $('startTime').value = toLocal(new Date(now.getTime() - 7200000));
  $('endTime').value = toLocal(now);
  $('stillDrinking').checked = false;
  $('endTimeBox').hidden = false;
  clearEstimate();
}

function toggleFaq(btn){const item=btn.closest('.faq-item');const isOpen=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!isOpen){item.classList.add('open');}btn.setAttribute('aria-expanded',item.classList.contains('open'));}

resetAll();
applyCountry();
window.addEventListener('drinkiq-country-change', applyCountry);
$("stillDrinking").addEventListener("change",e=>{$("endTimeBox").hidden=e.target.checked;});
window.addEventListener('resize', () => {
  if (lastEstimate?.bacAtEnd > 0) {
    const { bacAtEnd, elimination, end } = lastEstimate;
    drawChart(bacAtEnd, elimination, end);
  }
});

const actions = new Map(Object.entries({
  openTC, closeTC, agreeDisclaimer, openAuth, closeAuth, doLogin, doRegister, doLogout,
  openHistory, closeHistory, clearHistory, resetAll, calculate,
  showLogin: () => switchTab('login'),
  showRegister: () => switchTab('register'),
}));
document.querySelectorAll('[data-action]').forEach(button => {
  const action = actions.get(button.dataset.action);
  if (action) button.addEventListener('click', action);
});
document.querySelectorAll('.faq-q').forEach(button => {
  button.addEventListener('click', () => toggleFaq(button));
});
document.addEventListener('drinkiq:theme', () => {
  if (lastEstimate?.bacAtEnd > 0) {
    const { bacAtEnd, elimination, end } = lastEstimate;
    drawChart(bacAtEnd, elimination, end);
  }
});
