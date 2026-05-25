const API_BASE_URL = "https://dark-pine-957e.oqosfyqziob.workers.dev";
const STORAGE_KEY = "dwait_plans_v1";
const PARK_QUERY_MAP = { ランド: "land", シー: "sea", すべて: "all" };
const priorityScore = { 高: 3, 中: 2, 低: 1 };
const priorityClassMap = { 高: "priority-high", 中: "priority-mid", 低: "priority-low" };

const ATTRACTION_META = {
  "プーさんのハニーハント": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, gapFriendly: true, estimatedDurationMin: 12, thrillLevel: "低", priority: "高" },
  "モンスターズ・インク ライド＆ゴーシーク！": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, gapFriendly: true, estimatedDurationMin: 10, thrillLevel: "低", priority: "高" },
  "ジャングルクルーズ": { childFriendly: true, indoor: false, relaxing: true, shortExperience: true, gapFriendly: true, estimatedDurationMin: 10, thrillLevel: "低", priority: "中" },
  "ホーンテッドマンション": { childFriendly: false, indoor: true, relaxing: false, shortExperience: true, gapFriendly: true, estimatedDurationMin: 13, thrillLevel: "中", priority: "中" },
  "ビッグサンダー・マウンテン": { childFriendly: false, indoor: false, relaxing: false, shortExperience: false, gapFriendly: false, estimatedDurationMin: 18, thrillLevel: "高", priority: "高" },
  "ジャンピン・ジェリーフィッシュ": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, gapFriendly: true, estimatedDurationMin: 8, thrillLevel: "低", priority: "低" },
  "ニモ＆フレンズ・シーライダー": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, gapFriendly: true, estimatedDurationMin: 11, thrillLevel: "低", priority: "中" }
};

const MODE_CONFIG = {
  normal: { label: "通常", w: { wait: 30, open: 24, priority: 12, child: 10, indoor: 8, relax: 8, short: 8, gap: 8, thrillPenalty: -7 } },
  family: { label: "子連れ", w: { wait: 18, open: 18, priority: 8, child: 24, indoor: 14, relax: 14, short: 12, gap: 10, thrillPenalty: -20 } },
  efficient: { label: "効率重視", w: { wait: 45, open: 25, priority: 14, child: 4, indoor: 4, relax: 2, short: 18, gap: 8, thrillPenalty: -4 } },
  relax: { label: "休憩向き", w: { wait: 16, open: 16, priority: 8, child: 10, indoor: 24, relax: 24, short: 10, gap: 10, thrillPenalty: -10 } },
  gap: { label: "すき間時間", w: { wait: 30, open: 18, priority: 8, child: 8, indoor: 14, relax: 12, short: 18, gap: 24, thrillPenalty: -12 } }
};

const el = (id) => document.getElementById(id);
const listElement = el("attractionList"), recommendText = el("recommendText"), recommendReasons = el("recommendReasons");
const countText = el("countText"), currentState = el("currentState"), dataNotice = el("dataNotice"), lastUpdated = el("lastUpdated"), loadingState = el("loadingState"), closureNotice = el("closureNotice"), modeHint = el("modeHint");
const scheduleForm = el("scheduleForm"), scheduleList = el("scheduleList"), nextPlanCard = el("nextPlanCard");

const parkButtons = document.querySelectorAll("[data-park-filter]");
const sortButtons = document.querySelectorAll("[data-sort]");
const modeButtons = document.querySelectorAll("[data-mode]");

let currentFilter = "すべて", currentSort = "recommended", currentMode = "normal", liveAttractions = [], plans = [];

const formatTime = (d) => new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(d);
const resolveStatus = (ride) => ride.is_open === false ? "休止中" : ride.is_open === true && typeof ride.wait_time === "number" ? "稼働中" : "案内なし";
const resolveWaitText = (item) => typeof item.wait === "number" ? `${item.wait}分` : item.status === "休止中" ? "休止中" : "案内なし";
const inferPriority = (wait) => wait == null ? "低" : wait >= 60 ? "高" : wait >= 30 ? "中" : "低";

function getMeta(name) {
  return ATTRACTION_META[name] || { childFriendly: true, indoor: false, relaxing: false, shortExperience: false, gapFriendly: false, estimatedDurationMin: 15, thrillLevel: "中", priority: "中" };
}

