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
  JS: "エコ博士", JA: "ブルーオウル", JB: "グリーン教授", JC: "みきわめボーイ",
  AS: "ハイブリット団長", AA: "バイオマスゴリラ", AB: "森のビーバー", AC: "リサイクル星人",
  PS: "リボンナイト", PA: "サーキュラー紳士", PB: "エコファイター", PC: "エコドラゴンの卵",
  CS: "バイオマスエンジェル", CA: "リーフ伯爵", CB: "サステナ優等生", CC: "エコベイビー",
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
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

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

  const answer = (value: number) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    if (index === questions.length - 1) setScreen("result");
    else setIndex(index + 1);
  };

  const restart = () => { setAnswers([]); setIndex(0); setScreen("home"); };

  return (
    <main className="site-shell">
      <div className="stripe stripe-top" />
      <header className="brand"><span>ECO</span><small>タイプ<br />全国調査</small></header>

      {screen === "home" && (
        <section className="hero panel-enter">
          <div className="eyebrow">あなたの「なんとなく」を答え合わせ</div>
          <h1>あなたの<br /><em>ECOタイプ</em>は？</h1>
          <p className="lead">エコの知識と行動の傾向が、<br />遊び感覚でわかる自己診断ツール。</p>
          <div className="power-row" aria-label="診断する5つの力">
            {(Object.keys(axisMeta) as Axis[]).map((key) => <span key={key} style={{ "--axis": axisMeta[key].color } as React.CSSProperties}><b>{key}</b>{axisMeta[key].label}</span>)}
          </div>
          <button className="primary" onClick={() => setScreen("quiz")}>診断をはじめる <span>→</span></button>
          <p className="note">全30問・約5分</p>
        </section>
      )}

      {screen === "quiz" && (
        <section className="quiz panel-enter">
          <div className="progress-head"><span>QUESTION {String(index + 1).padStart(2, "0")}</span><span>{index + 1} / {questions.length}</span></div>
          <div className="progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
          <div className="question-card">
            <span className="question-axis" style={{ color: axisMeta[questions[index].axis].color }}>{questions[index].axis} / {axisMeta[questions[index].axis].label}</span>
            <h2>{questions[index].text}</h2>
            {questions[index].note && <p className="question-note">※{questions[index].note}</p>}
            <div className="answer-list">
              {questions[index].options.map((option, n) => <button key={option} onClick={() => answer(n)}><i />{option}</button>)}
            </div>
          </div>
          {index > 0 && <button className="back" onClick={() => setIndex(index - 1)}>← 前の質問へ</button>}
        </section>
      )}

      {screen === "result" && (
        <section className="result panel-enter" style={{ "--family": families[result.main].color } as React.CSSProperties}>
          <p className="result-intro">あなたのECOタイプは…</p>
          <div className="result-code"><span>RANK</span><b>{result.code}</b><strong>{result.scores.K}<small>点</small></strong></div>
          <p className="family-name">{families[result.main].name}</p>
          <h1>{result.name}</h1>
          <div className="character-placeholder" aria-label="キャラクター画像の配置予定地">
            <span>{result.code}</span><small>CHARACTER<br />COMING SOON</small>
          </div>
          <p className="result-copy">{families[result.main].lead}力と、環境に関する知識をあわせ持つタイプです。あなたが何気なく続けている行動は、社会を少しずつ前へ進めています。</p>
          <div className="score-grid">
            {(Object.keys(result.scores) as Axis[]).map((key) => (
              <div key={key}><div><span>{key}</span><small>{axisMeta[key].label}</small><b>{result.scores[key]}</b></div><i><em style={{ width: `${result.scores[key]}%`, background: axisMeta[key].color }} /></i></div>
            ))}
          </div>
          <div className="actions"><button className="primary" onClick={restart}>もう一度診断する</button><button className="share" onClick={() => navigator.clipboard?.writeText(`私のECOタイプは「${result.name}（${result.code}）」でした！`)}>結果をコピー</button></div>
        </section>
      )}

      <footer>SETAGAYA × ECO TYPE PROJECT</footer>
      <div className="stripe stripe-bottom" />
    </main>
  );
}
