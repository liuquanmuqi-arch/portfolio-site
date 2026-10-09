fetch("works.csv")
    .then(function(response) {
        return response.text();
    })
    .then(function(data) {

        // CSVを行ごとに分割（Windowsの改行 \r\n にも対応）
        var rows = data.trim().split(/\r?\n/);

        // 1行目は見出し
        var headers = rows[0].split(",");

        // 2行目以降を作品データにする（空行はとばす）
        var works = rows.slice(1).filter(function(row) {
            return row.trim() !== "";
        }).map(function(row) {

            var values = row.split(",");

            var work = {};

            headers.forEach(function(header, index) {
                work[header.trim()] = (values[index] || "").trim();
            });

            return work;
        });

        // HTML要素を取得
        var grid = document.getElementById("works-grid");
        var categorySelect = document.getElementById("category");
        var sortSelect = document.getElementById("sort");

        // カテゴリ一覧を作る
        var categories = [];

        works.forEach(function(work) {
            // まだ追加されていないカテゴリならリストに追加
            if (!categories.includes(work.category)) {
                categories.push(work.category);
            }
        });

        // selectにカテゴリを追加しWebページに表示させる
        categories.forEach(function(category) {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // 作品を表示する関数
        function displayWorks() {

            // 選択されたカテゴリを取得
            var selectedCategory = categorySelect.value;

            // 選択されたソート方法を取得
            var sortType = sortSelect.value;

            // 元のworksをコピー
            var filteredWorks = works.slice();

            // カテゴリ絞り込み
            if (selectedCategory !== "all") {
                filteredWorks = filteredWorks.filter(function(work) {
                    return work.category === selectedCategory;
                });
            }

            // ソート
            if (sortType === "new") {
                filteredWorks.sort(function(a, b) {
                    return Number(b.year) - Number(a.year);
                });
            }
            else if (sortType === "old") {
                filteredWorks.sort(function(a, b) {
                    return Number(a.year) - Number(b.year);
                });
            }
            else if (sortType === "title") {
                filteredWorks.sort(function(a, b) {
                    return a.title.localeCompare(b.title, "ja");
                });
            }

            // 画面を一度空にする
            grid.innerHTML = "";

            // 作品を1つずつ表示
            filteredWorks.forEach(function(work) {

                var card = document.createElement("article");

                card.className = "work-card";

                // ページ内リンク（#から始まる）以外は新しいタブで開く
                var target = "";
                if (work.link.charAt(0) !== "#") {
                    target = ' target="_blank"';
                }

                card.innerHTML =
                    '<a href="' + work.link + '"' + target + '>' +
                        '<img src="' + work.image + '" alt="' + work.title + '">' +
                        '<div class="work-info">' +
                            '<p class="work-category">' + work.category + '</p>' +
                            '<h4>' + work.title + '</h4>' +
                            '<p>' + work.description + '</p>' +
                            '<p class="work-year">' + work.year + '</p>' +
                        '</div>' +
                    '</a>';

                grid.appendChild(card);
            });
        }

        // 最初に表示
        displayWorks();

        // カテゴリ変更時
        categorySelect.addEventListener("change", function() {
            displayWorks();
        });

        // ソート変更時
        sortSelect.addEventListener("change", function() {
            displayWorks();
        });
    })
    .catch(function() {
        // index.htmlをダブルクリックで開くとCSVが読めないので、その案内を出す
        document.getElementById("works-grid").innerHTML =
            '<p class="works-error">作品データ（works.csv）を読み込めませんでした。' +
            'VSCodeのLive Preview、またはGitHub Pagesの公開URLで開いてください。</p>';
    });


// ===== 天気と背景色を連動させる =====

// 都市大YC（横浜キャンパス）の緯度・経度
var latitude = 35.6895;
var longitude = 139.6917;

// 緯度・経度をもとに天気APIで天気を取得するURL
var weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + latitude +
    "&longitude=" + longitude +
    "&current=temperature_2m,weather_code" +
    "&timezone=Asia%2FTokyo";

fetch(weatherUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var weatherCode = data.current.weather_code;
        showWeather(weatherCode);
    })
    .catch(function() {
        // 天気が取れなかったときは何もしない（いつもの背景色のまま）
    });

// 天気に応じて天気マークと<body>のクラス名を変える関数
function showWeather(code) {

    var icon = document.getElementById("weather-icon");

    if (code === 0) {
        icon.textContent = "☀️";
        document.body.className = "weather-sunny";

    } else if (code >= 1 && code <= 3) {
        icon.textContent = "☁️";
        document.body.className = "weather-cloudy";

    } else if (code >= 51 && code <= 67) {
        icon.textContent = "☔";
        document.body.className = "weather-rainy";

    } else {
        icon.textContent = "☁️";
        document.body.className = "weather-cloudy";
    }
}