function normalizeRide(ride, parkName) {
  const wait = typeof ride.wait_time === "number" ? ride.wait_time : null;
  const name = (ride.nameJa && ride.nameJa.length) ? ride.nameJa : ride.englishName || ride.name || "名称未登録";
  const meta = getMeta(name);
  return { park: parkName, area: ride.land || "エリア情報なし", name, wait, status: resolveStatus(ride), priority: meta.priority || inferPriority(wait), ...meta };
}

function getMinutesToNextPlan() {
  const now = new Date();
  const next = plans.find((p) => {
    const t = new Date(); const [h,m] = p.time.split(":").map(Number); t.setHours(h,m,0,0);
    return t >= now;
  });
  if (!next) return { next: null, minutes: null };
  const t = new Date(); const [h,m] = next.time.split(":").map(Number); t.setHours(h,m,0,0);
  return { next, minutes: Math.max(0, Math.floor((t - now)/60000)) };
}

function computeScore(item) {
  const m = MODE_CONFIG[currentMode].w;
  if (item.status === "休止中") return -999;
  const waitScore = typeof item.wait === "number" ? Math.max(0, 1 - item.wait / 120) : 0.05;
  let s = waitScore * m.wait + (item.status === "稼働中" ? 1 : 0.2) * m.open + (priorityScore[item.priority] / 3) * m.priority;
  s += (item.childFriendly ? 1 : 0) * m.child + (item.indoor ? 1 : 0) * m.indoor + (item.relaxing ? 1 : 0) * m.relax + (item.shortExperience ? 1 : 0) * m.short + (item.gapFriendly ? 1 : 0) * m.gap;
  if ((currentMode === "family" || currentMode === "gap") && item.thrillLevel === "高") s += m.thrillPenalty;
  const { minutes } = getMinutesToNextPlan();
  if (minutes != null) {
    const need = (item.wait ?? 20) + (item.estimatedDurationMin ?? 15);
    s += need <= minutes ? 12 : -18;
  }
  if (item.status === "案内なし") s -= 8;
  return s;
}

const applySort = (items) => currentSort === "wait" ? [...items].sort((a,b)=>(a.wait??999)-(b.wait??999)) : [...items].sort((a,b)=>computeScore(b)-computeScore(a));
const getDisplayItems = () => applySort(currentFilter === "すべて" ? liveAttractions : liveAttractions.filter((x)=>x.park===currentFilter));

function reasons(item) {
  const arr = [];
  if (typeof item.wait === "number" && item.wait <= 25) arr.push("待ち時間短め");
  if (item.childFriendly) arr.push("子連れ向き"); if (item.indoor) arr.push("屋内"); if (item.relaxing) arr.push("休憩向き"); if (item.gapFriendly) arr.push("すき間時間向き"); if (item.status === "稼働中") arr.push("稼働中");
  const { minutes } = getMinutesToNextPlan();
  if (minutes != null && ((item.wait ?? 20)+(item.estimatedDurationMin??15) <= minutes)) arr.push("次の予定までに行きやすい");
  return arr.slice(0,3);
}

function renderPlans() {
  const { next, minutes } = getMinutesToNextPlan();
  if (!plans.length) {
    nextPlanCard.textContent = "今日の予定は未登録です";
    scheduleList.innerHTML = "";
    return;
  }
  nextPlanCard.textContent = next ? `次の予定: ${next.time} ${next.title}（あと${minutes}分）` : "本日の予定はすべて終了しました。";
  scheduleList.innerHTML = plans.map((p,i)=>`<li class="schedule-item"><div><strong>${p.time} ${p.title}</strong><div class="schedule-main">${p.park} / ${p.category}${p.memo?` / ${p.memo}`:""}</div></div><button class="delete-button" data-delete-plan="${i}">削除</button></li>`).join("");
  scheduleList.querySelectorAll("[data-delete-plan]").forEach((b)=>b.addEventListener("click",()=>{ plans.splice(Number(b.dataset.deletePlan),1); savePlans(); render(); }));
}

