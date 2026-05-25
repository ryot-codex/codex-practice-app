const API_BASE_URL = "https://dark-pine-957e.oqosfyqziob.workers.dev";

const SAMPLE_ATTRACTIONS = [
  { park: "ランド", area: "ファンタジーランド", name: "プーさんのハニーハント", wait: 45, priority: "高", childFriendly: true, status: "稼働中" },
  { park: "ランド", area: "ウエスタンランド", name: "ビッグサンダー・マウンテン", wait: 35, priority: "中", childFriendly: false, status: "稼働中" },
  { park: "ランド", area: "トゥモローランド", name: "モンスターズ・インク ライド＆ゴーシーク！", wait: 25, priority: "高", childFriendly: true, status: "稼働中" },
  { park: "ランド", area: "アドベンチャーランド", name: "ジャングルクルーズ", wait: 15, priority: "低", childFriendly: true, status: "稼働中" },
  { park: "ランド", area: "ファンタジーランド", name: "ホーンテッドマンション", wait: 20, priority: "中", childFriendly: false, status: "稼働中" },
  { park: "ランド", area: "トゥモローランド", name: "スペース・マウンテン", wait: 50, priority: "中", childFriendly: false, status: "運休/停止中" },
  { park: "ランド", area: "クリッターカントリー", name: "スプラッシュ・マウンテン", wait: 40, priority: "高", childFriendly: false, status: "稼働中" },
  { park: "シー", area: "メディテレーニアンハーバー", name: "ソアリン：ファンタスティック・フライト", wait: 65, priority: "高", childFriendly: false, status: "稼働中" },
  { park: "シー", area: "ロストリバーデルタ", name: "インディ・ジョーンズ®・アドベンチャー", wait: 45, priority: "高", childFriendly: false, status: "稼働中" },
  { park: "シー", area: "マーメイドラグーン", name: "ジャンピン・ジェリーフィッシュ", wait: 15, priority: "低", childFriendly: true, status: "稼働中" },
  { park: "シー", area: "ポートディスカバリー", name: "ニモ＆フレンズ・シーライダー", wait: 35, priority: "中", childFriendly: true, status: "稼働中" },
  { park: "シー", area: "アメリカンウォーターフロント", name: "タワー・オブ・テラー", wait: 55, priority: "高", childFriendly: false, status: "稼働中" }
];

const ATTRACTION_META = {
  "プーさんのハニーハント": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, showFriendly: true, thrillLevel: "低" },
  "モンスターズ・インク ライド＆ゴーシーク！": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, showFriendly: true, thrillLevel: "低" },
  "ジャングルクルーズ": { childFriendly: true, indoor: false, relaxing: true, shortExperience: true, showFriendly: true, thrillLevel: "低" },
  "ホーンテッドマンション": { childFriendly: false, indoor: true, relaxing: false, shortExperience: true, showFriendly: false, thrillLevel: "中" },
  "ビッグサンダー・マウンテン": { childFriendly: false, indoor: false, relaxing: false, shortExperience: false, showFriendly: false, thrillLevel: "高" },
  "スプラッシュ・マウンテン": { childFriendly: false, indoor: false, relaxing: false, shortExperience: false, showFriendly: false, thrillLevel: "高" },
  "ソアリン：ファンタスティック・フライト": { childFriendly: false, indoor: true, relaxing: false, shortExperience: false, showFriendly: false, thrillLevel: "中" },
  "インディ・ジョーンズ®・アドベンチャー": { childFriendly: false, indoor: true, relaxing: false, shortExperience: false, showFriendly: false, thrillLevel: "高" },
  "ジャンピン・ジェリーフィッシュ": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, showFriendly: true, thrillLevel: "低" },
  "ニモ＆フレンズ・シーライダー": { childFriendly: true, indoor: true, relaxing: true, shortExperience: true, showFriendly: true, thrillLevel: "低" },
  "タワー・オブ・テラー": { childFriendly: false, indoor: true, relaxing: false, shortExperience: false, showFriendly: false, thrillLevel: "高" }
};

