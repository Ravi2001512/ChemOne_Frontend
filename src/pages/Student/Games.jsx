import React, { useState, useEffect, useCallback } from 'react';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';
import { Trophy, Medal, Clock, Award, User, ChevronRight, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';

// -------- Memory Game (4x4) --------
const MemoryGame = () => {
    const emojis = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍍", "🥝", "🍑"];
    const generateCards = () =>
        [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, i) => ({ id: i, emoji, isMatched: false }));

    const [cards, setCards] = useState(generateCards);
    const [flipped, setFlipped] = useState([]);
    const [locked, setLocked] = useState(false);
    const [moves, setMoves] = useState(0);
    const [matched, setMatched] = useState([]);

    const handleFlip = (index) => {
        if (locked || flipped.includes(index) || cards[index].isMatched) return;
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            setLocked(true);
            const [a, b] = newFlipped;
            if (cards[a].emoji === cards[b].emoji) {
                const newMatched = [...matched, cards[a].emoji];
                setMatched(newMatched);
                setCards(prev => prev.map(c => c.emoji === cards[a].emoji ? { ...c, isMatched: true } : c));
                setFlipped([]);
                setLocked(false);
            } else {
                setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
            }
        }
    };

    const reset = () => { setCards(generateCards()); setFlipped([]); setLocked(false); setMoves(0); setMatched([]); };
    const won = matched.length === emojis.length;

    useEffect(() => {
        if (won) {
            submitGameScore('memory', moves);
        }
    }, [won]);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <Gamepad2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold dark:text-white">Memory Game</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">Moves: <strong className="text-indigo-600">{moves}</strong></span>
                    <button onClick={reset} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md">Reset</button>
                </div>
            </div>
            {won && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Trophy className="w-6 h-6 text-green-600" />
                    <p className="text-green-700 dark:text-green-400 font-bold text-lg">🎉 Fantastic! You completed it in {moves} moves!</p>
                </div>
            )}
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                {cards.map((card, i) => (
                    <button key={card.id} onClick={() => handleFlip(i)}
                        className={`h-20 text-3xl rounded-2xl shadow-lg transition-all duration-300 font-bold border-2
              ${card.isMatched ? 'bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800 cursor-default scale-95'
                                : flipped.includes(i) ? 'bg-indigo-600 border-indigo-400 text-white rotate-y-180'
                                    : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 hover:border-indigo-300 hover:scale-105'}`}>
                        {flipped.includes(i) || card.isMatched ? card.emoji : '❓'}
                    </button>
                ))}
            </div>
        </div>
    );
};

