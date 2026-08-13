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

type Lesson = {
  title: string;
  goal: string;
  rule: string;
  example: string;
  tip: string;
};

const lessons: Lesson[] = [
  { title:"仕訳の第一歩", goal:"借方と貸方の位置を覚えよう", rule:"仕訳は左が借方、右が貸方。左右の金額は必ず同じになります。", example:"（借）仕入 30,000 ／（貸）現金 30,000", tip:"まずは『左＝借、右＝貸』だけ覚えればOK！" },
  { title:"資産と収益", goal:"売掛金と売上の違いを理解しよう", rule:"売掛金は後で代金を受け取る権利＝資産。売上はもうけの原因＝収益です。", example:"（借）売掛金 50,000 ／（貸）売上 50,000", tip:"資産の増加は左、収益の増加は右です。" },
  { title:"固定資産", goal:"長く使うものの仕訳を学ぼう", rule:"机やパソコンなど長期間使うものは、費用ではなく『備品』という資産です。", example:"（借）備品 120,000 ／（貸）普通預金 120,000", tip:"すぐ使い切る？長く使う？で考えよう。" },
  { title:"費用の発生", goal:"家賃などの経費を仕訳しよう", rule:"家賃や水道光熱費など、事業のために使った金額は費用。費用の発生は借方です。", example:"（借）支払家賃 80,000 ／（貸）現金 80,000", tip:"費用が増えたら左側！" },
  { title:"負債の減少", goal:"買掛金を支払う仕訳を覚えよう", rule:"買掛金は後で代金を払う義務＝負債。支払うと義務が減るので借方です。", example:"（借）買掛金 45,000 ／（貸）普通預金 45,000", tip:"負債は増加が右、減少が左です。" },
  { title:"純資産", goal:"資本金の意味を理解しよう", rule:"事業を始めるために出資した元手は『資本金』。純資産の増加は貸方です。", example:"（借）現金 500,000 ／（貸）資本金 500,000", tip:"自分で用意した元手は借金ではありません。" },
  { title:"借入金", goal:"資産と負債の同時増加を学ぼう", rule:"銀行から借りると預金という資産と、返済義務である借入金が同時に増えます。", example:"（借）普通預金 300,000 ／（貸）借入金 300,000", tip:"お金が増えても、同時に返す義務も増えます。" },
  { title:"減価償却", goal:"固定資産を期間配分しよう", rule:"備品の取得額は、使う期間に分けて費用にします。間接法では累計額を貸方に記入します。", example:"（借）減価償却費 20,000 ／（貸）備品減価償却累計額 20,000", tip:"今年使った分だけを費用にするイメージ。" },
  { title:"試算表", goal:"複式簿記のチェック方法を学ぼう", rule:"すべての仕訳は借方と貸方が同額なので、試算表でも双方の合計は一致します。", example:"借方合計 ＝ 貸方合計", tip:"一致しなければ、どこかに記入ミスがあります。" },
  { title:"貸倒れ", goal:"回収できない売掛金を処理しよう", rule:"売掛金が回収不能になり、引当金がなければ『貸倒損失』という費用にします。", example:"（借）貸倒損失 15,000 ／（貸）売掛金 15,000", tip:"最後のテスト！損失は費用なので借方です。" },
];

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
  const [phase, setPhase] = useState<"study" | "test">("study");
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [fx, setFx] = useState<"correct" | "wrong" | "">("");
  const audioRef = useRef<AudioContext | null>(null);
  const q = questions[index];
  const lesson = lessons[index];

  useEffect(() => { setBest(Number(localStorage.getItem("boki-quest-best") || 0)); }, []);
  const rank = useMemo(() => mistakes === 0 ? "S" : mistakes <= 2 ? "A" : mistakes <= 5 ? "B" : "C", [mistakes]);

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
      setScore((s) => s + 100);
      setCorrectCount((c) => c + 1);
      setFx("correct");
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setFx("wrong");
    }
    window.setTimeout(() => setFx(""), 700);
  }

  function next() {
    if (selected !== q.answer) {
      playSound("tap");
      setPhase("study");
      setSelected(null);
      return;
    }
    if (index === questions.length - 1) {
      playSound("finish");
      const finalScore = score + 100;
      if (finalScore > best) { setBest(finalScore); localStorage.setItem("boki-quest-best", String(finalScore)); }
      setFinished(true);
    } else { playSound("tap"); setIndex((i) => i + 1); setSelected(null); setPhase("study"); }
  }

  function restart() { playSound("tap"); setStarted(true); setFinished(false); setIndex(0); setPhase("study"); setSelected(null); setScore(0); setMistakes(0); setCorrectCount(0); setFx(""); }

  if (!started) return (
    <main className="titleScreen">
      <img className="titleKeyArt" src="./boki-quest-key-art.png" alt="BOKI QUESTと案内役の簿記ちゃん" />
      <div className="titleVignette"></div>
      <header className="titleHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST <small>日商簿記3級</small></span></div><button className="soundToggle" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪ ON" : "♪ OFF"}</button></header>
      <div className="mobileGameTitle"><b>BOKI QUEST</b><span>講義のすきまに、簿記力をちょっとずつ。</span></div>
      <section className="startDock">
        <div className="startInfo"><span>MY BEST <b>{best.toLocaleString()}</b></span><span>10 LEVELS</span><span>STUDY ＋ TEST</span></div>
        <button className="startButton" onClick={restart}><i>▶</i><span>GAME START<small>簿記ちゃんとクエストへ</small></span></button>
        <p>タップしてスタート</p>
      </section>
    </main>
  );

  if (finished) return (
    <main className="resultPage resultGameScreen">
      <div className="confetti" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{"--x":`${(i*37)%100}%`,"--d":`${(i%7)*.12}s`,"--r":`${(i*47)%180}deg`} as React.CSSProperties}></i>)}</div>
      <header className="resultHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><span>RESULT</span></header>
      <div className="resultCharacter"><img src="./boki-quest-key-art.png" alt="クリアを祝う簿記ちゃん"/><span>{rank === "S" ? "全問一発クリア！完璧♡" : "レベル10クリア、おめでとう♡"}</span></div>
      <section className="resultCard"><div className="resultLabel">LEVEL 10 COMPLETE</div><div className="rank">{rank}</div><h1>コースクリア！</h1><p>習得スコア</p><strong className="finalScore">{score.toLocaleString()}</strong><div className="resultStats"><span>クリアレベル<b>{correctCount} / 10</b></span><span>復習回数<b>{mistakes} 回</b></span></div><button className="primary" onClick={restart}>もう一度学ぶ <span>↻</span></button><button className="backTitle" onClick={() => {playSound("tap");setStarted(false);setFinished(false);}}>タイトルへ戻る</button></section>
    </main>
  );

  const correct = selected === q.answer;
  if (phase === "study") return (
    <main className="gamePage studyPage">
      <header className="gameHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><div className="hud"><span>LEVEL <b>{index + 1} / 10</b></span><span>SCORE <b>{score.toLocaleString()}</b></span><button className="soundToggle compact" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪" : "×"}</button></div></header>
      <div className="levelRail" aria-label={`レベル${index + 1}`}>
        {lessons.map((item,i)=><i key={item.title} className={i < index ? "done" : i === index ? "current" : ""}><span>{i < index ? "✓" : i + 1}</span></i>)}
      </div>
      <section className="lessonCard">
        <div className="phaseBadge study">STUDY PHASE</div>
        <p className="levelLabel">LEVEL {String(index + 1).padStart(2,"0")}</p>
        <h1>{lesson.title}</h1>
        <h2>{lesson.goal}</h2>
        <div className="lessonRule"><small>今日の基本</small><p>{lesson.rule}</p></div>
        <div className="lessonExample"><small>仕訳例</small><strong>{lesson.example}</strong></div>
        <div className="lessonTip">♡ 簿記ちゃんメモ　{lesson.tip}</div>
        <button className="lessonStart" onClick={() => {playSound("tap");setPhase("test");}}>テストに挑戦 <span>→</span></button>
      </section>
      <aside className="studyMascot"><span>ここを覚えれば<br/><b>テストもばっちり！</b></span><div><img src="./boki-chan-character-sheet.png" alt="ポイントを教える簿記ちゃん"/></div></aside>
      <footer className="gameFooter"><span>勉強フェーズで基本を覚えて、テストフェーズでレベルアップ！</span><button onClick={() => setStarted(false)}>ホームへ</button></footer>
    </main>
  );

  return (
    <main className={`gamePage ${fx ? `fx-${fx}` : ""}`}>
      {fx === "correct" && <div className="answerBurst" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{"--a":`${i*25.7}deg`} as React.CSSProperties}>✦</i>)}</div>}
      <header className="gameHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><div className="hud"><span>LEVEL <b>{index + 1} / 10</b></span><span>SCORE <b>{score.toLocaleString()}</b>{fx === "correct" && <em className="scorePop">+100</em>}</span><span>REVIEW <b>{mistakes}</b></span><button className="soundToggle compact" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪" : "×"}</button></div></header>
      <div className="progress"><i style={{width: `${((index + 1) / questions.length) * 100}%`}}></i></div>
      <section className="quiz" key={index}>
        <div className="questionMeta"><span><i className="phaseBadge test">TEST PHASE</i> LEVEL {String(index + 1).padStart(2,"0")}</span><b>♡ {q.category}</b></div>
        <h1>{q.prompt}</h1>
        <div className="choices">{q.choices.map((choice, i) => {
          const state = selected === null ? "" : i === q.answer ? "correct" : i === selected ? "wrong" : "dim";
          return <button key={choice} className={state} onClick={() => choose(i)} disabled={selected !== null}><span>{letters[i]}</span>{choice}<i>{state === "correct" ? "✓" : state === "wrong" ? "×" : ""}</i></button>;
        })}</div>
        {selected !== null && <div className={`feedback ${correct ? "good" : "bad"}`} role="status"><div className="feedbackTitle"><span>{correct ? "✓" : "!"}</span><b>{correct ? "LEVEL CLEAR！ +100 pt" : "もう一度勉強フェーズで復習しよう"}</b></div><p>{q.explanation}</p><div className="journal"><small>簿記ちゃんメモ</small>{q.journal}</div><button onClick={next}>{correct ? (index === questions.length - 1 ? "コース結果を見る" : `レベル${index + 2}へ`) : "復習する"} →</button></div>}
      </section>
      <aside className={`gameMascot ${selected === null ? "neutral" : correct ? "correct" : "wrong"}`} aria-live="polite">
        <span className="mascotTalk">{selected === null ? "焦らずいこう♪" : correct ? "大正解！さすが♡" : "大丈夫、次で取り返そう！"}</span>
        <div className="mascotCrop"><img src="./boki-chan-character-sheet.png" alt={selected === null ? "応援する簿記ちゃん" : correct ? "正解を喜ぶ簿記ちゃん" : "一緒に考える簿記ちゃん"}/></div>
      </aside>
      <footer className="gameFooter"><span>簿記ちゃんヒント：資産・費用の増加は借方、負債・純資産・収益の増加は貸方</span><button onClick={() => setStarted(false)}>ホームへ</button></footer>
    </main>
  );
}