const PARK_QUERY_MAP = { ランド: "land", シー: "sea", すべて: "all" };
const MODE_CONFIG = {
  normal: { label: "通常", weights: { wait: 32, open: 22, priority: 14, child: 10, indoor: 8, relaxing: 7, short: 7, show: 4, thrillPenalty: -8 }, reasons: ["待ち時間が短め", "稼働中で安心", "優先度が高め", "家族でも回りやすい"] },
  family: { label: "子連れ", weights: { wait: 20, open: 18, priority: 8, child: 22, indoor: 16, relaxing: 14, short: 14, show: 8, thrillPenalty: -20 }, reasons: ["子連れ向き", "怖すぎない", "短時間で回れる", "屋内で休憩しやすい"] },
  efficient: { label: "効率重視", weights: { wait: 42, open: 24, priority: 16, child: 4, indoor: 4, relaxing: 4, short: 12, show: 5, thrillPenalty: -4 }, reasons: ["待ち時間が短め", "稼働中で回しやすい", "連続して回りやすい"] },
  relax: { label: "休憩向き", weights: { wait: 20, open: 14, priority: 6, child: 10, indoor: 24, relaxing: 24, short: 12, show: 10, thrillPenalty: -10 }, reasons: ["屋内で過ごしやすい", "休憩向き", "暑さ・雨を避けやすい", "短時間で組み込みやすい"] },
  show: { label: "ショー・パレード優先", weights: { wait: 34, open: 20, priority: 10, child: 10, indoor: 14, relaxing: 12, short: 18, show: 20, thrillPenalty: -18 }, reasons: ["ショー前後に組み込みやすい", "短時間で回れる", "屋内で待機しやすい", "今は大物より短時間候補が有利"] }
};
const THRILL_SCORE = { 低: 1, 中: 0.5, 高: 0 };

const listElement = document.getElementById("attractionList");
const recommendText = document.getElementById("recommendText");
const recommendReasons = document.getElementById("recommendReasons");
const countText = document.getElementById("countText");
const currentState = document.getElementById("currentState");
const dataNotice = document.getElementById("dataNotice");
const lastUpdated = document.getElementById("lastUpdated");
const loadingState = document.getElementById("loadingState");
const closureNotice = document.getElementById("closureNotice");
const debugDetails = document.getElementById("debugDetails");
const debugSummary = document.getElementById("debugSummary");
const debugInfo = document.getElementById("debugInfo");
const modeHint = document.getElementById("modeHint");

const parkButtons = document.querySelectorAll("[data-park-filter]");
const sortButtons = document.querySelectorAll("[data-sort]");
const modeButtons = document.querySelectorAll("[data-mode]");

let currentFilter = "すべて";
let currentSort = "recommended";
let currentMode = "normal";
let liveAttractions = [];
let fallbackMode = false;

const priorityScore = { 高: 3, 中: 2, 低: 1 };
const priorityClassMap = { 高: "priority-high", 中: "priority-mid", 低: "priority-low" };

const setButtonsDisabled = (disabled) => [...parkButtons, ...sortButtons, ...modeButtons].forEach((b) => (b.disabled = disabled));
const inferPriority = (wait) => wait == null ? "低" : wait >= 60 ? "高" : wait >= 30 ? "中" : "低";
const formatUpdatedTime = (dateString) => new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(dateString ? new Date(dateString) : new Date());
const resolveStatus = (ride) => ride.is_open === false ? "休止中" : ride.is_open === true && typeof ride.wait_time === "number" ? "稼働中" : "案内なし";
const resolveWaitText = (item) => typeof item.wait === "number" ? `${item.wait}分` : item.status === "休止中" ? "休止中" : "案内なし";
const buildDebugInfo = (obj) => JSON.stringify(obj, null, 2);

function getMeta(name) {
  return ATTRACTION_META[name] || { childFriendly: true, indoor: false, relaxing: false, shortExperience: false, showFriendly: false, thrillLevel: "中" };
}

function normalizeRide(ride, parkName) {
  const wait = typeof ride.wait_time === "number" ? ride.wait_time : null;
  const nameJa = typeof ride.nameJa === "string" && ride.nameJa.length ? ride.nameJa : null;
  const englishName = ride.englishName || ride.name || "名称未登録";
  const name = nameJa || englishName;
  const meta = getMeta(name);
  return { park: parkName, area: ride.land || "エリア情報なし", name, nameJa, englishName, wait, priority: inferPriority(wait), status: resolveStatus(ride), apiLastUpdated: typeof ride.last_updated === "string" ? ride.last_updated : null, ...meta };
}