// -------- Puzzle Game (4x4 Sliding Puzzle) --------
const PuzzleGame = () => {
    const SIZE = 4;
    const total = SIZE * SIZE;
    const solved = [...Array(total - 1).keys()].map(i => i + 1).concat([null]);

    const isSolvable = (arr) => {
        const flat = arr.filter(x => x !== null);
        let inversions = 0;
        for (let i = 0; i < flat.length; i++)
            for (let j = i + 1; j < flat.length; j++)
                if (flat[i] > flat[j]) inversions++;
        const emptyRow = Math.floor(arr.indexOf(null) / SIZE);
        const fromBottom = SIZE - emptyRow;
        return SIZE % 2 === 1
            ? inversions % 2 === 0
            : (fromBottom % 2 === 0) ? inversions % 2 === 1 : inversions % 2 === 0;
    };

    const getShuffled = () => {
        let arr;
        do { arr = [...solved].sort(() => Math.random() - 0.5); }
        while (!isSolvable(arr) || arr.join() === solved.join());
        return arr;
    };

    const [tiles, setTiles] = useState(getShuffled);
    const [moveCount, setMoveCount] = useState(0);

    const moveTile = (index) => {
        const emptyIndex = tiles.indexOf(null);
        const row = Math.floor(index / SIZE), col = index % SIZE;
        const eRow = Math.floor(emptyIndex / SIZE), eCol = emptyIndex % SIZE;
        if ((Math.abs(row - eRow) + Math.abs(col - eCol)) !== 1) return;
        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
        setTiles(newTiles);
        setMoveCount(m => m + 1);
    };

    const isSolved = tiles.join() === solved.join();

    useEffect(() => {
        if (isSolved && moveCount > 0) {
            submitGameScore('puzzle', moveCount);
        }
    }, [isSolved]);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <Award className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold dark:text-white">Sliding Puzzle (4×4)</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">Moves: <strong className="text-indigo-600">{moveCount}</strong></span>
                    <button onClick={() => { setTiles(getShuffled()); setMoveCount(0); }}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md">Reset</button>
                </div>
            </div>
            {isSolved && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Trophy className="w-6 h-6 text-green-600" />
                    <p className="text-green-700 dark:text-green-400 font-bold text-lg">🎉 Brilliant! Solved in {moveCount} moves!</p>
                </div>
            )}
            <div className="bg-indigo-50 dark:bg-slate-900 p-4 rounded-2xl w-fit mx-auto lg:mx-0 shadow-inner">
                <div className="grid grid-cols-4 gap-2 w-64 h-64">
                    {tiles.map((tile, i) => (
                        <button key={i} onClick={() => moveTile(i)}
                            className={`flex items-center justify-center rounded-xl text-lg font-black transition-all border-b-4
                ${tile === null ? 'bg-transparent border-transparent cursor-default'
                                    : 'bg-indigo-600 border-indigo-800 hover:bg-indigo-500 text-white active:scale-95 active:border-b-0 active:translate-y-1 cursor-pointer'}`}>
                            {tile}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// -------- Word Search Game --------
const GRID_SIZE = 12;

const WORD_LIST = [
    { word: "ALKANE", hint: "Saturated hydrocarbon" },
    { word: "MOLE", hint: "6.02×10²³ particles" },
    { word: "ENTROPY", hint: "Measure of disorder" },
    { word: "ORBITAL", hint: "Electron probability region" },
    { word: "BUFFER", hint: "Resists pH change" },
    { word: "CATALYST", hint: "Speeds up reaction" },
    { word: "ISOMER", hint: "Same formula, different structure" },
    { word: "HALOGEN", hint: "Group VII elements" },
    { word: "TITRATION", hint: "Volumetric analysis" },
    { word: "LATTICE", hint: "Ionic crystal structure" },
];

const DIRECTIONS = [
    [0, 1], [1, 0], [1, 1], [-1, 1],
    [0, -1], [-1, 0], [-1, -1], [1, -1],
];

function buildGrid(words) {
    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
    const placed = [];

    for (const { word } of words) {
        let success = false;
        for (let attempt = 0; attempt < 200 && !success; attempt++) {
            const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            const cells = [];
            let fits = true;
            for (let i = 0; i < word.length; i++) {
                const r = row + dr * i, c = col + dc * i;
                if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { fits = false; break; }
                if (grid[r][c] !== '' && grid[r][c] !== word[i]) { fits = false; break; }
                cells.push([r, c]);
            }
            if (fits) {
                cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
                placed.push({ word, cells });
                success = true;
            }
        }
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++)
        for (let c = 0; c < GRID_SIZE; c++)
            if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];

    return { grid, placed };
}

const WordSearch = () => {
    const [{ grid, placed }, setPuzzle] = useState(() => buildGrid(WORD_LIST));
    const [selecting, setSelecting] = useState(false);
    const [selection, setSelection] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [highlightCells, setHighlightCells] = useState([]);
    const [timer, setTimer] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        let interval;
        if (!isPaused && foundWords.length < placed.length) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, foundWords.length, placed.length]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const cellKey = (r, c) => `${r}-${c}`;

    const getColor = (r, c) => {
        const key = cellKey(r, c);
        const foundEntry = highlightCells.find(h => h.cells.some(([hr, hc]) => hr === r && hc === c));
        if (foundEntry) return foundEntry.color;
        if (selection.some(([sr, sc]) => sr === r && sc === c)) return 'selecting';
        return null;
    };

    const FOUND_COLORS = [
        'bg-yellow-200 text-yellow-900',
        'bg-green-200 text-green-900',
        'bg-pink-200 text-pink-900',
        'bg-blue-200 text-blue-900',
        'bg-orange-200 text-orange-900',
        'bg-purple-200 text-purple-900',
        'bg-teal-200 text-teal-900',
        'bg-red-200 text-red-900',
        'bg-cyan-200 text-cyan-900',
        'bg-lime-200 text-lime-900',
    ];

    const startSelect = (r, c) => { setSelecting(true); setSelection([[r, c]]); };

    const extendSelect = (r, c) => {
        if (!selecting || selection.length === 0) return;
        const [sr, sc] = selection[0];
        const dr = r - sr, dc = c - sc;
        const len = Math.max(Math.abs(dr), Math.abs(dc));
        if (len === 0) { setSelection([[sr, sc]]); return; }
        let stepR = 0, stepC = 0;
        if (Math.abs(dr) === Math.abs(dc)) { stepR = dr / len; stepC = dc / len; }
        else if (Math.abs(dr) > Math.abs(dc)) { stepR = dr / Math.abs(dr); stepC = 0; }
        else { stepR = 0; stepC = dc / Math.abs(dc); }
        const cells = [];
        for (let i = 0; i <= len; i++) cells.push([sr + stepR * i, sc + stepC * i]);
        setSelection(cells);
    };

    const endSelect = () => {
        setSelecting(false);
        const selected = selection.map(([r, c]) => grid[r][c]).join('');
        const reversed = selected.split('').reverse().join('');
        const match = placed.find(p => (p.word === selected || p.word === reversed) && !foundWords.includes(p.word));
        if (match) {
            const colorIdx = foundWords.length % FOUND_COLORS.length;
            setFoundWords(fw => [...fw, match.word]);
            setHighlightCells(hc => [...hc, { word: match.word, cells: match.cells, color: FOUND_COLORS[colorIdx] }]);
        }
        setSelection([]);
    };

    const reset = () => {
        setPuzzle(buildGrid(WORD_LIST));
        setFoundWords([]);
        setHighlightCells([]);
        setSelection([]);
        setSelecting(false);
    };

    const allFound = foundWords.length === placed.length;

    useEffect(() => {
        if (allFound && timer > 0) {
            submitGameScore('wordsearch', timer);
        }
    }, [allFound]);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold dark:text-white">Word Search</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                        ⏱️ {formatTime(timer)}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Found: <strong className="text-indigo-600">{foundWords.length}/{placed.length}</strong></span>
                    <button onClick={reset} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md">New Puzzle</button>
                </div>
            </div>

            {allFound && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Trophy className="w-6 h-6 text-green-600" />
                    <p className="text-green-700 dark:text-green-400 font-bold text-lg">🎉 Incredible! All words found in {formatTime(timer)}!</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div
                    className="select-none overflow-x-auto pb-4 custom-scrollbar"
                    onMouseLeave={() => { if (selecting) endSelect(); }}
                >
                    <div className="inline-grid gap-0.5 mx-auto" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2rem)` }}>
                        {grid.map((row, r) =>
                            row.map((letter, c) => {
                                const color = getColor(r, c);
                                return (
                                    <div
                                        key={cellKey(r, c)}
                                        onMouseDown={() => startSelect(r, c)}
                                        onMouseEnter={() => extendSelect(r, c)}
                                        onMouseUp={endSelect}
                                        onTouchStart={(e) => { e.preventDefault(); startSelect(r, c); }}
                                        onTouchMove={(e) => {
                                            e.preventDefault();
                                            const touch = e.touches[0];
                                            const el = document.elementFromPoint(touch.clientX, touch.clientY);
                                            if (el?.dataset?.r !== undefined) extendSelect(+el.dataset.r, +el.dataset.c);
                                        }}
                                        onTouchEnd={endSelect}
                                        data-r={r}
                                        data-c={c}
                                        className={`w-8 h-8 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded cursor-pointer transition-colors
                      ${color ? color : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-slate-600'}
                      ${color === 'selecting' ? 'bg-indigo-300 text-indigo-900' : ''}`}
                                    >
                                        {letter}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Word List */}
                <div className="min-w-[160px]">
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Find these words</p>
                    <ul className="space-y-1.5">
                        {WORD_LIST.map(({ word, hint }) => {
                            const found = foundWords.includes(word);
                            const colorEntry = highlightCells.find(h => h.word === word);
                            return (
                                <li key={word} className={`flex items-center gap-2 text-sm rounded px-2 py-1 transition-all
                  ${found ? (colorEntry?.color || 'bg-green-100 text-green-800') : 'text-gray-700 dark:text-gray-300'}`}>
                                    <span className={`font-bold tracking-wide ${found ? 'line-through opacity-60' : ''}`}>{word}</span>
                                    {!found && <span className="text-xs text-gray-400 italic">— {hint}</span>}
                                    {found && <span className="ml-auto text-base">✓</span>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// -------- Global Score Submission Helper --------
const submitGameScore = async (game, score) => {
    try {
        const response = await API.post('/games/score', { game, score });
        if (response.data.message.includes("high score")) {
            toast.success("🏆 New Monthly High Score!");
        } else {
            toast.success(response.data.message);
        }
    } catch (err) {
        console.error("Score submission error:", err);
    }
};

// -------- Leaderboard Component --------
const GameLeaderboard = () => {
    const [selectedGame, setSelectedGame] = useState("memory");
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [myBest, setMyBest] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const [lbRes, myRes] = await Promise.all([
                API.get(`/games/leaderboard/${selectedGame}`),
                API.get(`/games/my-score/${selectedGame}`)
            ]);
            setLeaderboard(lbRes.data);
            setMyBest(myRes.data);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
            // toast.error("Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    }, [selectedGame]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const formatScore = (game, score) => {
        if (game === 'wordsearch') {
            const mins = Math.floor(score / 60);
            const secs = score % 60;
            return `${mins}m ${secs}s`;
        }
        if (score === null || score === undefined) return 'N/A';
        return `${score} moves`;
    };

    const MonthCountdown = () => {
        const [timeLeft, setTimeLeft] = useState("");

        useEffect(() => {
            const calculateTimeLeft = () => {
                const now = new Date();
                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const diff = nextMonth - now;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const mins = Math.floor((diff / 1000 / 60) % 60);

                if (days > 0) return `${days}d ${hours}h left`;
                return `${hours}h ${mins}m left`;
            };

            const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
            setTimeLeft(calculateTimeLeft());
            return () => clearInterval(timer);
        }, []);

        return <span>{timeLeft}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                        <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold dark:text-white">
                        {new Date().toLocaleString('default', { month: 'long' })} Leaderboard
                    </h2>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit overflow-x-auto">
                    {["memory", "puzzle", "wordsearch"].map(g => (
                        <button
                            key={g}
                            onClick={() => setSelectedGame(g)}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold capitalize transition-all whitespace-nowrap ${selectedGame === g
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                        Resets in: <MonthCountdown />
                    </span>
                </div>
            </div>

            {myBest && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Your Personal Best</p>
                            <h3 className="text-3xl font-black">{formatScore(selectedGame, myBest.score)}</h3>
                        </div>
                        <Medal className="w-12 h-12 text-amber-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                        <p className="text-slate-500 font-bold">Fetching top players...</p>
                    </div>
                ) : leaderboard.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {leaderboard.map((entry, idx) => {
                            const isMe = entry.student?._id === JSON.parse(localStorage.getItem('user'))?.id;
                            const rank = idx + 1;
                            return (
                                <div key={entry._id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${isMe ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${rank === 1 ? 'bg-amber-400 text-white' : rank === 2 ? 'bg-slate-300 text-white' : rank === 3 ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>
                                        {rank}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                                        {entry.student?.profileImage ? (
                                            <img src={entry.student.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-sm ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {entry.student?.name}
                                            {isMe && <span className="ml-2 text-[8px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{entry.student?.batch || 'Basic'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                            {selectedGame === 'wordsearch' ? (
                                                <span className="flex items-center gap-1.5 justify-end">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {formatScore(selectedGame, entry.score)}
                                                </span>
                                            ) : (
                                                formatScore(selectedGame, entry.score)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-16 text-center text-slate-400 font-medium">
                        <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No scores yet for this month. Be the first to rank!
                    </div>
                )}
            </div>
        </div>
    );
};

// -------- Main Page --------
const Games = () => {
    const [game, setGame] = useState("memory");

    const tabs = [
        { key: "memory", label: "🧠 Memory" },
        { key: "puzzle", label: "🧩 Puzzle" },
        { key: "wordsearch", label: "🔍 Word Search" },
        { key: "leaderboard", label: "🏆 Leaderboard" },
    ];

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-900 transition-colors">
            <StudentNavbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Mind Relax Games
                        </h1>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Challenge your mind and climb the monthly leaderboard.</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setGame(tab.key)}
                            className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold transition-all text-xs sm:text-sm shadow-sm flex items-center gap-2 whitespace-nowrap
                ${game === tab.key
                                    ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none scale-105'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-3xl sm:rounded-[2rem] shadow-xl shadow-blue-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all">
                    {game === "memory" && <MemoryGame />}
                    {game === "puzzle" && <PuzzleGame />}
                    {game === "wordsearch" && <WordSearch />}
                    {game === "leaderboard" && <GameLeaderboard />}
                </div>
            </main>
        </div>
    );
};

export default Games;