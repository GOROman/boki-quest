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

type StudyPage = {
  title: string;
  subtitle: string;
  paragraphs: string[];
  points: string[];
  example: string;
  note: string;
};

const studyPages: StudyPage[] = [
  { title:"簿記って何のため？", subtitle:"会社のお金の動きを、共通ルールで記録する", paragraphs:["簿記は、会社で起きた取引を記録し、経営成績と財政状態を明らかにする技術です。商品を売る、家賃を払う、銀行から借りる。こうした出来事をすべて金額で記録します。","記録の最小単位が仕訳です。一つの取引を借方と貸方の二面から捉えるため、これを複式簿記と呼びます。"], points:["取引＝会社の資産・負債・純資産・収益・費用を増減させる出来事","仕訳＝取引を借方と貸方に分ける作業","借方合計と貸方合計は必ず一致する"], example:"商品を現金30,000円で仕入れた →（借）仕入 30,000 ／（貸）現金 30,000", note:"最初は左右の意味より『一つの出来事を二つの面で記録する』と考えよう。" },
  { title:"5つのグループを覚えよう", subtitle:"勘定科目は、すべて5要素のどれかに入る", paragraphs:["勘定科目とは、現金・売上・仕入など、取引内容を表す名前です。すべての勘定科目は、資産・負債・純資産・収益・費用の5要素に分類できます。","資産は会社が持つ財産、負債は返済などの義務、純資産は返済不要の元手です。収益は利益を増やす原因、費用は利益を減らす原因になります。"], points:["資産：現金、普通預金、売掛金、備品","負債：買掛金、借入金、未払金","純資産：資本金／収益：売上／費用：仕入、支払家賃"], example:"売掛金は『後で代金を受け取る権利』なので資産。買掛金は『後で支払う義務』なので負債。", note:"科目名を見たら、まず5つの箱のどこに入るか考えるのがコツ！" },
  { title:"借方・貸方のルール", subtitle:"5要素ごとの増加・減少の位置を理解する", paragraphs:["借方は仕訳の左側、貸方は右側です。日常語の『借りる・貸す』とは意味が違うため、左右を示す専門用語として覚えます。","資産と費用は増加を借方に、負債・純資産・収益は増加を貸方に記録します。減少するときは、それぞれ反対側です。"], points:["借方で増える：資産・費用","貸方で増える：負債・純資産・収益","減少は増加の反対側に記録"], example:"現金で家賃を払う → 費用の増加は借方、資産の減少は貸方 →（借）支払家賃 ／（貸）現金", note:"『し・ひ は左』＝資産・費用は借方、と覚えると便利です。" },
  { title:"よく出る取引を仕訳しよう", subtitle:"現金取引・掛取引・資金調達をパターンで整理", paragraphs:["掛取引は、商品の受け渡しと代金の決済を別のタイミングで行う取引です。販売した側は売掛金、仕入れた側は買掛金を使います。","銀行からの借入れでは普通預金と借入金が同時に増えます。出資を受けた場合は、返済義務がないため借入金ではなく資本金を使います。"], points:["掛けで売る：（借）売掛金 ／（貸）売上","掛けで仕入れる：（借）仕入 ／（貸）買掛金","借入れ：（借）普通預金 ／（貸）借入金"], example:"買掛金45,000円を普通預金から支払う →（借）買掛金 45,000 ／（貸）普通預金 45,000", note:"『何が増えた？何が減った？』を一つずつ言葉にしてから仕訳しよう。" },
  { title:"決算と試算表の基礎", subtitle:"記録をまとめ、正しさを確かめる", paragraphs:["試算表は、各勘定科目の記録を集計した一覧表です。複式簿記では借方と貸方を同額で記録するため、試算表の双方の合計も一致します。","決算では、正しい利益と財産の状態を示すために決算整理を行います。減価償却は固定資産の取得額を使用期間に配分する処理です。回収不能となった売掛金は貸倒損失として処理します。"], points:["試算表：仕訳や転記の正確性を確かめる表","減価償却：固定資産の価値減少を各期の費用にする","貸倒損失：回収できない売掛金などを費用にする"], example:"減価償却（間接法）→（借）減価償却費 ／（貸）備品減価償却累計額", note:"ここまで読めば準備完了！次は10問テストでレベル10を目指そう。" },
];

