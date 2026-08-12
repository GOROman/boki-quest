"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Question = {
  category: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  journal: string;
};

const questions: Question[] = [
  { category: "現金・預金", prompt: "商品を現金 ¥30,000 で仕入れた。正しい仕訳は？", choices: ["（借）仕入 30,000 ／（貸）現金 30,000", "（借）現金 30,000 ／（貸）仕入 30,000", "（借）商品 30,000 ／（貸）売上 30,000", "（借）売上 30,000 ／（貸）現金 30,000"], answer: 0, explanation: "商品を仕入れたときは費用の「仕入」が増加するため借方。現金の減少は貸方です。", journal: "仕入 30,000｜現金 30,000" },
  { category: "売掛金", prompt: "商品 ¥50,000 を掛けで売り上げた。正しい仕訳は？", choices: ["（借）売上 50,000 ／（貸）売掛金 50,000", "（借）売掛金 50,000 ／（貸）売上 50,000", "（借）現金 50,000 ／（貸）売上 50,000", "（借）仕入 50,000 ／（貸）買掛金 50,000"], answer: 1, explanation: "代金を後で受け取る権利「売掛金」は資産なので増加を借方、収益の「売上」は貸方に記入します。", journal: "売掛金 50,000｜売上 50,000" },
  { category: "固定資産", prompt: "備品 ¥120,000 を購入し、代金は普通預金から支払った。正しい仕訳は？", choices: ["（借）消耗品費 120,000 ／（貸）現金 120,000", "（借）普通預金 120,000 ／（貸）備品 120,000", "（借）備品 120,000 ／（貸）普通預金 120,000", "（借）仕入 120,000 ／（貸）買掛金 120,000"], answer: 2, explanation: "長期間使用する備品は資産。資産の増加を借方、普通預金の減少を貸方にします。", journal: "備品 120,000｜普通預金 120,000" },
  { category: "経費", prompt: "今月分の店舗家賃 ¥80,000 を現金で支払った。借方科目は？", choices: ["支払家賃", "受取家賃", "前払金", "未払金"], answer: 0, explanation: "店舗の家賃は費用の「支払家賃」。費用の発生は借方に記入します。", journal: "支払家賃 80,000｜現金 80,000" },
  { category: "買掛金", prompt: "買掛金 ¥45,000 を普通預金から支払った。正しい仕訳は？", choices: ["（借）仕入 45,000 ／（貸）普通預金 45,000", "（借）普通預金 45,000 ／（貸）買掛金 45,000", "（借）買掛金 45,000 ／（貸）普通預金 45,000", "（借）未払金 45,000 ／（貸）現金 45,000"], answer: 2, explanation: "負債である買掛金の減少は借方。普通預金という資産の減少は貸方です。", journal: "買掛金 45,000｜普通預金 45,000" },
  { category: "資本金", prompt: "開業にあたり、元入れとして現金 ¥500,000 を出資した。貸方科目は？", choices: ["売上", "借入金", "資本金", "現金"], answer: 2, explanation: "事業主からの出資は純資産の「資本金」。純資産の増加は貸方です。", journal: "現金 500,000｜資本金 500,000" },
  { category: "借入金", prompt: "銀行から ¥300,000 を借り入れ、普通預金口座に入金された。正しい仕訳は？", choices: ["（借）普通預金 300,000 ／（貸）借入金 300,000", "（借）借入金 300,000 ／（貸）普通預金 300,000", "（借）現金 300,000 ／（貸）資本金 300,000", "（借）貸付金 300,000 ／（貸）普通預金 300,000"], answer: 0, explanation: "普通預金（資産）と借入金（負債）が同時に増加します。資産は借方、負債は貸方です。", journal: "普通預金 300,000｜借入金 300,000" },
  { category: "決算整理", prompt: "期末に備品の減価償却費 ¥20,000 を計上する（間接法）。貸方科目は？", choices: ["備品", "減価償却費", "備品減価償却累計額", "未払金"], answer: 2, explanation: "間接法では、費用の減価償却費を借方、資産の控除科目である減価償却累計額を貸方にします。", journal: "減価償却費 20,000｜備品減価償却累計額 20,000" },
  { category: "試算表", prompt: "合計試算表で、借方合計と貸方合計の関係として正しいものは？", choices: ["必ず借方が大きい", "必ず貸方が大きい", "原則として一致する", "決算時だけ一致しない"], answer: 2, explanation: "複式簿記では一つの取引を同額で借方・貸方に記録するため、合計は一致します。", journal: "借方合計 ＝ 貸方合計" },
  { category: "貸倒れ", prompt: "得意先の倒産により、売掛金 ¥15,000 が回収不能となった（貸倒引当金なし）。正しい借方科目は？", choices: ["貸倒損失", "貸倒引当金", "売掛金", "雑収入"], answer: 0, explanation: "引当金がない場合、回収不能額は費用の「貸倒損失」として借方に計上します。", journal: "貸倒損失 15,000｜売掛金 15,000" },
];

