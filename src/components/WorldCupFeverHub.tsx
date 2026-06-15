import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Trash2, 
  Play, 
  Volume2, 
  VolumeX, 
  Coins, 
  ShieldCheck, 
  ChevronLeft, 
  X, 
  Flame, 
  Star, 
  Zap, 
  Sparkles,
  Users,
  Award
} from "lucide-react";

interface WorldCupFeverHubProps {
  onBack: () => void;
  coinBalance: number;
  setCoinBalance: (balance: number | ((prev: number) => number)) => void;
}

const COUNTRIES = [
  { name: "Brazil", flag: "🇧🇷", code: "BRA", rating: 92, fever: 3450 },
  { name: "Argentina", flag: "🇦🇷", code: "ARG", rating: 91, fever: 3120 },
  { name: "France", flag: "🇫🇷", code: "FRA", rating: 90, fever: 2890 },
  { name: "Spain", flag: "🇪🇸", code: "ESP", rating: 89, fever: 2150 },
  { name: "Germany", flag: "🇩🇪", code: "GER", rating: 88, fever: 1980 },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG", rating: 89, fever: 2430 },
  { name: "Japan", flag: "🇯🇵", code: "JPN", rating: 85, fever: 1850 },
  { name: "USA", flag: "🇺🇸", code: "USA", rating: 82, fever: 1420 },
];

