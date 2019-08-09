const DEFAULT_LAT_LNG = [36.679, 139.232];
const DEFAULT_ZOOM = 7;
const CANCERS = {
  "1":"その他の悪性腫瘍",
  "2":"ホジキン病",
  "3":"乳房の悪性腫瘍",
  "4":"内分泌腺および関連組織の腫瘍",
  "5":"前立腺の悪性腫瘍",
  "6":"副腎皮質機能亢進症、非機能性副腎皮質腫瘍",
  "7":"卵巣・子宮附属器の悪性腫瘍",
  "8":"外陰の悪性腫瘍",
  "9":"多発性骨髄腫、免疫系悪性新生物",
  "10":"子宮頸・体部の悪性腫瘍",
  "11":"小腸の悪性腫瘍、腹膜の悪性腫瘍",
  "12":"急性白血病",
  "13":"性器の悪性腫瘍",
  "14":"慢性白血病、骨髄増殖性疾患",
  "15":"横隔膜腫瘍・横隔膜疾患（新生児を含む）",
  "16":"甲状腺の悪性腫瘍",
  "17":"皮膚の悪性腫瘍（黒色腫以外）",
  "18":"直腸肛門（直腸Ｓ状部から肛門）の悪性腫瘍",
  "19":"精巣腫瘍",
  "20":"結腸（虫垂を含む）の悪性腫瘍",
  "21":"縦隔悪性腫瘍、縦隔・胸膜の悪性腫瘍",
  "22":"肝・肝内胆管の悪性腫瘍（続発性を含む）",
  "23":"肺の悪性腫瘍",
  "24":"胃の悪性腫瘍",
  "25":"胆嚢、肝外胆管の悪性腫瘍",
  "26":"胸壁腫瘍、胸膜腫瘍",
  "27":"脊椎・脊髄腫瘍",
  "28":"脳腫瘍",
  "29":"腎盂・尿管の悪性腫瘍",
  "30":"腎腫瘍",
  "31":"腟の悪性腫瘍",
  "32":"膀胱腫瘍",
  "33":"膵臓、脾臓の腫瘍",
  "34":"角膜・眼及び付属器の悪性腫瘍",
  "35":"軟部の悪性腫瘍（脊髄を除く）",
  "36":"非ホジキンリンパ腫",
  "37":"頭頸部悪性腫瘍",
  "38":"食道の悪性腫瘍（頸部を含む）",
  "39":"骨の悪性腫瘍（脊椎を除く）",
  "40":"黒色腫"};
const gIcon = L.icon({
  iconUrl: 'img/material-icon-hospital.svg'
});
const gIconSelected = L.icon({
  iconUrl: 'img/material-icon-hospital.svg',
  className: 'selected'
});

let gMap;
let gHospitals = [];    // すべての病院を格納する
let gValues;            // すべての値レコードを格納する
let sHospitals = [];    // 検索された病院だけを格納する
let gMarkers = [];
let gMarkerGroup;