function createCard(item){const waitText=resolveWaitText(item);const waitClass=item.status==="稼働中"?"wait-running":item.status==="休止中"?"wait-paused":"wait-unknown";const tags=[item.childFriendly&&"子連れ向け",item.indoor&&"屋内",item.relaxing&&"休憩向き",item.shortExperience&&"短時間",item.gapFriendly&&"すき間時間向き"].filter(Boolean);const card=document.createElement("article");card.className="card";card.innerHTML=`<div class="card-head"><div><h3>${item.name}</h3><p class="area">${item.park} ・ ${item.area}</p></div><span class="wait-time ${waitClass}">${waitText}</span></div><div class="meta-row"><span class="badge ${priorityClassMap[item.priority]}">優先度 ${item.priority}</span><span class="badge status-badge">${item.status}</span><span class="badge thrill-badge">スリル ${item.thrillLevel}</span>${tags.map((t)=>`<span class="badge feature-badge">${t}</span>`).join("")}</div>`;return card;}

function render(){
  const items=getDisplayItems(); listElement.innerHTML=""; items.forEach((i)=>listElement.appendChild(createCard(i)));
  currentState.textContent=`${currentFilter} / ${currentSort==="wait"?"待ち時間順":"おすすめ順"}`; modeHint.textContent=`モード: ${MODE_CONFIG[currentMode].label}`; countText.textContent=`${items.length}件`;
  renderPlans();
  const ranked = applySort(items.filter((x)=>x.status==="稼働中").length ? items.filter((x)=>x.status==="稼働中") : items);
  const top = ranked[0];
  if (!top) { recommendText.textContent = "現在は判断材料が少ないため、開園中に再確認してください。"; recommendReasons.innerHTML=""; return; }
  const weak = items.length && items.filter((x)=>x.status!=="稼働中").length/items.length>=0.8;
  if (weak) closureNotice.textContent = "現在は判断材料が少ないため、開園中に再確認してください。"; else closureNotice.textContent = "";
  recommendText.textContent = `${top.name}（${top.park}・${top.area} / ${resolveWaitText(top)}）`;
  recommendReasons.innerHTML = reasons(top).map((r)=>`<span class="badge reason-badge">${r}</span>`).join("");
}

function savePlans(){localStorage.setItem(STORAGE_KEY,JSON.stringify(plans));}
function loadPlans(){try{plans=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]").filter((p)=>p?.title&&p?.time);}catch{plans=[];}plans.sort((a,b)=>a.time.localeCompare(b.time));}

async function fetchWorkerData(parkName){
  const url=`${API_BASE_URL.replace(/\/$/,"")}/?park=${PARK_QUERY_MAP[parkName]||"all"}`;
  const response=await fetch(url,{cache:"no-store"}); if(!response.ok) throw new Error("http");
  const data=await response.json(); if(!Array.isArray(data?.rides)) throw new Error("shape");
  return { rides: data.rides.map((r)=>normalizeRide({ name:r.name,nameJa:r.nameJa,englishName:r.englishName,wait_time:r.wait_time,is_open:r.is_open,land:r.area }, r.park)), fetchedAt: data.fetchedAt || data.generated_at || null };
}

async function refreshData(){ loadingState.textContent="読み込み中…"; dataNotice.textContent="待ち時間データ取得中";
  try{const result=await fetchWorkerData(currentFilter); liveAttractions=result.rides; dataNotice.textContent="リアルタイム取得中"; lastUpdated.textContent=`${formatTime(result.fetchedAt?new Date(result.fetchedAt):new Date())}（API）`;}
  catch{dataNotice.textContent="取得失敗（画面再読み込みで再試行）"; lastUpdated.textContent=`${formatTime(new Date())}（失敗時刻）`; liveAttractions=[];}
  finally{loadingState.textContent=""; render();}
}

scheduleForm.addEventListener("submit", (e)=>{e.preventDefault();plans.push({title:el("planTitle").value.trim(),time:el("planTime").value,park:el("planPark").value,category:el("planCategory").value,memo:el("planMemo").value.trim()});plans.sort((a,b)=>a.time.localeCompare(b.time));savePlans();scheduleForm.reset();render();});
parkButtons.forEach((b)=>b.addEventListener("click", async()=>{currentFilter=b.dataset.parkFilter;parkButtons.forEach((x)=>x.classList.toggle("is-active",x===b));await refreshData();}));
sortButtons.forEach((b)=>b.addEventListener("click",()=>{currentSort=b.dataset.sort;sortButtons.forEach((x)=>x.classList.toggle("is-active",x===b));render();}));
modeButtons.forEach((b)=>b.addEventListener("click",()=>{currentMode=b.dataset.mode;modeButtons.forEach((x)=>x.classList.toggle("is-active",x===b));render();}));

loadPlans(); refreshData();