const letters = ["A", "B", "C", "D"];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [fx, setFx] = useState<"correct" | "wrong" | "">("");
  const audioRef = useRef<AudioContext | null>(null);
  const q = questions[index];

  useEffect(() => { setBest(Number(localStorage.getItem("boki-quest-best") || 0)); }, []);
  const rank = useMemo(() => score >= 1100 ? "S" : score >= 850 ? "A" : score >= 600 ? "B" : "C", [score]);

  function playSound(kind: "tap" | "correct" | "wrong" | "finish") {
    if (!soundOn || typeof window === "undefined") return;
    const ctx = audioRef.current ?? new AudioContext();
    audioRef.current = ctx;
    void ctx.resume();
    const notes = kind === "correct" ? [523, 659, 784] : kind === "finish" ? [523, 659, 784, 1047] : kind === "wrong" ? [220, 165] : [440];
    notes.forEach((frequency, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * (kind === "finish" ? .11 : .07);
      const duration = kind === "wrong" ? .16 : .12;
      oscillator.type = kind === "wrong" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      if (kind === "wrong") oscillator.frequency.exponentialRampToValueAtTime(frequency * .72, start + duration);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === "finish" ? .09 : .065, start + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .02);
    });
  }

  function choose(choice: number) {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === q.answer) {
      playSound("correct");
      const gained = 100 + streak * 20;
      setScore((s) => s + gained);
      setStreak((s) => s + 1);
      setCorrectCount((c) => c + 1);
      setFx("correct");
    } else {
      playSound("wrong");
      setStreak(0);
      setLives((l) => Math.max(0, l - 1));
      setFx("wrong");
    }
    window.setTimeout(() => setFx(""), 700);
  }

  function next() {
    if (index === questions.length - 1 || lives === 0) {
      playSound("finish");
      const finalScore = score;
      if (finalScore > best) { setBest(finalScore); localStorage.setItem("boki-quest-best", String(finalScore)); }
      setFinished(true);
    } else { playSound("tap"); setIndex((i) => i + 1); setSelected(null); }
  }

  function restart() { playSound("tap"); setStarted(true); setFinished(false); setIndex(0); setSelected(null); setScore(0); setStreak(0); setLives(3); setCorrectCount(0); setFx(""); }

  if (!started) return (
    <main className="titleScreen">
      <img className="titleKeyArt" src="./boki-quest-key-art.png" alt="BOKI QUESTと案内役の簿記ちゃん" />
      <div className="titleVignette"></div>
      <header className="titleHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST <small>日商簿記3級</small></span></div><button className="soundToggle" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪ ON" : "♪ OFF"}</button></header>
      <div className="mobileGameTitle"><b>BOKI QUEST</b><span>講義のすきまに、簿記力をちょっとずつ。</span></div>
      <section className="startDock">
        <div className="startInfo"><span>MY BEST <b>{best.toLocaleString()}</b></span><span>10 QUESTIONS</span><span>ABOUT 5 MIN</span></div>
        <button className="startButton" onClick={restart}><i>▶</i><span>GAME START<small>簿記ちゃんとクエストへ</small></span></button>
        <p>タップしてスタート</p>
      </section>
    </main>
  );

  if (finished) return (
    <main className="resultPage resultGameScreen">
      <div className="confetti" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{"--x":`${(i*37)%100}%`,"--d":`${(i%7)*.12}s`,"--r":`${(i*47)%180}deg`} as React.CSSProperties}></i>)}</div>
      <header className="resultHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><span>RESULT</span></header>
      <div className="resultCharacter"><img src="./boki-quest-key-art.png" alt="クリアを祝う簿記ちゃん"/><span>{lives === 0 ? "次はもっといけるよ！" : rank === "S" ? "完璧！さすがだね♡" : "おつかれさま！すごいよ♡"}</span></div>
      <section className="resultCard"><div className="resultLabel">QUEST COMPLETE</div><div className="rank">{rank}</div><h1>{lives === 0 ? "また挑戦しよう！" : "ステージクリア！"}</h1><p>今回のスコア</p><strong className="finalScore">{score.toLocaleString()}</strong><div className="resultStats"><span>正解数<b>{correctCount} / {index + 1}</b></span><span>ベストスコア<b>{Math.max(best, score).toLocaleString()}</b></span></div><button className="primary" onClick={restart}>もう一度挑戦する <span>↻</span></button><button className="backTitle" onClick={() => {playSound("tap");setStarted(false);setFinished(false);}}>タイトルへ戻る</button></section>
    </main>
  );

  const correct = selected === q.answer;
  return (
    <main className={`gamePage ${fx ? `fx-${fx}` : ""}`}>
      {fx === "correct" && <div className="answerBurst" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{"--a":`${i*25.7}deg`} as React.CSSProperties}>✦</i>)}</div>}
      <header className="gameHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><div className="hud"><span>SCORE <b>{score.toLocaleString()}</b>{fx === "correct" && <em className="scorePop">+{100 + (streak - 1) * 20}</em>}</span><span>STREAK <b>{streak}×</b></span><span className="lives" aria-label={`ライフ ${lives}`}>{[0,1,2].map(i => <i key={i} className={i < lives ? "on" : ""}>♥</i>)}</span><button className="soundToggle compact" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪" : "×"}</button></div></header>
      <div className="progress"><i style={{width: `${((index + 1) / questions.length) * 100}%`}}></i></div>
      <section className="quiz" key={index}>
        <div className="questionMeta"><span>QUESTION {String(index + 1).padStart(2,"0")} / {questions.length}</span><b>♡ {q.category}</b></div>
        <h1>{q.prompt}</h1>
        <div className="choices">{q.choices.map((choice, i) => {
          const state = selected === null ? "" : i === q.answer ? "correct" : i === selected ? "wrong" : "dim";
          return <button key={choice} className={state} onClick={() => choose(i)} disabled={selected !== null}><span>{letters[i]}</span>{choice}<i>{state === "correct" ? "✓" : state === "wrong" ? "×" : ""}</i></button>;
        })}</div>
        {selected !== null && <div className={`feedback ${correct ? "good" : "bad"}`} role="status"><div className="feedbackTitle"><span>{correct ? "✓" : "!"}</span><b>{correct ? `すごい、正解！ ${100 + (streak - 1) * 20} pt` : "大丈夫。ここで覚えればOK！"}</b></div><p>{q.explanation}</p><div className="journal"><small>簿記ちゃんメモ</small>{q.journal}</div><button onClick={next}>{index === questions.length - 1 || lives === 0 ? "結果を見る" : "次の問題へ"} →</button></div>}
      </section>
      <aside className={`gameMascot ${selected === null ? "neutral" : correct ? "correct" : "wrong"}`} aria-live="polite">
        <span className="mascotTalk">{selected === null ? "焦らずいこう♪" : correct ? "大正解！さすが♡" : "大丈夫、次で取り返そう！"}</span>
        <div className="mascotCrop"><img src="./boki-chan-character-sheet.png" alt={selected === null ? "応援する簿記ちゃん" : correct ? "正解を喜ぶ簿記ちゃん" : "一緒に考える簿記ちゃん"}/></div>
      </aside>
      <footer className="gameFooter"><span>簿記ちゃんヒント：資産・費用の増加は借方、負債・純資産・収益の増加は貸方</span><button onClick={() => setStarted(false)}>ホームへ</button></footer>
    </main>
  );
}
