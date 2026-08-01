"use client";

import { useMemo, useState } from "react";

type Axis = "J" | "A" | "P" | "C" | "K";
type Scores = Record<Axis, number>;

type Question = { text: string; axis: Axis; options: string[]; correct?: number; reverse?: boolean; note?: string };
const scale = ["はい", "どちらかといえばはい", "どちらかといえばいいえ", "いいえ"];
const questions: Question[] = [
  { text:"家庭のCO2削減で一番効果があるのは？", axis:"K", options:["家中の電球をLEDに変える","車移動を週2回やめて自転車にする","再エネ100%の電力プランに切り替える","エアコンの設定温度を1℃緩める"], correct:2 },
  { text:"再エネ発電の説明として「ウソ」はどれ？", axis:"K", options:["太陽光や風力は、天候に左右される","地熱発電は、天候に左右されにくい","バイオマス発電は燃やしてもCO2はでない","水力発電はCO2を出さないエネルギー"], correct:2 },
  { text:"牛のゲップでCO2の次に危険な温暖化ガスは？", axis:"K", options:["メタン","フロン","一酸化二窒素","オゾン"], correct:0 },
  { text:"日本のCO2排出源で割合が一番多いのは？", axis:"K", options:["運輸（自動車、飛行機など）","産業（工場など）","エネルギー転換（発電所など）","家庭"], correct:2 },
  { text:"パリ協定の「気温上昇」目標は？", axis:"K", options:["2℃より低く、1.5℃を目指す","1.5℃より低く、1.0℃を目指す","2000年比で0.5℃まで","具体的な数値目標はない"], correct:0 },
  { text:"温暖化対策で「適応策」（備える行動）はどれ？", axis:"K", options:["植林をする","ハザードマップを確認する","省エネ家電に買い替える","自転車通勤をする"], correct:1 },
  { text:"CO2排出が少ないのはどっち？", axis:"K", options:["外国から空輸のオーガニック野菜","地元のふつうの野菜"], correct:1 },
  { text:"リサイクル商品が本当にエコか判断するための基準はどれ？", axis:"K", options:["製造時のエネルギー量","どれだけ長く使えるか（耐久性）","どこで、誰が作っているか","上記全て"], correct:3 },
  { text:"カーボンオフセットという言葉の意味を知っている？", axis:"J", options:scale },
  { text:"オフセット商品を買えば他のムダ遣いはチャラになる", axis:"J", options:scale, reverse:true },
  { text:"心を動かされる記事はどっち？", axis:"J", options:["最新データと経済への影響","シロクマ親子の苦悩"] },
  { text:"解決すべきはどっち？", axis:"J", options:["未来の世代との不公平","今、苦しむ人々との不公平"] },
  { text:"使ってない部屋の電気はすぐ消す？", axis:"A", options:scale },
  { text:"歯磨き中に水は止めてる？", axis:"A", options:scale },
  { text:"冷蔵庫の中身を把握して食材を使い切ってる？", axis:"A", options:scale },
  { text:"正しいゴミの分別を行っている？", axis:"A", options:scale },
  { text:"徒歩15分の道は車を使わず自転車か歩く？", axis:"A", options:scale },
  { text:"エアコンの設定温度（夏28℃／冬20℃）にしている？", axis:"A", options:scale },
  { text:"家電を買うなら高価でも省エネ性能が良いものを選ぶ？", axis:"P", options:scale },
  { text:"自宅の電気契約は再エネ効率の高いプラン？", note:"再エネ＝再生可能エネルギー", axis:"P", options:scale },
  { text:"車を買うならEVかハイブリッド車がいい？", note:"EV＝電気自動車", axis:"P", options:scale },
  { text:"移動するときは、できるだけ公共交通機関を選ぶ？", axis:"P", options:scale },
  { text:"もし投資するなら環境に良い会社（ESG投資）を選ぶ？", note:"ESG＝Environmental・Social・Governance", axis:"P", options:scale },
  { text:"環境のためにお肉（特に牛肉）を食事から減らしてる？", axis:"P", options:scale },
  { text:"友人が誤ったエコ情報を話してる。どうする？", axis:"C", options:["スルーする","後でこっそり教える","その場で訂正する"] },
  { text:"日常から環境問題について家族や友人と話す？", axis:"C", options:scale },
  { text:"環境問題の投稿にコメントやシェアで反応する？", axis:"C", options:scale },
  { text:"環境改善活動の署名や寄付、ボランティアに参加したことがある？", axis:"C", options:scale },
  { text:"商品を買う時あえて環境に良い会社を選ぶ？", axis:"C", options:scale },
  { text:"環境に悪い会社の商品は買わないようにしている？", axis:"C", options:scale },
];

