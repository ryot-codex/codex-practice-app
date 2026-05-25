const attractions = [
  { park: "ランド", area: "ファンタジーランド", name: "プーさんのハニーハント", wait: 45, priority: "高", childFriendly: true },
  { park: "ランド", area: "ウエスタンランド", name: "ビッグサンダー・マウンテン", wait: 35, priority: "中", childFriendly: false },
  { park: "ランド", area: "トゥモローランド", name: "モンスターズ・インク ライド＆ゴーシーク！", wait: 25, priority: "高", childFriendly: true },
  { park: "ランド", area: "アドベンチャーランド", name: "ジャングルクルーズ", wait: 15, priority: "低", childFriendly: true },
  { park: "ランド", area: "ファンタジーランド", name: "ホーンテッドマンション", wait: 20, priority: "中", childFriendly: false },
  { park: "ランド", area: "トゥモローランド", name: "スペース・マウンテン", wait: 50, priority: "中", childFriendly: false },
  { park: "ランド", area: "クリッターカントリー", name: "スプラッシュ・マウンテン", wait: 40, priority: "高", childFriendly: false },
  { park: "ランド", area: "ファンタジーランド", name: "ピーターパン空の旅", wait: 30, priority: "中", childFriendly: true },
  { park: "ランド", area: "ファンタジーランド", name: "イッツ・ア・スモールワールド", wait: 10, priority: "低", childFriendly: true },
  { park: "ランド", area: "トゥモローランド", name: "バズ・ライトイヤーのアストロブラスター", wait: 28, priority: "中", childFriendly: true },
  { park: "ランド", area: "ファンタジーランド", name: "白雪姫と七人のこびと", wait: 18, priority: "低", childFriendly: true },
  { park: "ランド", area: "アドベンチャーランド", name: "カリブの海賊", wait: 22, priority: "中", childFriendly: true },
  { park: "ランド", area: "ウエスタンランド", name: "ウエスタンリバー鉄道", wait: 12, priority: "低", childFriendly: true },
  { park: "ランド", area: "トゥモローランド", name: "スター・ツアーズ：ザ・アドベンチャーズ・コンティニュー", wait: 26, priority: "中", childFriendly: false },
  { park: "ランド", area: "ファンタジーランド", name: "空飛ぶダンボ", wait: 24, priority: "低", childFriendly: true },
  { park: "シー", area: "メディテレーニアンハーバー", name: "ソアリン：ファンタスティック・フライト", wait: 65, priority: "高", childFriendly: false },
  { park: "シー", area: "ロストリバーデルタ", name: "インディ・ジョーンズ®・アドベンチャー", wait: 45, priority: "高", childFriendly: false },
  { park: "シー", area: "マーメイドラグーン", name: "ジャンピン・ジェリーフィッシュ", wait: 15, priority: "低", childFriendly: true },
  { park: "シー", area: "ポートディスカバリー", name: "ニモ＆フレンズ・シーライダー", wait: 35, priority: "中", childFriendly: true },
  { park: "シー", area: "アメリカンウォーターフロント", name: "タワー・オブ・テラー", wait: 55, priority: "高", childFriendly: false },
  { park: "シー", area: "ミステリアスアイランド", name: "センター・オブ・ジ・アース", wait: 48, priority: "高", childFriendly: false },
  { park: "シー", area: "アラビアンコースト", name: "シンドバッド・ストーリーブック・ヴォヤッジ", wait: 12, priority: "低", childFriendly: true },
  { park: "シー", area: "アラビアンコースト", name: "マジックランプシアター", wait: 20, priority: "中", childFriendly: true },
  { park: "シー", area: "マーメイドラグーン", name: "フランダーのフライングフィッシュコースター", wait: 22, priority: "中", childFriendly: true },
  { park: "シー", area: "ポートディスカバリー", name: "アクアトピア", wait: 18, priority: "低", childFriendly: true },
  { park: "シー", area: "ロストリバーデルタ", name: "レイジングスピリッツ", wait: 38, priority: "中", childFriendly: false },
  { park: "シー", area: "アメリカンウォーターフロント", name: "トイ・ストーリー・マニア！", wait: 60, priority: "高", childFriendly: true },
  { park: "シー", area: "マーメイドラグーン", name: "ワールプール", wait: 14, priority: "低", childFriendly: true },
  { park: "シー", area: "アメリカンウォーターフロント", name: "タートル・トーク", wait: 25, priority: "中", childFriendly: true },
  { park: "シー", area: "メディテレーニアンハーバー", name: "ヴェネツィアン・ゴンドラ", wait: 16, priority: "低", childFriendly: true }
];

const listElement = document.getElementById("attractionList");
const recommendText = document.getElementById("recommendText");
const countText = document.getElementById("countText");
const currentState = document.getElementById("currentState");

const parkButtons = document.querySelectorAll("[data-park-filter]");
const sortButtons = document.querySelectorAll("[data-sort]");

let currentFilter = "すべて";
let currentSort = "recommended";

const priorityScore = { 高: 3, 中: 2, 低: 1 };
const priorityClassMap = { 高: "priority-high", 中: "priority-mid", 低: "priority-low" };

function applySort(items) {
  if (currentSort === "wait") {
    return [...items].sort((a, b) => a.wait - b.wait);
  }

  return [...items].sort((a, b) => {
    if (priorityScore[b.priority] !== priorityScore[a.priority]) {
      return priorityScore[b.priority] - priorityScore[a.priority];
    }
    return a.wait - b.wait;
  });
}

function getDisplayItems() {
  const filtered = currentFilter === "すべて"
    ? attractions
    : attractions.filter((item) => item.park === currentFilter);

  return applySort(filtered);
}

function getRecommendedItem(items) {
  return [...items].sort((a, b) => {
    if (a.wait !== b.wait) return a.wait - b.wait;
    return priorityScore[b.priority] - priorityScore[a.priority];
  })[0];
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const childBadgeClass = item.childFriendly ? "child-yes" : "child-no";
  const childLabel = item.childFriendly ? "👨‍👩‍👧 子連れ向け" : "🎢 絶叫寄り";

  card.innerHTML = `
    <div class="card-head">
      <div>
        <h3>${item.name}</h3>
        <p class="area">${item.park} ・ ${item.area}</p>
      </div>
      <span class="wait-time">${item.wait}分</span>
    </div>
    <div class="meta-row">
      <span class="badge ${priorityClassMap[item.priority]}">優先度 ${item.priority}</span>
      <span class="badge ${childBadgeClass}">${childLabel}</span>
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
  currentState.textContent = `現在の表示: ${currentFilter} / ${sortLabel}`;
  countText.textContent = `${items.length}件表示中`;

  if (items.length === 0) {
    recommendText.textContent = "対象データがありません。条件を変えて確認してください。";
    return;
  }

  const recommended = getRecommendedItem(items);
  recommendText.textContent = `${recommended.name}（${recommended.park} / ${recommended.wait}分 / 優先度 ${recommended.priority}）`;
}

parkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.parkFilter;
    parkButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    render();
  });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentSort = button.dataset.sort;
    sortButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    render();
  });
});

render();