const PREDICTIONS_LIST = [
  { id: 1, teamA: "Brazil 🇧🇷", teamB: "Germany 🇩🇪", date: "Quarter Finals - Tonight", reward: 100 },
  { id: 2, teamA: "Argentina 🇦🇷", teamB: "France 🇫🇷", date: "Quarter Finals - Tomorrow", reward: 100 },
  { id: 3, teamA: "Spain 🇪🇸", teamB: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", date: "Quarter Finals - June 17", reward: 100 },
];

const MATCH_COMMENTARIES_POOL = [
  "{attacker} makes a brilliant run down the wing, cutting inside past the defense!",
  "{attacker} shoots from outside the box! It floats towards the top corner...",
  "What a pass! {attacker} is face-to-face with the goalkeeper...",
  "A fierce midfield battle! {defender} slides in with a spectacular clean tackle!",
  "Corner kick for {team}! The ball curves high into the penalty area...",
  "{attacker} attempts an incredible bicycle kick! The crowd holds its breath...",
  "Absolute drama! {defender} blocks a shot right on the goal line!",
];

export default function WorldCupFeverHub({ onBack, coinBalance, setCoinBalance }: WorldCupFeverHubProps) {
  const [activeTab, setActiveTab] = useState<"simulator" | "cheer" | "predictor">("simulator");
  const [supporterCountry, setSupporterCountry] = useState<string>(() => {
    return localStorage.getItem("user_supporter_flag") || "";
  });

  // Simulator States
  const [teamA, setTeamA] = useState("Brazil");
  const [teamB, setTeamB] = useState("France");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [tickerMessages, setTickerMessages] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vuvuzelaRipples, setVuvuzelaRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [vuvuzelaCount, setVuvuzelaCount] = useState(0);

  // Predictor States
  const [submittedPredictions, setSubmittedPredictions] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem("world_cup_predictions");
    return saved ? JSON.parse(saved) : {};
  });

  // Cheer / Fevers States
  const [fevers, setFevers] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("world_cup_fevers");
    if (saved) return JSON.parse(saved);
    const initial: Record<string, number> = {};
    COUNTRIES.forEach(c => {
      initial[c.name] = c.fever;
    });
    return initial;
  });

  const handleChooseSupporter = (country: typeof COUNTRIES[0]) => {
    if (supporterCountry === country.flag) {
      setSupporterCountry("");
      localStorage.removeItem("user_supporter_flag");
    } else {
      setSupporterCountry(country.flag);
      localStorage.setItem("user_supporter_flag", country.flag);
      // Trigger a nice fever increase
      setFevers(prev => {
        const updated = { ...prev, [country.name]: (prev[country.name] || 0) + 150 };
        localStorage.setItem("world_cup_fevers", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handlePredict = (matchId: number, team: string, reward: number) => {
    if (submittedPredictions[matchId]) return;
    const updated = { ...submittedPredictions, [matchId]: team };
    setSubmittedPredictions(updated);
    localStorage.setItem("world_cup_predictions", JSON.stringify(updated));

    // Award Coins
    setCoinBalance((prev) => prev + reward);
    triggerAlert(`🗳️ Prediction Submitted! Marcus (App Manager) awarded you +${reward} Coins for participating in World Cup Fever!`);
  };

  // Toast / System response Alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Sound generator
  const playVuvuzelaSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sawtooth";
      // Vuvuzela characteristic frequency around 235Hz with some rich harmonics
      osc.frequency.setValueAtTime(235, audioCtx.currentTime);
      
      // Mild vibrato to make it sound buzzy
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 12; // vibrato frequency
      lfoGain.gain.value = 10; // pitch variation depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      lfo.start();
      osc.start();
      lfo.stop(audioCtx.currentTime + 0.8);
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log("Audio API failed:", e);
    }
  };

  const playGoalSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {}
  };

  const handleVuvuzelaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setVuvuzelaCount(prev => prev + 1);
    playVuvuzelaSound();

    // Trigger visual ripple at cursor overlay inside container
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    
    setVuvuzelaRipples(prev => [
      ...prev,
      { id: Date.now(), x: rippleX, y: rippleY }
    ]);

    // Increase Supporter country fever
    if (supporterCountry) {
      const countryObj = COUNTRIES.find(c => c.flag === supporterCountry);
      if (countryObj) {
        setFevers(prev => {
          const updated = { ...prev, [countryObj.name]: (prev[countryObj.name] || 0) + 12 };
          localStorage.setItem("world_cup_fevers", JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  // Clean ripples
  useEffect(() => {
    if (vuvuzelaRipples.length > 0) {
      const timer = setTimeout(() => {
        setVuvuzelaRipples(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [vuvuzelaRipples]);

  // Simulation Logic
  const startSimulation = () => {
    if (teamA === teamB) {
      triggerAlert("⚠️ You must select different countries to play!");
      return;
    }
    setIsSimulating(true);
    setSimProgress(0);
    setScoreA(0);
    setScoreB(0);
    
    const countryAObj = COUNTRIES.find(c => c.name === teamA)!;
    const countryBObj = COUNTRIES.find(c => c.name === teamB)!;

    setTickerMessages([`🏆 Match on! kickoff at AI Stadium: ${countryAObj.flag} ${teamA} vs ${teamB} ${countryBObj.flag}!`]);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + 10;
        
        // Random occurrences during the match
        if (next < 100 && next % 20 === 0) {
          const chance = Math.random();
          const scoringTeam = Math.random() > 0.5 ? "A" : "B";
          const scoringName = scoringTeam === "A" ? teamA : teamB;
          const defendingName = scoringTeam === "A" ? teamB : teamA;
          const countryA = COUNTRIES.find(c => c.name === teamA)!;
          const countryB = COUNTRIES.find(c => c.name === teamB)!;
          const scorerFlag = scoringTeam === "A" ? countryA.flag : countryB.flag;

          if (chance > 0.65) {
            // GOAL Scored!
            if (scoringTeam === "A") setScoreA(s => s + 1);
            else setScoreB(s => s + 1);
            
            playGoalSound();
            setTickerMessages(msg => [
              `⚽ [${Math.floor(next * 0.9)}'] GOAAAL! ${scorerFlag} ${scoringName} scores! Beautiful shot inside the net!`,
              ...msg
            ]);
          } else {
            // Neutral commentary
            const comment = MATCH_COMMENTARIES_POOL[Math.floor(Math.random() * MATCH_COMMENTARIES_POOL.length)];
            const formatted = comment
              .replace("{attacker}", scoringTeam === "A" ? `${countryA.flag} Attacker` : `${countryB.flag} Playmaker`)
              .replace("{defender}", scoringTeam === "A" ? `${countryB.flag} Defender` : `${countryA.flag} Centre-Back`)
              .replace("{team}", scoringName);

            setTickerMessages(msg => [
              `⏱️ [${Math.floor(next * 0.9)}'] ${formatted}`,
              ...msg
            ]);
          }
        }

        if (next >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          
          let resultMessage = "";
          let bonusCoins = 50;

          if (scoreA > scoreB) {
            resultMessage = `🏆 FULL TIME! ${teamA} has won ${scoreA} - ${scoreB}! What a game!`;
          } else if (scoreB > scoreA) {
            resultMessage = `🏆 FULL TIME! ${teamB} has won ${scoreB} - ${scoreA}! Absolutely historic performance!`;
          } else {
            // Draw - Penalty simulation
            const penA = Math.floor(Math.random() * 3) + 3;
            const penB = Math.floor(Math.random() * 3) + 3;
            const winner = penA > penB ? teamA : teamB;
            resultMessage = `🏆 FULL TIME (Penalties)! Tie broken! ${teamA} ${scoreA} - ${scoreB} ${teamB} (Pens: ${penA} - ${penB}). Winner is ${winner}!`;
          }
          
          // Complete Simulation Reward
          setCoinBalance(c => c + bonusCoins);
          setTickerMessages(msg => [resultMessage, `💰 Marcus Support Manager has transferred +${bonusCoins} coins to your wallet!`, ...msg]);
          triggerAlert(`🎉 Simulation complete! App Manager awarded you +${bonusCoins} Coins as supporter incentives!`);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simProgress, teamA, teamB, scoreA, scoreB]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 150 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 150 }}
      className="fixed inset-0 z-[190] bg-zinc-950 text-white flex flex-col font-sans"
    >
      {/* Pitch grass subtle pattern header */}
      <div className="relative flex-none bg-gradient-to-b from-emerald-800 to-green-950 p-6 pt-12 border-b border-emerald-700 overflow-hidden">
        {/* Subtle Pitch Lines background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full border-[3px] border-white rounded-t-3xl mt-4" />
          <div className="w-32 h-32 border-[3px] border-white rounded-full mx-auto -mt-6" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/20"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <Trophy className="text-yellow-400 animate-bounce" size={20} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">World Cup Fever</h2>
              </div>
              <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest mt-0.5">Live Supporter Stadium Hub</p>
            </div>
          </div>

          {/* Sound Controls */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-emerald-900/40 border border-emerald-700/50 hover:bg-emerald-800/60 rounded-xl text-white transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            Sound
          </button>
        </div>

        {/* Global Supporter indicator */}
        <div className="mt-4 bg-emerald-950/80 rounded-2xl p-3 border border-emerald-600/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-yellow-400 shrink-0" size={18} />
            <div>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-none">Supporter Pride</p>
              <p className="text-xs font-bold text-white mt-1">
                {supporterCountry ? `Vocal Supporter of country: ${supporterCountry}` : "No supporter nation selected yet"}
              </p>
            </div>
          </div>
          {supporterCountry ? (
            <span className="text-2xl animate-pulse">{supporterCountry}</span>
          ) : (
            <span className="text-[9px] text-emerald-300 font-black border border-emerald-500/40 rounded-lg px-2 py-1 bg-emerald-900/50">Wartime!</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-2 flex items-center justify-around">
        <button 
          onClick={() => setActiveTab("simulator")}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
            activeTab === "simulator" ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40" : "text-gray-400 hover:text-white"
          }`}
        >
          ⚽ Simulation
        </button>
        <button 
          onClick={() => setActiveTab("cheer")}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
            activeTab === "cheer" ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40" : "text-gray-400 hover:text-white"
          }`}
        >
          📣 Supporter Stand
        </button>
        <button 
          onClick={() => setActiveTab("predictor")}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
            activeTab === "predictor" ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40" : "text-gray-400 hover:text-white"
          }`}
        >
          🗳️ Predictions
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {activeTab === "simulator" && (
          <div className="space-y-4">
            
            {/* Match select cards */}
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-4 space-y-4">
              <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase">Interactive Match Builder</h3>
              
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Team A select */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-1">TEAM A</label>
                  <select 
                    value={teamA} 
                    onChange={(e) => setTeamA(e.target.value)}
                    disabled={isSimulating}
                    className="bg-transparent text-sm font-black text-white focus:outline-none w-full text-center cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.name} value={c.name} className="bg-zinc-950 text-white font-bold">{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Team B select */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider block mb-1">TEAM B</label>
                  <select 
                    value={teamB} 
                    onChange={(e) => setTeamB(e.target.value)}
                    disabled={isSimulating}
                    className="bg-transparent text-sm font-black text-white focus:outline-none w-full text-center cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.name} value={c.name} className="bg-zinc-950 text-white font-bold">{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!isSimulating ? (
                <button 
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Play size={16} /> Simulate Kickoff
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${simProgress}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">Simulating Live Match Dynamics...</p>
                </div>
              )}
            </div>

            {/* Simulated Scoreboard */}
            <div className="bg-gradient-to-r from-emerald-950 to-green-950 rounded-3xl border border-emerald-800 p-5 text-center relative overflow-hidden">
              <div className="absolute right-0 top-0 text-[100px] font-black text-white/5 leading-none mr-2 pointer-events-none">GOAL</div>
              <p className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-[0.25em] mb-2">AI Stadium Scoreboard</p>
              
              <div className="flex items-center justify-center gap-6">
                <div>
                  <span className="text-4xl block mb-1">
                    {COUNTRIES.find(c => c.name === teamA)?.flag || "🏳️"}
                  </span>
                  <span className="text-xs font-black uppercase text-gray-300">{teamA}</span>
                </div>

                <div className="bg-zinc-950/60 rounded-2xl px-6 py-2 border border-emerald-500/10 min-w-[100px]">
                  <span className="text-3xl font-black tabular-nums tracking-wider text-yellow-400">
                    {scoreA} - {scoreB}
                  </span>
                </div>

                <div>
                  <span className="text-4xl block mb-1">
                    {COUNTRIES.find(c => c.name === teamB)?.flag || "🏳️"}
                  </span>
                  <span className="text-xs font-black uppercase text-gray-300">{teamB}</span>
                </div>
              </div>
            </div>

            {/* Play-by-play live feed */}
            {tickerMessages.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Match Ticker Feed</span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2.5 divide-y divide-zinc-800/45 text-left pr-1 scrollbar-thin">
                  {tickerMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`text-xs leading-relaxed font-semibold pt-2 ${
                        i === 0 ? "text-emerald-400 animate-pulse font-black" : "text-gray-400"
                      }`}
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "cheer" && (
          <div className="space-y-4">
            {/* Vuvuzela cheer pad */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center relative overflow-hidden">
              <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-2">Vuvuzela Cheer Pad</h3>
              <p className="text-gray-400 text-xs mb-4 max-w-xs mx-auto">
                Select your favorite team below, blow the high-volume vuvuzela, and raise their country fever ranking metrics!
              </p>

              <button 
                onClick={handleVuvuzelaClick}
                className="w-24 h-24 bg-gradient-to-tr from-emerald-600 to-green-500 border-2 border-emerald-400 rounded-full shadow-2xl relative overflow-hidden mx-auto flex flex-col items-center justify-center group active:scale-90 transition-all cursor-pointer"
              >
                {/* Sonic ripple rings overlay */}
                {vuvuzelaRipples.map(r => (
                  <motion.div 
                    key={r.id}
                    className="absolute rounded-full border border-yellow-400 bg-yellow-400/10 pointer-events-none"
                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                    animate={{ width: 240, height: 240, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ left: r.x - 120, top: r.y - 120 }}
                  />
                ))}

                <span className="text-3xl filter drop-shadow animate-bounce">📣</span>
                <span className="text-[9px] font-black tracking-widest text-white uppercase mt-1">BZZZZZT!</span>
              </button>

              <p className="text-[10px] text-gray-500 font-extrabold uppercase mt-4 tracking-wider">
                Total stadium blow count: <span className="text-emerald-300">{vuvuzelaCount}</span>
              </p>
            </div>

            {/* Stadium Ranking Table */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-4">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Fever Leaderboard</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase">Interactive</span>
              </div>

              <div className="space-y-3">
                {COUNTRIES.map((c) => {
                  const feverValue = fevers[c.name] || c.fever;
                  const isUserSupporter = supporterCountry === c.flag;
                  
                  return (
                    <div 
                      key={c.name}
                      onClick={() => handleChooseSupporter(c)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isUserSupporter 
                          ? "bg-emerald-900/30 border-emerald-500/70 shadow-lg shadow-emerald-950/20" 
                          : "bg-zinc-950/50 border-zinc-800/60 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5 leading-none">
                            <span className="text-xs font-black text-white">{c.name}</span>
                            {isUserSupporter && (
                              <Star size={11} className="fill-yellow-400 text-yellow-400 animate-spin" />
                            )}
                          </div>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">Team Rating: OVR {c.rating}%</p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                            {feverValue.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block leading-none mt-0.5">Fever pts</span>
                        </div>
                        
                        <div className={`w-3 h-3 rounded-full border ${isUserSupporter ? "bg-emerald-500 border-white" : "border-gray-600"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "predictor" && (
          <div className="space-y-4 text-left">
            
            {/* Predict matches */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-emerald-600/20 text-emerald-300 font-extrabold text-[8px] uppercase tracking-widest rounded-bl-xl border-l border-b border-emerald-500/20">Manager Bounty</div>
              <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-1">Marcus' Predictor Arena</h3>
              <p className="text-gray-400 text-xs mb-4">
                Prove your football intuition! Predict winners of upcoming high-profile matches and instantly receive point bonuses direct into your wallet from the support desk!
              </p>
              
              <div className="space-y-4">
                {PREDICTIONS_LIST.map((match) => {
                  const savedPred = submittedPredictions[match.id];
                  return (
                    <div key={match.id} className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{match.date}</span>
                        <span className="text-[10px] bg-emerald-900/60 text-emerald-300 rounded-lg px-2 py-0.5 font-bold flex items-center gap-1 font-mono">
                          <Coins size={10} /> +{match.reward} Coins
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handlePredict(match.id, match.teamA, match.reward)}
                          disabled={!!savedPred}
                          className={`py-3 rounded-xl text-xs font-black tracking-tight leading-none uppercase select-none transition-all ${
                            savedPred === match.teamA 
                              ? "bg-emerald-600 text-white border border-emerald-400"
                              : savedPred 
                              ? "bg-zinc-900/20 text-gray-600 border border-transparent opacity-50"
                              : "bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-white border border-zinc-750 active:scale-95"
                          }`}
                        >
                          Prediction: {match.teamA.split(" ")[0]}
                        </button>

                        <button 
                          onClick={() => handlePredict(match.id, match.teamB, match.reward)}
                          disabled={!!savedPred}
                          className={`py-3 rounded-xl text-xs font-black tracking-tight leading-none uppercase select-none transition-all ${
                            savedPred === match.teamB 
                              ? "bg-emerald-600 text-white border border-emerald-400"
                              : savedPred 
                              ? "bg-zinc-900/20 text-gray-600 border border-transparent opacity-50"
                              : "bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-white border border-zinc-750 active:scale-95"
                          }`}
                        >
                          Prediction: {match.teamB.split(" ")[0]}
                        </button>
                      </div>

                      {savedPred && (
                        <p className="text-[10px] text-emerald-400 font-bold mt-2 text-center animate-pulse">
                          ✓ You locking in: {savedPred} to take the win!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stadium Fever Promotion banner */}
            <div className="bg-gradient-to-tr from-yellow-600/30 via-orange-600/20 to-transparent border border-orange-500/30 rounded-3xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-400/30 rounded-full flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-yellow-300 tracking-wider">Golden Cup Supporter Promotion</h4>
                <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed font-semibold">
                  Get certified in supporter activity! By taking predictions and playing the live soccer match simulator, you secure neighborhood credit with hirers & merchants as an active supporter!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Alerts */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[200] bg-zinc-900 text-white text-xs font-semibold p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-emerald-500/30"
          >
            <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-extrabold tracking-tight">World Cup Security System</p>
              <p className="opacity-90 leading-relaxed mt-0.5">{alertMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