const addCommas = (num) => {
  return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

const hideMapCover = () => {
  $("#map-cover").removeClass("show");
}

const showMapCover = () => {
  $("#map-cover").addClass("show");
}

const showHospital = (code, isDirectClick) => {

  // 病院の基本情報を取得
  let hospital;
  sHospitals.forEach(function(hosp, i){
    if (hosp[0] === code) hospital = hosp.slice();
  });

  // 病院を地図の中心に持って行き、ズームする
  gotoMap([hospital[4], hospital[3]], 17);

  // 直接クリックでない場合
  if (!isDirectClick) {
    gMarkers.forEach(function(marker, i){
      if (  hospital[4] == marker._latlng.lat
        &&  hospital[3] == marker._latlng.lng) {
          marker.openPopup();
      }
    });
  }

  // 病院名の検索窓からフォーカスアウトする
  $("#name-area").removeClass("show");
}

const showDetailInfo = (code) => {

  // 病院の基本情報を取得
  let hospital;
  sHospitals.forEach(function(hosp, i){
    if (hosp[0] === code) hospital = hosp.slice();
  });

  // 緯度経度が合っていればアイコンの色を変える
  gMarkers.forEach(function(marker, i){
    if (hospital[4] === marker._latlng.lat && hospital[3] === marker._latlng.lng) {
      marker.setIcon(gIconSelected);
    } else {
      marker.setIcon(gIcon);
    }
  });

  // 病院の詳細情報を表示する
  $.getJSON("data/info/" + hospital[0] + ".json", function(json){

    const addModalItems = () => {
      const addItem = (index, value, unit) => {
        if (unit !== "") value = value + '<span>' + unit + '</span>';
        $("#modal-items").find("tr").eq(index).find("td").html(value);
      }

      // テーブルの内容をクリーニング
      $items = $("#modal-items");
      $items.find("td").text("");

      let days = hospital[7].toFixed(1);
      if (days == "NaN") days = "-";

      addItem(0, json[3] + json[5], "");                     // 都道府県＋市区町村
      addItem(1, json[4], "");                               // 二次医療圏
      addItem(2, json[2], "");                               // 設置母体
      addItem(3, json[8].replace("-", "（拠点指定なし）"), ""); // がん拠点病院分類
      addItem(4, json[9], "");                               // 病院類型
      addItem(5, json[10], "");                              // DPC算定病床の入院基本料
      addItem(6, addCommas(json[11]), "床");                 // DPC算定病床数
      addItem(7, addCommas(json[12]), "床");                 // 病床総数
      addItem(8, addCommas(hospital[6]), "件");              // 該当診療件数
      addItem(9, days, "日");                                // 平均在院日数
    }

    const addModalValues = () => {
      const addItem = (index, value, unit) => {
        if (unit !== "") value = value + '<span>' + unit + '</span>';
        $("#modal-items").find("tr").eq(index).find("td").html(value);
      }

      // テーブルの内容をクリーニング
      $area = $("#modal-values-area");
      $area.empty();
      $modal.find(".notes").text("");

      if (gValues[code]) {
        // まず
        let areahtml = '<table id="modal-values">'
          + '<thead>'
            + '<tr>'
              + '<th>疾患名</th>'
              + '<th class="c">手術</th>'
              + '<th class="c">化学<br />療法等</th>'
              + '<th class="r">診療<br />件数</th>'
              + '<th class="r">平均<br />在院<br />日数</th>'
            + '</tr>'
          + '</thead>'
          + '<tbody></tbody>'
        + '</table>';

        $area.append(areahtml);

        let $values = $("#modal-values");

        gValues[code].forEach(function(row, i){
          let code = row[0];  // 疾患コード

          // もし対象の疾患がテーブルに存在しなければ追加する
          if (!$values.find("tr.c" + code)[0]) {
            let html =
              '<tr class="c' + code + '">'
              + '<td class="name" rowspan="4">' + CANCERS[code] + '</td>'
              + '<td class="fg" rowspan="2">あり</td>'
              + '<td class="fg">あり</td>'
              + '<td class="v n1-1">0</td>'
              + '<td class="v d1-1">-</td>'
            + '</tr>'
            + '<tr class="c' + code + '">'
              + '<td class="fg">なし</td>'
              + '<td class="v n1-2">0</td>'
              + '<td class="v d1-2">-</td>'
            + '</tr>'
            + '<tr class="c' + code + '">'
              + '<td class="fg" rowspan="2">なし</td>'
              + '<td class="fg">あり</td>'
              + '<td class="v n2-1">0</td>'
              + '<td class="v d2-1">-</td>'
            + '</tr>'
            + '<tr class="c' + code + '">'
              + '<td class="fg">なし</td>'
              + '<td class="v n2-2">0</td>'
              + '<td class="v d2-2">-</td>'
            + '</tr>'
            ;

            $values.find("tbody").append(html);
          }

          let num  = parseInt(row[3]);   // 件数
          let days = addCommas((parseFloat(row[4]) / num).toFixed(1));  // 在院日数
          let $tr = $values.find("tbody").find("tr.c" + code);

          $tr.find("td.n" + row[1] + "-" + row[2]).text(num);
          $tr.find("td.d" + row[1] + "-" + row[2]).text(days);
        });

        // 注記
        if (json[13] !== "12" && json[13] !== "0") {
          $modal.find(".notes").text(
            '診療件数は' + json[13] + 'ヶ月間のデータ。比較のため12ヶ月に換算した'
          );
        }
      } else {
        let notes = '（がん診療実績データはありません）';
        $modal.find(".notes").text(notes);
      }
    }

    // タイトル
    $modal = $("#modal");
    $modal.find("h5").text(json[1]);

    // 基本情報と実績テーブル
    addModalItems();
    addModalValues();

    // モーダルを表示
    if (!$modal.hasClass("show")) {
      $modal.addClass("show");
    }
  });
}

// 縦位置をマップに合わせ、緯度経度とズームを設定する
const gotoMap = (lat_lng, zoom) => {
  let $target  = $("#map-block");
  let timeout  =   0;
  let duration = 600;
  let position = $target.offset().top - 16;

  setTimeout(function(){
    $("html, body").animate({scrollTop: position}, duration, "swing");
  }, timeout);

  // マップの中心を合わせてズームする
  gMap.setView(lat_lng, zoom);
}

const searchHospitals = () => {

  const getHospitalLabel = (type) => {
    let ret = "";

    switch(type) {
      case 2: ret = "国立がん研究センター";             break;
      case 3: ret = "地域がん診療病院";                 break;
      case 4: ret = "地域がん診療連携拠点病院";          break;
      case 5: ret = "地域がん診療連携拠点病院（高度型）";  break;
      case 6: ret = "特定領域がん診療連携拠点病院";       break;
      case 7: ret = "都道府県がん診療連携拠点病院";       break;
      case 8: ret = "都道府県独自指定がん拠点病院";       break;
      default: ret = "（拠点指定なし）";
    }

    return ret;
  }

  const getHospitalType = (type) => {
    let ret = 0;

    if ("234567".indexOf(type) !== -1) ret = 1; // 厚生労働省の指定病院
    if ("8".indexOf(type)      !== -1) ret = 2; // 都道府県の指定病院

    return ret;
  }

  // sHospitalsを更新する
  const updateHospitals = () => {

    // gValuesには「診療件数が１以上のレコード」のみ入っているので、まずsHospitalsを空にして１件ずつ追加していく
    sHospitals = [];

    let slc = {
      "prf": $("#select-prf").val(),   // 都道府県
      "cbh": $("#select-cbh").val(),   // がん拠点病院分類
      "mdc": $("#select-mdc").val(),   // 疾患の種類
      "opr": $("#select-opr").val(),   // 手術の有無
      "trt": $("#select-trt").val()    // 化学療法・放射線等の有無
    };

    // 病院を１件ずつ走査して絞り込み
    gHospitals.forEach(function(hospital, index) {
      let hit = true;
      let tmpHospital = hospital.slice(); // hospitalの値を変えるとgHospitalsに影響を与えてしまうので新しいインスタンスを作る

      let hsp = {
        "key": hospital[0].toString(),   // 病院の一意キー
        "prf": hospital[2].toString(),   // 都道府県
        "cbh": hospital[5].toString()    // がん拠点病院分類
      };

      // 病院の情報で絞り込み
      if (slc.prf !== "" && slc.prf !== hsp.prf) hit = false;
      if (slc.cbh !== "" && slc.cbh !== hsp.cbh) hit = false;

      // 値検索の対象となるセレクトボックスが「指定なし」でない場合、値で絞り込み
      if (slc.mdc !== "" || slc.opr !== "" || slc.trt !== "") {

        let vhit = false;

        // 診療件数と延べ在院日数をゼロにする
        //results = [0, 0];
        tmpHospital[6] = 0;
        tmpHospital[7] = 0;

        // １つでも引っかかれば検索結果に含めるので、最初はfalseとする
        // もしgValuesに該当する病院がなければ（＝その病院のすべてのレコード件数がゼロであれば）falseのままでよい
        if (gValues[hsp.key]) {
          let values = gValues[hsp.key];

          values.forEach(function(value, index){
            let val = {
              "mdc": value[0].toString(),   // 疾患の種類
              "opr": value[1].toString(),   // 手術の有無
              "trt": value[2].toString()    // 化学療法・放射線等の有無
            };

            // こちらはひとつの病院に複数ある診療件数・入院日数レコードが１つでも引っかかればよい
            if (  (slc.mdc === "" || slc.mdc === val.mdc)
              &&  (slc.opr === "" || slc.opr === val.opr)
              &&  (slc.trt === "" || slc.trt === val.trt)) {

              // 診療件数と延べ在院日数を足す
              tmpHospital[6] += Math.round(value[3], 1);
              tmpHospital[7] += Math.round(value[4], 1);

              vhit = true;
            }
          });
        }

        if (!vhit) hit = false;
      }

      if (hit) {
        // 延べ在院日数を平均在院日数で上書きする
        let num  = tmpHospital[6];
        let days = tmpHospital[7];
        let avg  = Math.round((days / num) * 100) / 100;
        tmpHospital[7] = avg;

        // sHospitalsに追加
        sHospitals.push(tmpHospital);
      }
    });
  }

  // 地図上に病院一覧を表示する
  const showMapHospitals = () => {

    showMapCover();

    if (gMarkers) gMap.removeLayer(gMarkers);
    if (gMarkerGroup) gMap.removeLayer(gMarkerGroup);
    gMarkerGroup = L.markerClusterGroup();

    sHospitals.forEach(function(hospital, index) {
      let lat = hospital[4];
      let lng = hospital[3];

      gMarkers[index] = L.marker([lat, lng], {icon: gIcon}).on('click', function(e) {
        showHospital(hospital[0], true);
      });

      gMarkers[index].bindPopup('<h5>' + hospital[1] + '</h5><p><a class="show-detail" code="' + hospital[0] + '">詳細情報を表示</a></p>');
      gMarkerGroup.addLayer(gMarkers[index]);
    });

    gMap.addLayer(gMarkerGroup);

    hideMapCover();
  }

  // バブルチャートを表示する
  const showBubbleChart = () => {
    $("#bubble-block").html(
      '<h4>診療件数と平均在院日数の分布</h4>'
    + '<canvas id="bubble-chart"></canvas>'
    );

    let config = {
      type: 'scatter',
      data: {
        datasets: [
          {backgroundColor: "#e98", codes: [], names: [], data: [], label: "厚生労働省の指定病院"},
          {backgroundColor: "#8b7", codes: [], names: [], data: [], label: "都道府県の指定病院　"},
          {backgroundColor: "#8ac", codes: [], names: [], data: [], label: "拠点指定なし　　　　"}
        ]
      },
      options: {
        legend: {
          display: true,
          position: 'bottom'
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: false,
          callbacks: {
            title: function(tooltipItem, data){
              let dsi = tooltipItem[0].datasetIndex;
              let eli = tooltipItem[0].index;
              let name = config.data.datasets[dsi].names[eli];
              return name;
            },
            beforeLabel: function(tooltipItem, data){
              return "診療件数："     + addCommas(tooltipItem.yLabel) + "件";
            },
            label: function(tooltipItem, data){
              return "平均在院日数："  + addCommas(tooltipItem.xLabel.toFixed(1)) + "日";
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        onClick: function(e, el) {
          if (el && el.length >= 1) {
            let dsi  = el[0]["_datasetIndex"];
            let eli  = el[0]["_index"];
            let code = config.data.datasets[dsi].codes[eli];
            showHospital(code, false);
          }
        },
        scales: {
          yAxes: [{
            display: true,
						scaleLabel: {
							display: true,
							labelString: "診療件数（件）"
						},
            ticks: {
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          xAxes: [{
            display: true,
						scaleLabel: {
							display: true,
							labelString: "平均在院日数（日）"
						},
            ticks: {
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }]
        },
        aspectRatio: 1.0
      }
    };

    sHospitals.forEach(function(hospital, i){
      let hostype   = hospital[5];    // 病院種類
      let dsindex = 2;

      if (getHospitalType(hostype) === 1) dsindex = 0; // 厚生労働省の指定病院
      if (getHospitalType(hostype) === 2) dsindex = 1; // 都道府県の指定病院

      config.data.datasets[dsindex].data.push({
        x: hospital[7],
        y: hospital[6]
      });

      config.data.datasets[dsindex].codes.push(hospital[0]);
      config.data.datasets[dsindex].names.push(hospital[1]);
    });

    // 幅に応じてaspectRatioを調整
    let w = $("#bubble-block").width();
    if (w >= 396) config.options.aspectRatio = 1.3;
    if (w >= 477) config.options.aspectRatio = 1.6;

    let ctx = document.getElementById('bubble-chart').getContext('2d');
    window.myDoughnut = new Chart(ctx, config);
  }

  // 診療件数の多い病院・平均入院日数の短い病院を表示
  // tableType: "num" or "days"
  const updateHospitalsTable = (tableType) => {
    let $tbody = $("#table-" + tableType).find("tbody");
    $tbody.empty();

    // tmpHospitalsに診療件数が1以上の病院一覧を格納
    let tmpHospitals = [];
    sHospitals.forEach(function(hosp, i){
      if (hosp[6] != "0") {
        tmpHospitals.push(hosp.slice());
      }
    });

    // 診療件数の降順または平均在院日数の昇順でソート
    tmpHospitals.sort(function(a,b){
      if (tableType === "num") {
        if (a[6] < b[6]) {
          return 1;
        } else if (a[6] == b[6]) {
          return 0;
        } else {
          return -1;
        }
      } else {
        if (a[7] > b[7]) {
          return 1;
        } else if (a[7] == b[7]) {
          return 0;
        } else {
          return -1;
        }
      }
    });

    for (let i = 0; i <= 9; i++) {
      let hospital = tmpHospitals[i];

      if (hospital) {
        $tbody.append(
          '<tr>'
          + '<td><a href="" class="hospital-info" code="' + hospital[0] + '">' + hospital[1] + '</a></td>'
          + '<td class="w">' + getHospitalLabel(hospital[5]) + '</td>'
          + '<td class="w r">' + addCommas(hospital[6]) + '</td>'
          + '<td class="w r">' + hospital[7].toFixed(1) + '</td>'
        + '</tr>');
      }
    }
  }

  updateHospitals();
  showMapHospitals();
  showBubbleChart();
  updateHospitalsTable("num");
  updateHospitalsTable("days");
}

const bindNameEvents = () => {
  let $input = $("#input-name");
  let $suggests = $("#name-suggests");

  $input.on("keydown", function(e){

    // 上下ボタンを押した場合
    if (e.keyCode === 38 || e.keyCode === 40) {
      e.preventDefault();

      if ($suggests.find("div")) {

        let selected = $suggests.find("div.selected");
        if (selected) {
          selected.removeClass("selected");

          // 上キーの場合
          if (e.which === 38) {
            if (selected.prev()[0]) {
              selected.prev().addClass("selected");
            } else {
              $suggests.find("div:last").addClass("selected");
            }

          // 下キーの場合
          } else if (e.which === 40) {
            if (selected.next()[0]) {
              selected.next().addClass("selected");
            } else {
              $suggests.find("div:first").addClass("selected");
            }
          }
        }
      }

    // Enterキーを押した場合
    } else if (e.keyCode === 13){
      let code = $suggests.find("div.selected").attr("code");
      showHospital(code, false);
    }
  });

  // コード・社名の入力欄が変更された時
  $input.on("keyup focus", function(e){

    let string = $(this).val();

    // 文字列が２文字以上の場合
    if (string.length >= 2) {

      // 上下キーでない場合（上下キーの場合はkeydownイベントで取得する）
      if (e.keyCode !== 38 && e.keyCode !== 40) {

        $suggests.addClass("show");
        $suggests.empty();

        // 病院名を検索
        let num = 0;

        gHospitals.forEach(function(hospital, i){
          if (num >= 10) return;

          let hit = false;
          let name = hospital[1];

          if (name.indexOf(string) !== -1) hit = true;

          if (hit) {
            $suggests.append('<div class="nsi" code="' + hospital[0] + '">' + hospital[1] + '</div>');
            num++;
          }
        });

        if (num === 0) $suggests.removeClass("show");

        $suggests.find("div:first").addClass("selected");
      }
    } else {
      $suggests.removeClass("show");
    }
  });
}

const bindEvents = () => {

  // When a select box was changed
  $(document).on("change", "select", function(){
    searchHospitals();
    gotoMap(DEFAULT_LAT_LNG, DEFAULT_ZOOM);
  });

  $(document).on("click", "#fullscreen-button", function(e){
    $.when(
      $("#cover").fadeIn("fast")
    ).done(function() {
      $.when(
        $("body").addClass("fullscreen"),
        gMap.invalidateSize()
      ).done(function() {
        $("#cover").fadeOut("fast");
      });
    });
  });

  $(document).on("click", "#button-close", function(e){
    e.stopPropagation();
    $.when(
      $("#cover").fadeIn("fast")
    ).done(function() {
      $.when(
        $("body").removeClass("fullscreen"),
        gMap.invalidateSize()
      ).done(function() {
        $("#cover").fadeOut("fast");
      });
    });
  });

  $(document).on("click", "a.hospital-info", function(e){
    e.stopPropagation();
    e.preventDefault();
    let code = $(this).attr("code");
    showHospital(code, false);
  });

  $(document).on("click", "a.show-detail", function(e){
    e.stopPropagation();
    e.preventDefault();
    let code = $(this).attr("code");
    showDetailInfo(code);
  });

  // 病院名の候補をクリックした時
  $(document).on("click", ".nsi", function(e){
    e.stopPropagation();
    e.preventDefault();
    let code = $(this).attr("code");
    showHospital(code, false);
  });

  // 病院名の候補にマウスホバーされた時
  $(document).on("mouseover", ".nsi", function(e){
    e.preventDefault();
    $(this).siblings().removeClass("selected");
    $(this).addClass("selected");
  });

  // 病院名の入力欄にフォーカスされたとき
  $(document).on("focus", "#input-name", function(e){
    $("#name-area").addClass("show");
  });

  // 病院名の入力欄からフォーカスが外れたとき
  $(document).on("blur", "#input-name", function(e){
    window.setTimeout(function() {
      $("#name-area").removeClass("show")
    }, 100);
  });

  $(document).on("click", "#button-modal-close", function(e){
    e.stopPropagation();
    e.preventDefault();

    if ($("#modal").hasClass("show")) {
      $("#modal").removeClass("show");

      // すべてのマーカーのアイコンを元に戻す
      gMarkers.forEach(function(marker, i){
        marker.setIcon(gIcon);
      });
    }
  });

  // When window other than modal was clicked
  $(document).on("click", function(e){
    if (!$(e.target).closest("#modal").length) {
      if ($("#modal").hasClass("show")) {
        $("#modal").removeClass("show");

        // すべてのマーカーのアイコンを元に戻す
        gMarkers.forEach(function(marker, i){
          marker.setIcon(gIcon);
        });
      }
    }
  });
}

const initMap = () => {
  gMap = L.map('map').setView(DEFAULT_LAT_LNG, DEFAULT_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 17,
    minZoom: 5
  }).addTo(gMap);

  $.getJSON("data/hospitals.json", function(hospitals){
    gHospitals = hospitals;

    $.getJSON("data/values.json", function(values){
      gValues = values;
      searchHospitals();
      bindNameEvents();
      hideMapCover();
    });
  });
}

$(function(){
  bindEvents();
  initMap();
});
