const PARK_MAP = {
  land: { id: 274, label: "ランド" },
  sea: { id: 275, label: "シー" }
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const NAME_MAP = {
  "it's a small world with groot": "イッツ・ア・スモールワールド with グルート",
  "alice's tea party": "アリスのティーパーティー",
  "beaver brothers explorer canoes": "ビーバーブラザーズのカヌー探険",
  "big thunder mountain": "ビッグサンダー・マウンテン",
  "buzz lightyear's astro blasters": "バズ・ライトイヤーのアストロブラスター",
  "castle carrousel": "キャッスルカルーセル",
  "cinderella's fairy tale hall": "シンデレラのフェアリーテイル・ホール",
  "country bear theater": "カントリーベア・シアター",
  "dumbo the flying elephant": "空飛ぶダンボ",
  "enchanted tale of beauty and the beast": "美女と野獣“魔法のものがたり”",
  "gadget's go coaster": "ガジェットのゴーコースター",
  "haunted mansion": "ホーンテッドマンション",
  "jungle cruise: wildlife expeditions": "ジャングルクルーズ：ワイルドライフ・エクスペディション",
  "mark twain riverboat": "蒸気船マークトウェイン号",
  "mickey's philharmagic": "ミッキーのフィルハーマジック",
  "monsters, inc. ride & go seek!": "モンスターズ・インク“ライド＆ゴーシーク！”",
  "peter pan's flight": "ピーターパン空の旅",
  "pinocchio's daring journey": "ピノキオの冒険旅行",
  "pirates of the caribbean": "カリブの海賊",
  "pooh's hunny hunt": "プーさんのハニーハント",
  "snow white's adventures": "白雪姫と七人のこびと",
  "splash mountain": "スプラッシュ・マウンテン",
  "star tours: the adventures continue": "スター・ツアーズ：ザ・アドベンチャーズ・コンティニュー",
  "the enchanted tiki room: stitch presents aloha e komo mai!": "魅惑のチキルーム：スティッチ・プレゼンツ “アロハ・エ・コモ・マイ！”",
  "western river railroad": "ウエスタンリバー鉄道",
  "the happy ride with baymax": "ベイマックスのハッピーライド",
  "space mountain": "スペース・マウンテン",

  "20,000 leagues under the sea": "海底2万マイル",
  "anna and elsa's frozen journey": "アナとエルサのフローズンジャーニー",
  "aquatopia": "アクアトピア",
  "ariel's playground": "アリエルのプレイグラウンド",
  "blowfish balloon race": "ブローフィッシュ・バルーンレース",
  "caravan carousel": "キャラバンカルーセル",
  "disneysea electric railway (american waterfront)": "ディズニーシー・エレクトリックレールウェイ（アメリカンウォーターフロント）",
  "disneysea electric railway (port discovery)": "ディズニーシー・エレクトリックレールウェイ（ポートディスカバリー）",
  "disneysea transit steamer line": "ディズニーシー・トランジットスチーマーライン",
  "fairy tinker bell's busy buggies": "フェアリー・ティンカーベルのビジーバギー",
  "flounder's flying fish coaster": "フランダーのフライングフィッシュコースター",
  "fortress explorations": "フォートレス・エクスプロレーション",
  "indiana jones adventure: temple of the crystal skull": "インディ・ジョーンズ®・アドベンチャー：クリスタルスカルの魔宮",
  "jasmine's flying carpets": "ジャスミンのフライングカーペット",
  "journey to the center of the earth": "センター・オブ・ジ・アース",
  "jumpin' jellyfish": "ジャンピン・ジェリーフィッシュ",
  "nemo & friends searider": "ニモ＆フレンズ・シーライダー",
  "peter pan's never land adventure": "ピーターパンのネバーランドアドベンチャー",
  "raging spirits": "レイジングスピリッツ",
  "rapunzel's lantern festival": "ラプンツェルのランタンフェスティバル",
  "scuttle's scooters": "スカットルのスクーター",
  "sinbad's storybook voyage": "シンドバッド・ストーリーブック・ヴォヤッジ",
  "sindbad's storybook voyage": "シンドバッド・ストーリーブック・ヴォヤッジ",
  "soaring: fantastic flight": "ソアリン：ファンタスティック・フライト",
  "the magic lamp theater": "マジックランプシアター",
  "tower of terror": "タワー・オブ・テラー",
  "toy story mania!": "トイ・ストーリー・マニア！",
  "turtle talk": "タートル・トーク"
};

function normalizeName(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[®™]/g, "")
    .replace(/[：]/g, ":")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function resolveJapaneseName(englishName) {
  const normalized = normalizeName(englishName);
  return NAME_MAP[normalized] || null;
}

function jsonResponse(body, status = 200) { /* unchanged */
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
  });
}

function normalizeRide(ride, parkLabel, areaName) {
  const englishName = ride?.name || "名称未登録";
  const nameJa = resolveJapaneseName(englishName);
  const isOpen = typeof ride?.is_open === "boolean" ? ride.is_open : null;
  const waitTime = typeof ride?.wait_time === "number" ? ride.wait_time : null;

  return {
    park: parkLabel,
    area: areaName || "エリア情報なし",
    name: nameJa || englishName,
    nameJa,
    englishName,
    translationMatched: Boolean(nameJa),
    wait_time: waitTime,
    is_open: isOpen,
    status: isOpen === false ? "休止中" : waitTime == null ? "案内なし" : "稼働中",
    last_updated: typeof ride?.last_updated === "string" ? ride.last_updated : null
  };
}

async function fetchParkQueueData(parkKey) {
  const parkInfo = PARK_MAP[parkKey];
  const apiUrl = `https://queue-times.com/parks/${parkInfo.id}/queue_times.json`;
  const response = await fetch(apiUrl, { cf: { cacheTtl: 30, cacheEverything: false } });
  if (!response.ok) throw new Error(`Queue-Times API error (${response.status} ${response.statusText}) @ ${apiUrl}`);
  const data = await response.json();
  if (!Array.isArray(data?.lands)) throw new Error(`Invalid data shape from Queue-Times API @ ${apiUrl}`);
  const rides = data.lands.flatMap((land) => {
    const areaName = land?.name || "エリア情報なし";
    const areaRides = Array.isArray(land?.rides) ? land.rides : [];
    return areaRides.map((ride) => normalizeRide(ride, parkInfo.label, areaName));
  });

  return { park: parkInfo.label, park_id: parkInfo.id, source_url: apiUrl, rides };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed", message: "GET/OPTIONS のみサポートしています。" }, 405);

    const url = new URL(request.url);
    const park = (url.searchParams.get("park") || "all").toLowerCase();
    if (!["land", "sea", "all"].includes(park)) {
      return jsonResponse({ error: "invalid_park", message: "park パラメータは land / sea / all を指定してください。", received: park }, 400);
    }

    try {
      const targets = park === "all" ? ["land", "sea"] : [park];
      const parks = await Promise.all(targets.map((target) => fetchParkQueueData(target)));
      const rides = parks.flatMap((entry) => entry.rides);
      const translationMatchedCount = rides.filter((ride) => ride.translationMatched).length;

      return jsonResponse({
        source: "Queue-Times.com",
        requested_park: park,
        generated_at: new Date().toISOString(),
        translation_matched_count: translationMatchedCount,
        parks,
        rides,
        count: rides.length
      });
    } catch (error) {
      return jsonResponse({ error: "upstream_fetch_failed", message: "Queue-Times API からの取得に失敗しました。", detail: String(error) }, 502);
    }
  }
};