function computeScore(item, modeKey) {
  const mode = MODE_CONFIG[modeKey] || MODE_CONFIG.normal;
  const w = mode.weights;
  if (item.status === "休止中") return -999;
  const waitScore = typeof item.wait === "number" ? Math.max(0, 1 - (item.wait / 120)) : 0.05;
  const openScore = item.status === "稼働中" ? 1 : 0.15;
  let score = waitScore * w.wait + openScore * w.open + (priorityScore[item.priority] / 3) * w.priority;
  score += (item.childFriendly ? 1 : 0) * w.child + (item.indoor ? 1 : 0) * w.indoor + (item.relaxing ? 1 : 0) * w.relaxing + (item.shortExperience ? 1 : 0) * w.short + (item.showFriendly ? 1 : 0) * w.show;
  if (["family", "show"].includes(modeKey) && item.thrillLevel === "高") score += w.thrillPenalty;
  score += THRILL_SCORE[item.thrillLevel] * 2;
  if (item.status === "案内なし") score -= 10;
  return score;
}

function pickReasons(item, modeKey) {
  const badges = [];
  if (typeof item.wait === "number" && item.wait <= 25) badges.push("待ち時間が短め");
  if (item.childFriendly) badges.push("子連れ向き");
  if (item.indoor) badges.push("屋内");
  if (item.relaxing) badges.push("休憩しやすい");
  if (item.shortExperience) badges.push("短時間で回りやすい");
  if (item.showFriendly) badges.push("ショー前後向き");
  if (item.status === "稼働中") badges.push("稼働中");
  if ((modeKey === "show" || modeKey === "family") && item.thrillLevel === "高") badges.push("絶叫寄りでやや慎重");
  return badges.slice(0, 3);
}

function applySort(items) {
  if (currentSort === "wait") return [...items].sort((a, b) => (a.wait ?? Infinity) - (b.wait ?? Infinity));
  return [...items].sort((a, b) => computeScore(b, currentMode) - computeScore(a, currentMode));
}
const getDisplayItems = () => applySort(currentFilter === "すべて" ? liveAttractions : liveAttractions.filter((item) => item.park === currentFilter));

function getRecommendation(items) {
  const lowGuidanceCount = items.filter((item) => item.status !== "稼働中").length;
  const lowGuidance = items.length > 0 && (lowGuidanceCount / items.length) >= 0.8;
  const candidates = items.filter((item) => item.status === "稼働中");
  const ranked = applySort(candidates.length ? candidates : items);
  return { item: ranked[0], lowGuidance };
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";
  const waitText = resolveWaitText(item);
  const waitClass = item.status === "稼働中" ? "wait-running" : item.status === "休止中" ? "wait-paused" : "wait-unknown";
  const tags = [item.childFriendly && "子連れ向け", item.indoor && "屋内", item.relaxing && "休憩向き", item.shortExperience && "短時間", item.showFriendly && "ショー前後向き"].filter(Boolean);
  card.innerHTML = `<div class="card-head"><div class="card-title-wrap"><h3>${item.name}</h3><p class="area">${item.park} ・ ${item.area}</p></div><span class="wait-time ${waitClass}">${waitText}</span></div><div class="meta-row"><span class="badge ${priorityClassMap[item.priority]}">優先度 ${item.priority}</span><span class="badge status-badge">${item.status}</span><span class="badge thrill-badge">スリル ${item.thrillLevel}</span>${tags.map((tag) => `<span class="badge feature-badge">${tag}</span>`).join("")}</div>`;
  return card;
}

function render() {
  const items = getDisplayItems();
  listElement.innerHTML = "";
  items.forEach((item) => listElement.appendChild(createCard(item)));

  const sortLabel = currentSort === "wait" ? "待ち時間順" : "おすすめ順";
  const modeLabel = MODE_CONFIG[currentMode].label;
  currentState.textContent = `${currentFilter} / ${sortLabel}`;
  modeHint.textContent = `モード: ${modeLabel}`;
  countText.textContent = `${items.length}件`;

  const hasLiveWait = items.some((item) => typeof item.wait === "number" && item.status === "稼働中");
  const lowGuidanceCount = items.filter((item) => item.status === "休止中" || item.status === "案内なし").length;
  const hasLikelyClosedData = items.length > 0 && (lowGuidanceCount / items.length) >= 0.8;

  if (!fallbackMode && !hasLiveWait && hasLikelyClosedData) {
    closureNotice.textContent = "現在は閉園後、または待ち時間案内が少ない時間帯の可能性があります。開園中に再確認してください。";
    dataNotice.textContent = "リアルタイム（案内なし多め）";
  } else {
    closureNotice.textContent = "";
  }

  if (items.length === 0) {
    recommendText.textContent = "現在は判断材料が少ないため、開園中に再確認してください。";
    recommendReasons.innerHTML = "";
    return;
  }

  const { item: recommended, lowGuidance } = getRecommendation(items);
  if (!recommended) {
    recommendText.textContent = "現在は判断材料が少ないため、開園中に再確認してください。";
    recommendReasons.innerHTML = "";
    return;
  }

  const waitText = resolveWaitText(recommended);
  const reasons = pickReasons(recommended, currentMode);
  recommendReasons.innerHTML = reasons.map((reason) => `<span class="badge reason-badge">${reason}</span>`).join("");

  if (lowGuidance || recommended.status !== "稼働中") {
    recommendText.textContent = `参考候補: ${recommended.name}（${recommended.park}・${recommended.area} / ${waitText}）。現在は判断材料が少ないため、開園中に再確認してください。`;
  } else if (currentMode === "show") {
    recommendText.textContent = `次の一手: ${recommended.name}（${recommended.park}・${recommended.area} / 待ち${waitText}）。今は大物アトラクションより、短時間で回れる候補がおすすめです。`;
  } else {
    recommendText.textContent = `次の一手: ${recommended.name}（${recommended.park}・${recommended.area} / 待ち${waitText}）。`;
  }
}