const axisMeta: Record<Axis, { label: string; color: string }> = {
  J: { label: "見極力", color: "#168bdc" },
  A: { label: "行動力", color: "#7b18f6" },
  P: { label: "備力", color: "#f57900" },
  C: { label: "協働力", color: "#e8cf00" },
  K: { label: "知識力", color: "#00b94f" },
};

const families = {
  J: { name: "分析型", color: "#168bdc", lead: "情報を冷静に読み解く" },
  A: { name: "堅実型", color: "#7b18f6", lead: "日々の行動を積み重ねる" },
  P: { name: "革命型", color: "#f57900", lead: "未来を見据えて変化を起こす" },
  C: { name: "共感型", color: "#e8cf00", lead: "人とつながり輪を広げる" },
} as const;

const names: Record<string, string> = {
  JS: "エンバイロ博士", JA: "エコフクロウ", JB: "環境会計士", JC: "サステナ中学生",
  AS: "CO2CO2職人", AA: "コマメキーパー", AB: "リユースビーバー", AC: "見習い分別アリ",
  PS: "地球先導者", PA: "リサイクルダンサー", PB: "ハイブリッド団長", PC: "エコドラゴンの卵",
  CS: "バイオマスエンジェル", CA: "カーボン神父", CB: "スナック「ECO」のママ", CC: "おすそわけベイビー",
};

const descriptions: Record<keyof typeof families, string> = {
  J: "環境に関する「知識力」と、その裏に隠された真実を冷静に見抜く「見極力」を兼ね備えています。感情論やグリーンウォッシュに惑わされず、社会が進むべき合理的で効果的な道筋を照らす羅針盤です。",
  A: "環境に関する知識を、毎日の小さな選択へ着実に変える「行動力」の持ち主です。無理なく続く習慣を積み重ね、身近な場所から確かな変化を生み出しています。",
  P: "未来を見通す知識と、新しい仕組みを選び取る力を持っています。変化を恐れず一歩先の選択を続ける姿が、社会の大きな転換を後押しします。",
  C: "環境への思いを人に伝え、仲間と力を合わせることが得意です。あなたの共感と声かけが周囲を動かし、やがて大きなアクションの輪へ育っていきます。",
};

const emptyScores = (): Scores => ({ J: 0, A: 0, P: 0, C: 0, K: 0 });

function rank(score: number) {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 50) return "B";
  return "C";
}