const glossary: Record<string,string> = {
  "複式簿記":"一つの取引を借方と貸方の両面から、同じ金額で記録する方法。",
  "経営成績":"一定期間にどれだけ利益または損失が出たかという会社の成果。",
  "財政状態":"ある時点で会社が持つ財産と、返済義務・元手の状況。",
  "決算整理":"正しい利益と財産を示すため、決算時に記録を修正・追加する手続き。",
  "減価償却":"固定資産の取得額を、使用する複数の期間に分けて費用にする処理。",
  "貸倒損失":"売掛金などが回収できなくなったときに計上する費用。",
  "固定資産":"備品や建物など、営業のために長期間使用する資産。",
  "試算表":"各勘定科目を集計し、借方・貸方の合計などを確認する一覧表。",
  "勘定科目":"取引内容を分類して記録するための名前。例：現金、売上、仕入。",
  "売掛金":"商品を掛けで販売し、代金を後日受け取る権利。資産に分類される。",
  "買掛金":"商品を掛けで仕入れ、代金を後日支払う義務。負債に分類される。",
  "純資産":"資産から負債を差し引いた、返済する必要のない会社の正味財産。",
  "借方":"仕訳の左側。資産・費用の増加などを記録する側。",
  "貸方":"仕訳の右側。負債・純資産・収益の増加などを記録する側。",
  "仕訳":"取引を借方と貸方に分け、勘定科目と金額で記録すること。",
  "取引":"簿記上、会社の財産や利益の要素を増減させる出来事。",
  "資産":"現金や売掛金など、会社が持つ財産や権利。",
  "負債":"借入金や買掛金など、将来支払う義務。",
  "収益":"売上など、利益を増加させる原因。",
  "費用":"仕入や家賃など、利益を減少させる原因。",
};

