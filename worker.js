const PARK_MAP = {
  land: { id: 274, label: "ランド" },
  sea: { id: 275, label: "シー" }
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const ATTRACTION_NAME_JA_MAP = {
  "Alice's Tea Party": "アリスのティーパーティー",
  "Big Thunder Mountain": "ビッグサンダー・マウンテン",
  "Jungle Cruise: Wildlife Expeditions": "ジャングルクルーズ：ワイルドライフ・エクスペディション",
  "Haunted Mansion": "ホーンテッドマンション",
  "Monsters, Inc. Ride & Go Seek!": "モンスターズ・インク “ライド＆ゴーシーク！”",
  "Enchanted Tale of Beauty and the Beast": "美女と野獣“魔法のものがたり”",
  "Pooh's Hunny Hunt": "プーさんのハニーハント",
  "Splash Mountain": "スプラッシュ・マウンテン",
  "Space Mountain": "スペース・マウンテン",
  "Tower of Terror": "タワー・オブ・テラー",
  "Toy Story Mania!": "トイ・ストーリー・マニア！",
  "Soaring: Fantastic Flight": "ソアリン：ファンタスティック・フライト",
  "Journey to the Center of the Earth": "センター・オブ・ジ・アース",
  "Indiana Jones Adventure®: Temple of the Crystal Skull": "インディ・ジョーンズ®・アドベンチャー：クリスタルスカルの魔宮",
  "20,000 Leagues Under the Sea": "海底2万マイル",
  "The Happy Ride with Baymax": "ベイマックスのハッピーライド",
  "Pirates of the Caribbean": "カリブの海賊",
  "Peter Pan's Flight": "ピーターパン空の旅",
  "Star Tours: The Adventures Continue": "スター・ツアーズ：ザ・アドベンチャーズ・コンティニュー",
  "Buzz Lightyear's Astro Blasters": "バズ・ライトイヤーのアストロブラスター",
  "Raging Spirits": "レイジングスピリッツ",
  "Aquatopia": "アクアトピア",
  "Nemo & Friends SeaRider": "ニモ＆フレンズ・シーライダー",
  "Sindbad's Storybook Voyage": "シンドバッド・ストーリーブック・ヴォヤッジ",
  "Turtle Talk": "タートル・トーク"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function normalizeRide(ride, parkLabel, areaName) {
  const englishName = ride?.name || "名称未登録";
  const nameJa = ATTRACTION_NAME_JA_MAP[englishName] || null;
  return {
    park: parkLabel,
    area: areaName || "エリア情報なし",
    name: englishName,
    nameJa,
    englishName,
    wait_time: typeof ride?.wait_time === "number" ? ride.wait_time : null,
    is_open: typeof ride?.is_open === "boolean" ? ride.is_open : null,
    status: ride?.is_open === true ? "稼働中" : ride?.is_open === false ? "運休/停止中" : "状態不明",
    last_updated: typeof ride?.last_updated === "string" ? ride.last_updated : null
  };
}

async function fetchParkQueueData(parkKey) {
  const parkInfo = PARK_MAP[parkKey];
  const apiUrl = `https://queue-times.com/parks/${parkInfo.id}/queue_times.json`;
  const response = await fetch(apiUrl, { cf: { cacheTtl: 30, cacheEverything: false } });

  if (!response.ok) {
    throw new Error(`Queue-Times API error (${response.status} ${response.statusText}) @ ${apiUrl}`);
  }

  const data = await response.json();
  if (!Array.isArray(data?.lands)) {
    throw new Error(`Invalid data shape from Queue-Times API @ ${apiUrl}`);
  }

  const rides = data.lands.flatMap((land) => {
    const areaName = land?.name || "エリア情報なし";
    const areaRides = Array.isArray(land?.rides) ? land.rides : [];
    return areaRides.map((ride) => normalizeRide(ride, parkInfo.label, areaName));
  });

  return {
    park: parkInfo.label,
    park_id: parkInfo.id,
    source_url: apiUrl,
    rides
  };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return jsonResponse({ error: "method_not_allowed", message: "GET/OPTIONS のみサポートしています。" }, 405);
    }

    const url = new URL(request.url);
    const park = (url.searchParams.get("park") || "all").toLowerCase();

    if (!["land", "sea", "all"].includes(park)) {
      return jsonResponse({
        error: "invalid_park",
        message: "park パラメータは land / sea / all を指定してください。",
        received: park
      }, 400);
    }

    try {
      const targets = park === "all" ? ["land", "sea"] : [park];
      const parks = await Promise.all(targets.map((target) => fetchParkQueueData(target)));
      const rides = parks.flatMap((entry) => entry.rides);

      return jsonResponse({
        source: "Queue-Times.com",
        requested_park: park,
        generated_at: new Date().toISOString(),
        parks,
        rides,
        count: rides.length
      });
    } catch (error) {
      return jsonResponse({
        error: "upstream_fetch_failed",
        message: "Queue-Times API からの取得に失敗しました。",
        detail: String(error)
      }, 502);
    }
  }
};