export default function Home() {
  const [screen, setScreen] = useState<"home" | "quiz" | "result">("home");
  const [answers, setAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const result = useMemo(() => {
    const totals = emptyScores();
    const counts = emptyScores();
    questions.forEach((q, i) => {
      const selected = answers[i] ?? q.options.length - 1;
      let raw = q.correct === undefined
        ? (q.options.length === 2 ? (selected === 0 ? 4 : 1) : q.options.length === 3 ? [1, 3, 4][selected] : 4 - selected)
        : (selected === q.correct ? 4 : 0);
      if (q.reverse) raw = 5 - raw;
      totals[q.axis] += raw;
      counts[q.axis] += 1;
    });
    const scores = emptyScores();
    (Object.keys(scores) as Axis[]).forEach((key) => {
      scores[key] = Math.round((totals[key] / (counts[key] * 4)) * 100);
    });
    const main = (["J", "A", "P", "C"] as const).reduce((a, b) => scores[a] >= scores[b] ? a : b);
    const grade = rank(scores.K);
    const code = `${main}${grade}`;
    return { scores, main, grade, code, name: names[code] };
  }, [answers]);

  const answerAt = (questionIndex: number, value: number) => {
    const next = [...answers];
    next[questionIndex] = value;
    setAnswers(next);
  };

  const restart = () => { setAnswers([]); setScreen("home"); };

  const saveResultImage = async () => {
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const family = families[result.main];
      ctx.fillStyle = family.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,.12)";
      for (let x = 0; x < canvas.width; x += 54) ctx.fillRect(x, 0, 2, canvas.height);
      for (let y = 0; y < canvas.height; y += 54) ctx.fillRect(0, y, canvas.width, 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "700 42px sans-serif";
      ctx.fillText("あなたの ECO タイプは…", 540, 88);
      ctx.font = "800 70px sans-serif";
      ctx.fillText(result.name, 540, 170);
      ctx.font = "800 44px sans-serif";
      ctx.fillText(`${result.code}  ｜  知識力 ${result.scores.K}点`, 540, 235);

      const character = new Image();
      character.src = `./characters/${result.code.toLowerCase()}.png`;
      await new Promise<void>((resolve) => { character.onload = () => resolve(); character.onerror = () => resolve(); });
      if (character.naturalWidth) {
        const ratio = Math.min(470 / character.naturalWidth, 420 / character.naturalHeight);
        const width = character.naturalWidth * ratio;
        const height = character.naturalHeight * ratio;
        ctx.drawImage(character, (1080 - width) / 2, 270, width, height);
      }

      ctx.fillStyle = "rgba(255,255,255,.94)";
      ctx.beginPath();
      ctx.roundRect(90, 710, 900, 500, 34);
      ctx.fill();
      ctx.textAlign = "left";
      const axes: Axis[] = ["K", "J", "A", "P", "C"];
      axes.forEach((axis, index) => {
        const y = 770 + index * 82;
        ctx.fillStyle = "#153d24";
        ctx.font = "700 31px sans-serif";
        ctx.fillText(`${axis}  ${axisMeta[axis].label}`, 140, y + 27);
        ctx.fillStyle = "#dfe8e1";
        ctx.fillRect(350, y, 520, 32);
        ctx.fillStyle = axisMeta[axis].color;
        ctx.fillRect(350, y, 520 * result.scores[axis] / 100, 32);
        ctx.fillStyle = "#153d24";
        ctx.font = "800 29px sans-serif";
        ctx.fillText(`${result.scores[axis]}点`, 890, y + 27);
      });
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "700 28px sans-serif";
      ctx.fillText("ECOタイプ全国調査", 540, 1295);
      const link = document.createElement("a");
      link.download = `eco-type-${result.code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={`site-shell screen-${screen}`}>
      {screen === "home" && (
        <section className="thumbnail">
          <img src="./thumbnail-latest.png" alt="ECOタイプ全国調査。あなたのなんとなくやっているエコ活動を、遊び感覚で答え合わせできる自己診断ツール" />
          <button className="thumbnail-start" onClick={() => setScreen("quiz")} aria-label="回答する" />
        </section>
      )}

      {screen === "quiz" && (
        <section className="quiz panel-enter">
          <div className="quiz-intro">
            <img className="quiz-logo" src="./eco-logo-figma.png" alt="ECOタイプ全国調査" />
            <img className="quiz-overview" src="./quiz-intro-figma.png" alt="5つの力を分析し、全18タイプに分類する自己診断ツール" />
            <div className="start-divider"><span>問題開始</span></div>
          </div>
          <div className="questions-stack">
            {questions.map((question, questionIndex) => (
              <div className="question-wrap" key={question.text}>
                {[0,10,20,25,29].includes(questionIndex) && <div className="remaining"><small>{questionIndex === 29 ? "LAST" : "残り"}</small>{questionIndex === 29 ? null : <><b>{questions.length - questionIndex}</b><em>問</em></>}</div>}
                <div className="question-card" style={{ minHeight: question.options.length === 2 ? 190 : question.options.length === 3 ? 230 : 270 }}>
                  <span className="question-number">Q{questionIndex + 1}</span>
                  <h2>{question.text}</h2>
                  {question.note && <p className="question-note">※{question.note}</p>}
                  <div className="answer-list">
                    {question.options.map((option, n) => <button className={answers[questionIndex] === n ? "selected" : ""} key={option} onClick={() => answerAt(questionIndex, n)}><i />{option}</button>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="show-result" disabled={answers.filter((answer) => answer !== undefined).length !== questions.length} onClick={() => setScreen("result")}>診断結果を見る</button>
          {answers.filter((answer) => answer !== undefined).length !== questions.length && <p className="unanswered">あと{questions.length - answers.filter((answer) => answer !== undefined).length}問です</p>}
        </section>
      )}

      {screen === "result" && (
        <section className="result panel-enter" style={{ "--family": families[result.main].color } as React.CSSProperties}>
          <p className="result-intro">あなたの <b>ECO</b> タイプは…</p>
          <h1>{result.name}</h1>
          <div className="result-code"><span>RANK<b>{result.grade}</b></span><strong>{result.scores.K}<small>点</small></strong></div>
          <img className="character" src={`./characters/${result.code.toLowerCase()}.png`} alt={result.name} />
          <div className="score-bars" aria-label="5つの項目の得点">
            {(Object.keys(axisMeta) as Axis[]).sort((a, b) => result.scores[a] - result.scores[b]).map((axis, index) => (
              <div className={`score-row ${index === 0 ? "challenge" : ""}`} key={axis}>
                <span><b>{axis}</b>{axisMeta[axis].label}</span>
                <i><em style={{ width: `${result.scores[axis]}%`, background: axisMeta[axis].color }} /></i>
                <strong>{result.scores[axis]}</strong>
              </div>
            ))}
            <p>課題が大きい項目から表示しています</p>
          </div>
          <p className="result-copy">{descriptions[result.main]}</p>
          <div className="actions"><button className="result-next" onClick={saveResultImage} disabled={saving}>{saving ? "画像を作成中…" : "結果画像を保存"}</button><button className="result-restart" onClick={restart}>もう一度診断する</button></div>
        </section>
      )}

      {screen === "quiz" && <footer>SETAGAYA × ECO TYPE PROJECT</footer>}
    </main>
  );
}
