const attractions = [
  { name: "プーさんのハニーハント", area: "ファンタジーランド", wait: 45, priority: "高" },
  { name: "ビッグサンダー・マウンテン", area: "ウエスタンランド", wait: 35, priority: "中" },
  { name: "モンスターズ・インク ライド＆ゴーシーク！", area: "トゥモローランド", wait: 25, priority: "高" },
  { name: "ジャングルクルーズ", area: "アドベンチャーランド", wait: 15, priority: "低" },
  { name: "ホーンテッドマンション", area: "ファンタジーランド", wait: 20, priority: "中" }
];

const listElement = document.getElementById("attractionList");
const recommendText = document.getElementById("recommendText");
const sortButton = document.getElementById("sortButton");

function getRecommendedItem(items) {
  const priorityScore = { 高: 3, 中: 2, 低: 1 };
  return [...items].sort((a, b) => {
    if (a.wait !== b.wait) return a.wait - b.wait;
    return priorityScore[b.priority] - priorityScore[a.priority];
  })[0];
}

function render(items) {
  listElement.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <div class="meta">
        <div><span class="label">エリア:</span> ${item.area}</div>
        <div><span class="label">待ち時間:</span> ${item.wait}分</div>
      </div>
      <span class="priority">優先度: ${item.priority}</span>
    `;
    listElement.appendChild(card);
  });

  const recommended = getRecommendedItem(items);
  recommendText.textContent = `${recommended.name}（${recommended.wait}分 / 優先度: ${recommended.priority}）`;
}

sortButton.addEventListener("click", () => {
  const sorted = [...attractions].sort((a, b) => a.wait - b.wait);
  render(sorted);
});

render(attractions);