async function fetchWorkerData(parkName) { /* unchanged API behavior */
  const parkParam = PARK_QUERY_MAP[parkName] || "all";
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const url = `${baseUrl}/?park=${parkParam}`;
  let response;
  try { response = await fetch(url, { cache: "no-store" }); } catch (error) { throw { type: "network_or_cors", parkName, url, message: "Cloudflare Worker への接続に失敗しました。", originalError: error }; }
  if (!response.ok) throw { type: "http_error", parkName, url, status: response.status, ok: response.ok, statusText: response.statusText, message: "Worker API のHTTPステータスが異常です。" };
  const data = await response.json();
  if (!Array.isArray(data?.rides)) throw { type: "data_shape_error", parkName, url, message: "Worker API のレスポンス形式が不正です。" };
  return { rides: data.rides.map((ride) => normalizeRide({ name: ride.name, nameJa: ride.nameJa, englishName: ride.englishName, wait_time: ride.wait_time, is_open: ride.is_open, last_updated: ride.last_updated || ride.lastUpdated || null, land: ride.area }, ride.park)), fetchedAt: data.fetchedAt || data.generated_at || null };
}

function setDebugSuccess(message) { debugDetails.open = false; debugSummary.textContent = message; debugInfo.textContent = ""; }
function setDebugError(message, detailObj) { debugDetails.open = true; debugSummary.textContent = message; debugInfo.textContent = buildDebugInfo(detailObj); }

async function refreshData() {
  currentState.textContent = `${currentFilter} / 読み込み中`; loadingState.textContent = "読み込み中…"; dataNotice.textContent = "待ち時間データを取得しています"; closureNotice.textContent = ""; setButtonsDisabled(true);
  try {
    const result = await fetchWorkerData(currentFilter);
    liveAttractions = result.rides; fallbackMode = false;
    const rideTimes = liveAttractions.map((ride) => ride.apiLastUpdated).filter(Boolean).sort();
    const latestApiTime = (rideTimes.length ? rideTimes[rideTimes.length - 1] : null) || result.fetchedAt;
    dataNotice.textContent = "リアルタイム取得中";
    lastUpdated.textContent = latestApiTime ? `${formatUpdatedTime(latestApiTime)}（API）` : `${formatUpdatedTime()}（API）`;
    setDebugSuccess(`正常取得中。件数：${result.rides.length}`);
  } catch (error) {
    fallbackMode = true; liveAttractions = SAMPLE_ATTRACTIONS.map((ride) => ({ ...ride, ...getMeta(ride.name) }));
    dataNotice.textContent = "サンプル表示（API取得失敗）"; lastUpdated.textContent = `${formatUpdatedTime()}（サンプル）`;
    setDebugError("取得失敗の詳細（原因切り分け用）", { errorType: error?.type || "unknown", park: error?.parkName || currentFilter, apiUrl: error?.url || "不明", status: error?.status ?? "なし", statusText: error?.statusText || "なし", hint: error?.message || "想定外エラー" });
  } finally { loadingState.textContent = ""; setButtonsDisabled(false); }
  render();
}

parkButtons.forEach((button) => button.addEventListener("click", async () => { currentFilter = button.dataset.parkFilter; parkButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button)); await refreshData(); }));
sortButtons.forEach((button) => button.addEventListener("click", () => { currentSort = button.dataset.sort; sortButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button)); render(); }));
modeButtons.forEach((button) => button.addEventListener("click", () => { currentMode = button.dataset.mode; modeButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button)); render(); }));

refreshData();