function Terms({text}:{text:string}) {
  const words = Object.keys(glossary).sort((a,b)=>b.length-a.length);
  const pattern = new RegExp(`(${words.join("|")})`,"g");
  return <>{text.split(pattern).map((part,i)=>glossary[part] ? <span role="button" tabIndex={0} className="term" aria-label={`${part}：${glossary[part]}`} key={`${part}-${i}`}>{part}<span role="tooltip">{glossary[part]}</span></span> : part)}</>;
}

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
  const [studyPage, setStudyPage] = useState(0);
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

  function restart() { playSound("tap"); setStarted(true); setFinished(false); setIndex(0); setStudyPage(0); setPhase("study"); setSelected(null); setScore(0); setMistakes(0); setCorrectCount(0); setFx(""); }

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
      <header className="gameHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><div className="hud"><span>STUDY <b>{studyPage + 1} / 5</b></span><span>NEXT <b>10 TESTS</b></span><button className="soundToggle compact" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪" : "×"}</button></div></header>
      <div className="studyPager" aria-label={`勉強ページ${studyPage + 1}`}>
        {studyPages.map((item,i)=><button key={item.title} className={i < studyPage ? "done" : i === studyPage ? "current" : ""} onClick={()=>{playSound("tap");setStudyPage(i)}}><span>{i < studyPage ? "✓" : i + 1}</span><b>{item.title}</b></button>)}
      </div>
      <section className="lessonCard">
        <div className="phaseBadge study">STUDY PHASE</div>
        <p className="levelLabel">LESSON {String(studyPage + 1).padStart(2,"0")} / 05</p>
        <h1><Terms text={studyPages[studyPage].title}/></h1>
        <h2><Terms text={studyPages[studyPage].subtitle}/></h2>
        <div className="lessonBody">{studyPages[studyPage].paragraphs.map(p=><p key={p}><Terms text={p}/></p>)}</div>
        <div className="lessonRule"><small>ここを覚えよう</small><ul>{studyPages[studyPage].points.map(p=><li key={p}><Terms text={p}/></li>)}</ul></div>
        <div className="lessonExample"><small>具体例</small><strong><Terms text={studyPages[studyPage].example}/></strong></div>
        <div className="lessonTip">♡ 簿記ちゃんメモ　<Terms text={studyPages[studyPage].note}/></div>
        <div className="lessonNav"><button disabled={studyPage === 0} onClick={()=>{playSound("tap");setStudyPage(p=>p-1)}}>← 前のページ</button><button className="lessonStart" onClick={() => {playSound("tap"); if(studyPage === studyPages.length-1){setPhase("test");setIndex(0)}else setStudyPage(p=>p+1);}}>{studyPage === studyPages.length-1 ? "10問テストを始める" : "次のページ"} <span>→</span></button></div>
      </section>
      <aside className="studyMascot"><span>点線の専門用語に<br/><b>触れると解説が出るよ！</b></span><div><img src="./boki-chan-character-sheet.png" alt="ポイントを教える簿記ちゃん"/></div></aside>
      <footer className="gameFooter"><span>全5ページを学んだら、10問テストでレベル10を目指そう！</span><button onClick={() => setStarted(false)}>ホームへ</button></footer>
    </main>
  );

  return (
    <main className={`gamePage ${fx ? `fx-${fx}` : ""}`}>
      {fx === "correct" && <div className="answerBurst" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{"--a":`${i*25.7}deg`} as React.CSSProperties}>✦</i>)}</div>}
      <header className="gameHeader"><div className="brand"><span className="brandMark">簿</span><span>BOKI QUEST</span></div><div className="hud"><span>LEVEL <b>{index + 1} / 10</b></span><span>SCORE <b>{score.toLocaleString()}</b>{fx === "correct" && <em className="scorePop">+100</em>}</span><span>REVIEW <b>{mistakes}</b></span><button className="soundToggle compact" onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"}>{soundOn ? "♪" : "×"}</button></div></header>
      <div className="progress"><i style={{width: `${((index + 1) / questions.length) * 100}%`}}></i></div>
      <section className="quiz" key={index}>
        <div className="questionMeta"><span><i className="phaseBadge test">TEST PHASE</i> LEVEL {String(index + 1).padStart(2,"0")}</span><b>♡ {q.category}</b></div>
        <h1><Terms text={q.prompt}/></h1>
        <div className="choices">{q.choices.map((choice, i) => {
          const state = selected === null ? "" : i === q.answer ? "correct" : i === selected ? "wrong" : "dim";
          return <button key={choice} className={state} onClick={() => choose(i)} disabled={selected !== null}><span>{letters[i]}</span><Terms text={choice}/><i>{state === "correct" ? "✓" : state === "wrong" ? "×" : ""}</i></button>;
        })}</div>
        {selected !== null && <div className={`feedback ${correct ? "good" : "bad"}`} role="status"><div className="feedbackTitle"><span>{correct ? "✓" : "!"}</span><b>{correct ? "LEVEL CLEAR！ +100 pt" : "解説を確認して、同じ問題に再挑戦しよう"}</b></div><p><Terms text={q.explanation}/></p><div className="journal"><small>簿記ちゃんメモ</small><Terms text={q.journal}/></div><button onClick={next}>{correct ? (index === questions.length - 1 ? "コース結果を見る" : `レベル${index + 2}へ`) : "もう一度挑戦"} →</button></div>}
      </section>
      <aside className={`gameMascot ${selected === null ? "neutral" : correct ? "correct" : "wrong"}`} aria-live="polite">
        <span className="mascotTalk">{selected === null ? "焦らずいこう♪" : correct ? "大正解！さすが♡" : "大丈夫、次で取り返そう！"}</span>
        <div className="mascotCrop"><img src="./boki-chan-character-sheet.png" alt={selected === null ? "応援する簿記ちゃん" : correct ? "正解を喜ぶ簿記ちゃん" : "一緒に考える簿記ちゃん"}/></div>
      </aside>
      <footer className="gameFooter"><span>簿記ちゃんヒント：資産・費用の増加は借方、負債・純資産・収益の増加は貸方</span><button onClick={() => setStarted(false)}>ホームへ</button></footer>
    </main>
  );
}
