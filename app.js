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

const PARK_CONFIG = {
  ランド: 274,
  シー: 275
};

const listElement = document.getElementById("attractionList");
const recommendText = document.getElementById("recommendText");
const countText = document.getElementById("countText");
const currentState = document.getElementById("currentState");
const dataNotice = document.getElementById("dataNotice");
const lastUpdated = document.getElementById("lastUpdated");
const loadingState = document.getElementById("loadingState");

const parkButtons = document.querySelectorAll("[data-park-filter]");
const sortButtons = document.querySelectorAll("[data-sort]");

let currentFilter = "すべて";
let currentSort = "recommended";
let liveAttractions = [];
let fallbackMode = false;

const priorityScore = { 高: 3, 中: 2, 低: 1 };
const priorityClassMap = { 高: "priority-high", 中: "priority-mid", 低: "priority-low" };

function setButtonsDisabled(disabled) {
  [...parkButtons, ...sortButtons].forEach((button) => {
    button.disabled = disabled;
  });
}

function inferPriority(wait) {
  if (wait == null) return "低";
  if (wait >= 60) return "高";
  if (wait >= 30) return "中";
  return "低";
}

function formatUpdatedTime(date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

function resolveStatus(ride) {
  if (ride.is_open === true) return "稼働中";
  if (ride.is_open === false) return "運休/停止中";
  return "状態不明";
}

function normalizeRide(ride, parkName) {
  const wait = typeof ride.wait_time === "number" ? ride.wait_time : null;
  return {
    park: parkName,
    area: ride.land || "エリア情報なし",
    name: ride.name || "名称未登録",
    wait,
    priority: inferPriority(wait),
    status: resolveStatus(ride),
    childFriendly: true
  };
}

async function fetchParkData(parkName) {
  const parkId = PARK_CONFIG[parkName];
  const url = `https://queue-times.com/parks/${parkId}/queue_times.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`APIエラー: ${res.status}`);
  }
  const data = await res.json();
  const lands = Array.isArray(data.lands) ? data.lands : [];
  return lands.flatMap((land) => {
    const rides = Array.isArray(land.rides) ? land.rides : [];
    return rides.map((ride) => normalizeRide({ ...ride, land: land.name }, parkName));
  });
}

async function refreshData() {
  currentState.textContent = `現在の表示: ${currentFilter} / データ取得中...`;
  loadingState.textContent = "読み込み中…";
  dataNotice.textContent = "待ち時間データを取得しています";
  setButtonsDisabled(true);

  try {
    const targets = currentFilter === "すべて" ? ["ランド", "シー"] : [currentFilter];
    const results = await Promise.all(targets.map((park) => fetchParkData(park)));
    liveAttractions = results.flat();
    fallbackMode = false;
    dataNotice.textContent = "リアルタイム待ち時間を表示中";
    lastUpdated.textContent = `最終更新: ${formatUpdatedTime(new Date())}`;
  } catch (error) {
    fallbackMode = true;
    liveAttractions = [...SAMPLE_ATTRACTIONS];
    dataNotice.textContent = "通信に失敗したため、現在はサンプル表示です。時間をおいて再読み込みしてください。";
    lastUpdated.textContent = `最終更新: ${formatUpdatedTime(new Date())}（サンプル）`;
  } finally {
    loadingState.textContent = "";
    setButtonsDisabled(false);
  }

  render();
}

function applySort(items) {
  if (currentSort === "wait") {
    return [...items].sort((a, b) => (a.wait ?? Infinity) - (b.wait ?? Infinity));
  }

  return [...items].sort((a, b) => {
    if (priorityScore[b.priority] !== priorityScore[a.priority]) {
      return priorityScore[b.priority] - priorityScore[a.priority];
    }
    return (a.wait ?? Infinity) - (b.wait ?? Infinity);
  });
}

function getDisplayItems() {
  const filtered = currentFilter === "すべて"
    ? liveAttractions
    : liveAttractions.filter((item) => item.park === currentFilter);

  return applySort(filtered);
}

function getRecommendedItem(items) {
  return [...items].sort((a, b) => {
    const aWait = a.wait ?? Infinity;
    const bWait = b.wait ?? Infinity;
    if (aWait !== bWait) return aWait - bWait;
    return priorityScore[b.priority] - priorityScore[a.priority];
  })[0];
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const childBadgeClass = item.childFriendly ? "child-yes" : "child-no";
  const childLabel = item.childFriendly ? "👨‍👩‍👧 子連れ向け" : "🎢 絶叫寄り";
  const waitText = typeof item.wait === "number" ? `${item.wait}分` : "案内なし";

  card.innerHTML = `
    <div class="card-head">
      <div>
        <h3>${item.name}</h3>
        <p class="area">${item.park} ・ ${item.area}</p>
      </div>
      <span class="wait-time">${waitText}</span>
    </div>
    <div class="meta-row">
      <span class="badge ${priorityClassMap[item.priority]}">優先度 ${item.priority}</span>
      <span class="badge ${childBadgeClass}">${childLabel}</span>
      <span class="badge status-badge">${item.status || "状態不明"}</span>
    </div>
  `;

  return card;
}

function render() {
  const items = getDisplayItems();
  listElement.innerHTML = "";

  items.forEach((item) => {
    listElement.appendChild(createCard(item));
  });

  const sortLabel = currentSort === "wait" ? "待ち時間順" : "おすすめ順";
  const modeLabel = fallbackMode ? "（サンプル）" : "（リアルタイム）";
  currentState.textContent = `現在の表示: ${currentFilter} / ${sortLabel} ${modeLabel}`;
  countText.textContent = `${items.length}件表示中`;

  if (items.length === 0) {
    recommendText.textContent = "対象データがありません。条件を変えて確認してください。";
    return;
  }

  const recommended = getRecommendedItem(items);
  const waitText = typeof recommended.wait === "number" ? `${recommended.wait}分` : "案内なし";
  recommendText.textContent = `${recommended.name}（${recommended.park} / ${waitText} / ${recommended.status || "状態不明"}）`;
}

parkButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    currentFilter = button.dataset.parkFilter;
    parkButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    await refreshData();
  });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentSort = button.dataset.sort;
    sortButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    render();
  });
});

refreshData();
