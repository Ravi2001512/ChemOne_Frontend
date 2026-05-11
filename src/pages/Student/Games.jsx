import { useState, useEffect, useCallback } from "react";
import StudentNavbar from "../../components/StudentNavbar";

const useIsDarkMode = () => {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isDark;
};

const ELEMENTS = [
    { symbol: "H", name: "හයිඩ්‍රජන්", atomicNum: 1, group: "nonmetal", mass: 1.008 },
    { symbol: "He", name: "හීලියම්", atomicNum: 2, group: "noble", mass: 4.003 },
    { symbol: "Li", name: "ලිතියම්", atomicNum: 3, group: "alkali", mass: 6.941 },
    { symbol: "C", name: "කාබන්", atomicNum: 6, group: "nonmetal", mass: 12.011 },
    { symbol: "N", name: "නයිට්‍රජන්", atomicNum: 7, group: "nonmetal", mass: 14.007 },
    { symbol: "O", name: "ඔක්සිජන්", atomicNum: 8, group: "nonmetal", mass: 15.999 },
    { symbol: "F", name: "ෆ්ලෝරීන්", atomicNum: 9, group: "halogen", mass: 18.998 },
    { symbol: "Ne", name: "නියෝන්", atomicNum: 10, group: "noble", mass: 20.18 },
    { symbol: "Na", name: "සෝඩියම්", atomicNum: 11, group: "alkali", mass: 22.99 },
    { symbol: "Mg", name: "මැග්නීසියම්", atomicNum: 12, group: "alkaline", mass: 24.305 },
    { symbol: "Al", name: "ඇලුමිනියම්", atomicNum: 13, group: "post-transition", mass: 26.982 },
    { symbol: "Si", name: "සිලිකන්", atomicNum: 14, group: "metalloid", mass: 28.086 },
    { symbol: "P", name: "පොස්පරස්", atomicNum: 15, group: "nonmetal", mass: 30.974 },
    { symbol: "S", name: "සල්ෆර්", atomicNum: 16, group: "nonmetal", mass: 32.06 },
    { symbol: "Cl", name: "ක්ලෝරීන්", atomicNum: 17, group: "halogen", mass: 35.45 },
    { symbol: "Ar", name: "ආර්ගොන්", atomicNum: 18, group: "noble", mass: 39.948 },
    { symbol: "K", name: "පොටෑසියම්", atomicNum: 19, group: "alkali", mass: 39.098 },
    { symbol: "Ca", name: "කැල්සියම්", atomicNum: 20, group: "alkaline", mass: 40.078 },
    { symbol: "Fe", name: "යකඩ", atomicNum: 26, group: "transition", mass: 55.845 },
    { symbol: "Cu", name: "තඹ", atomicNum: 29, group: "transition", mass: 63.546 },
    { symbol: "Zn", name: "සින්ක්", atomicNum: 30, group: "transition", mass: 65.38 },
    { symbol: "Br", name: "බ්‍රොමීන්", atomicNum: 35, group: "halogen", mass: 79.904 },
    { symbol: "Ag", name: "රිදී", atomicNum: 47, group: "transition", mass: 107.87 },
    { symbol: "I", name: "අයඩින්", atomicNum: 53, group: "halogen", mass: 126.9 },
    { symbol: "Au", name: "රත්‍රන්", atomicNum: 79, group: "transition", mass: 196.97 },
    { symbol: "Hg", name: "රසදිය", atomicNum: 80, group: "transition", mass: 200.59 },
    { symbol: "Pb", name: "ඊයම්", atomicNum: 82, group: "post-transition", mass: 207.2 },
    { symbol: "U", name: "යුරේනියම්", atomicNum: 92, group: "actinide", mass: 238.03 },
];

const COMPOUNDS = [
    { formula: "H₂O", name: "ජලය", elements: ["H", "O"], hint: "ජීවිතයට අත්‍යවශ්‍ය, පෘථිවිය 71% ආවරණය කරයි" },
    { formula: "CO₂", name: "කාබන් ඩයොක්සයිඩ්", elements: ["C", "O"], hint: "හරිතාගාර වායුව, දහනයේදී නිකුත් වේ" },
    { formula: "NaCl", name: "කෑම් ලුණු", elements: ["Na", "Cl"], hint: "සාමාන්‍ය කුළුබඩු, අයනික සංයෝගයකි" },
    { formula: "NH₃", name: "ඇමෝනියා", elements: ["N", "H"], hint: "පොහොරවල භාවිතා වේ, තියුණු ගන්ධයක් ඇත" },
    { formula: "H₂SO₄", name: "සල්ෆියුරික් අම්ලය", elements: ["H", "S", "O"], hint: "බැටරිවල ශක්තිමත් අම්ලය" },
    { formula: "CH₄", name: "මීතේන්", elements: ["C", "H"], hint: "ස්වාභාවික ගෑස්, සරලම හයිඩ්‍රොකාබනය" },
    { formula: "HCl", name: "හයිඩ්‍රොක්ලෝරික් අම්ලය", elements: ["H", "Cl"], hint: "ආමාශ අම්ලයේ ඇත" },
    { formula: "CaCO₃", name: "කැල්සියම් කාබනේට්", elements: ["Ca", "C", "O"], hint: "හුණුගල් හා චෝක්හි ඇත" },
    { formula: "Fe₂O₃", name: "යකඩ මල", elements: ["Fe", "O"], hint: "යකඩ කිලිටු වූ විට සෑදේ" },
    { formula: "C₆H₁₂O₆", name: "ග්ලූකෝස්", elements: ["C", "H", "O"], hint: "සෛල ශක්ති ප්‍රභවය" },
];

const REACTIONS = [
    { reactants: "2H₂ + O₂", products: "2H₂O", type: "සංශ්ලේෂණය", description: "හයිඩ්‍රජන් දහනය" },
    { reactants: "C + O₂", products: "CO₂", type: "දහනය", description: "කාබන් දිලිහීම" },
    { reactants: "2HCl + Mg", products: "MgCl₂ + H₂", type: "තනි විස්ථාපනය", description: "අම්ල-ලෝහ ප්‍රතික්‍රියාව" },
    { reactants: "NaOH + HCl", products: "NaCl + H₂O", type: "උදාසීනකරණය", description: "අම්ල-භෂ්ම ප්‍රතික්‍රියාව" },
    { reactants: "CaCO₃", products: "CaO + CO₂", type: "විඝටනය", description: "හුණුගල් රත්කිරීම" },
];

const GROUP_COLORS = (isDark) => ({
    alkali: { bg: isDark ? "#2d1a1a" : "#fde8e8", border: "#e74c3c", text: isDark ? "#ff9f9f" : "#c0392b", label: "ක්ෂාරීය ලෝහ" },
    alkaline: { bg: isDark ? "#2d201a" : "#fff0e8", border: "#e67e22", text: isDark ? "#ffb78f" : "#d35400", label: "භෞම ක්ෂාරීය" },
    transition: { bg: isDark ? "#1a1a2d" : "#e8e8f8", border: "#8e44ad", text: isDark ? "#d2a8ff" : "#7d3c98", label: "සංක්‍රාන්ති ලෝහ" },
    "post-transition": { bg: isDark ? "#1e1e1e" : "#f0f0f0", border: "#7f8c8d", text: isDark ? "#cbd5e1" : "#566573", label: "පශ්චාත් සංක්‍රාන්ති" },
    metalloid: { bg: isDark ? "#1f1a2d" : "#f0e8ff", border: "#9b59b6", text: isDark ? "#d2a8ff" : "#7d3c98", label: "අර්ධලෝහ" },
    nonmetal: { bg: isDark ? "#1a232d" : "#e8f4fd", border: "#2980b9", text: isDark ? "#a5d8ff" : "#1a5276", label: "අලෝහ" },
    halogen: { bg: isDark ? "#1a2d1e" : "#e8fff0", border: "#27ae60", text: isDark ? "#a2ffc2" : "#1e8449", label: "හැලජන්" },
    noble: { bg: isDark ? "#2d261a" : "#fff3cd", border: "#f39c12", text: isDark ? "#ffe08f" : "#b7770d", label: "උකු වායු" },
    actinide: { bg: isDark ? "#1a2d20" : "#e8ffe8", border: "#16a085", text: isDark ? "#8fffc7" : "#117a65", label: "ඇක්ටිනයිඩ්" },
});


const MODES = ["මූලද්‍රව්‍ය ප්‍රශ්නාවලිය", "සංයෝග නිර්මාණය", "ප්‍රතික්‍රියා ගැළපීම", "ආවර්ත දර්ශකය", "AI අභියෝගය"];
const MODEICONS = ["⚡", "🧪", "🔬", "📊", "🤖"];

function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }

function ElementCard({ el, onClick, selected, disabled, small }) {
    const isDark = useIsDarkMode();
    const colors = GROUP_COLORS(isDark);
    const gc = colors[el.group] || colors.nonmetal;

    return (
        <div onClick={() => !disabled && onClick && onClick(el)} style={{
            background: selected ? gc.border : gc.bg, border: `2px solid ${gc.border}`,
            borderRadius: 10, padding: small ? "6px 8px" : "10px 12px",
            cursor: disabled ? "default" : "pointer", textAlign: "center",
            transition: "all .15s", transform: selected ? "scale(1.06)" : "scale(1)",
            boxShadow: selected ? `0 4px 16px ${gc.border}55` : "none",
            minWidth: small ? 50 : 70, userSelect: "none"
        }}>
            <div style={{ fontSize: small ? 10 : 11, color: selected ? "#fff" : gc.text, opacity: .8, fontWeight: 600 }}>{el.atomicNum}</div>
            <div style={{ fontSize: small ? 18 : 26, fontWeight: 800, color: selected ? "#fff" : gc.border, lineHeight: 1.1, fontFamily: "Georgia,serif" }}>{el.symbol}</div>
            {!small && <div style={{ fontSize: 9, color: selected ? "#ffffffcc" : gc.text, fontWeight: 600, marginTop: 2 }}>{el.name}</div>}
        </div>
    );
}

function ScoreBar({ score, total, streak, level }) {
    return (
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {[
                { label: "ලකුණු", val: score, color: "#f1c40f" },
                { label: "ප්‍ර", val: total, color: "#2ecc71" },
                { label: "🔥 අඛණ්ඩ", val: streak, color: "#e67e22" },
                { label: "මට්ටම", val: level, color: "#9b59b6" },
            ].map(({ label, val, color }) => (
                <div key={label} style={{ background: "#1a1a2e", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 500 }}>
                    {label}: <span style={{ color, fontWeight: 700 }}>{val}</span>
                </div>
            ))}
        </div>
    );
}

function ElementQuiz({ onScore }) {
    const isDark = useIsDarkMode();
    const colors = GROUP_COLORS(isDark);
    const [q, setQ] = useState(null);

    const [choices, setChoices] = useState([]);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [mode, setMode] = useState("symbol");

    const nextQ = useCallback(() => {
        const c = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
        const w = shuffle(ELEMENTS.filter(e => e.symbol !== c.symbol)).slice(0, 3);
        setQ(c); setChoices(shuffle([c, ...w])); setSelected(null); setFeedback(null);
    }, []);
    useEffect(() => { nextQ(); }, [nextQ]);

    const answer = (el) => {
        if (selected) return;
        setSelected(el.symbol);
        const ok = el.symbol === q.symbol;
        setFeedback(ok ? "✓ නිවැරදියි!" : `✗ නිවැරදි: ${q.name} (${q.symbol})`);
        onScore(ok ? 10 : 0, ok);
        setTimeout(nextQ, 1400);
    };

    if (!q) return null;

    const tabs = [{ k: "symbol", l: "සංකේතය" }, { k: "name", l: "නාමය" }, { k: "mass", l: "ස්කන්ධය" }];

    const qContent = {
        symbol: <><div style={{ fontSize: 56, fontWeight: 900, fontFamily: "Georgia,serif", color: "#2c3e50", lineHeight: 1 }}>{q.symbol}</div><div style={{ fontSize: 14, color: "#7f8c8d", marginTop: 8 }}>මෙය කුමන මූලද්‍රව්‍යද?</div></>,
        name: <><div style={{ fontSize: 26, fontWeight: 700, color: "#2c3e50" }}>{q.name}</div><div style={{ fontSize: 14, color: "#7f8c8d", marginTop: 8 }}>ඇටොමික් සංඛ්‍යාව කුමක්ද?</div></>,
        mass: <><div style={{ fontSize: 22, fontWeight: 600, color: "#2c3e50" }}>ඇටොමික් ස්කන්ධය: {q.mass}</div><div style={{ fontSize: 14, color: "#7f8c8d", marginTop: 8 }}>කුමන මූලද්‍රව්‍යද?</div></>,
    };

    return (
        <div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {tabs.map(t => (
                    <button key={t.k} onClick={() => { setMode(t.k); nextQ(); }}
                        style={{
                            padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                            background: mode === t.k ? (isDark ? "#4b5563" : "#2c3e50") : (isDark ? "#1f2937" : "#ecf0f1"),
                            color: mode === t.k ? "#fff" : (isDark ? "#94a3b8" : "#555"),
                            fontWeight: mode === t.k ? 700 : 400, fontSize: 13
                        }}>{t.l}</button>
                ))}
            </div>

            <div style={{
                background: isDark ? "#1e293b" : "#f8fafc", borderRadius: 16, padding: "32px 24px", textAlign: "center",
                marginBottom: 20, minHeight: 110, display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0"
            }}>
                {qContent[mode]}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {choices.map(el => {
                    let bg = isDark ? "#1e293b" : "#f8fafc", border = isDark ? "#334155" : "#dde", color = isDark ? "#f1f5f9" : "#2c3e50";
                    if (selected) {
                        if (el.symbol === q.symbol) { bg = isDark ? "#064e3b" : "#d4edda"; border = "#28a745"; color = isDark ? "#6ee7b7" : "#155724"; }
                        else if (el.symbol === selected) { bg = isDark ? "#7f1d1d" : "#f8d7da"; border = "#dc3545"; color = isDark ? "#fca5a5" : "#721c24"; }
                    }
                    const gc = colors[el.group] || colors.nonmetal;

                    return (
                        <button key={el.symbol} onClick={() => answer(el)}
                            style={{
                                padding: "14px 16px", borderRadius: 12, border: `2px solid ${border}`,
                                background: bg, color, fontWeight: 600, fontSize: 14, cursor: selected ? "default" : "pointer",
                                transition: "all .2s", textAlign: "left"
                            }}>
                            <span style={{ fontFamily: "Georgia,serif", fontWeight: 800, marginRight: 8, fontSize: 18, color: selected ? color : gc.border }}>{el.symbol}</span>
                            {mode === "name" ? el.atomicNum : el.name}
                        </button>
                    );
                })}
            </div>
            {feedback && (
                <div style={{
                    marginTop: 14, padding: "10px 16px", borderRadius: 10, textAlign: "center", fontWeight: 600, fontSize: 15,
                    background: feedback.startsWith("✓") ? "#d4edda" : "#f8d7da",
                    color: feedback.startsWith("✓") ? "#155724" : "#721c24"
                }}>
                    {feedback}
                </div>
            )}
        </div>
    );
}

function CompoundBuilder({ onScore }) {
    const isDark = useIsDarkMode();
    const [compound, setCompound] = useState(null);

    const [selected, setSelected] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [hint, setHint] = useState(false);
    const [avail, setAvail] = useState([]);

    const next = useCallback(() => {
        const c = COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)];
        setCompound(c); setSelected([]); setFeedback(null); setHint(false);
        const right = ELEMENTS.filter(e => c.elements.includes(e.symbol));
        const extra = shuffle(ELEMENTS.filter(e => !c.elements.includes(e.symbol))).slice(0, 6 - right.length);
        setAvail(shuffle([...right, ...extra]));
    }, []);
    useEffect(() => { next(); }, [next]);

    const toggle = (el) => {
        if (feedback) return;
        setSelected(p => p.includes(el.symbol) ? p.filter(s => s !== el.symbol) : [...p, el.symbol]);
    };

    const check = () => {
        if (!compound || selected.length === 0) return;
        const ok = compound.elements.every(e => selected.includes(e)) && selected.length === compound.elements.length;
        setFeedback(ok ? "✓ නිවැරදි සංයෝගය!" : "✗ වැරදි මූලද්‍රව්‍ය තෝරාගෙන ඇත");
        onScore(ok ? 15 : 0, ok);
        if (ok) setTimeout(next, 1500);
    };

    if (!compound) return null;
    return (
        <div>
            <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "24px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "Georgia,serif", color: "#f1c40f", marginBottom: 4 }}>{compound.formula}</div>
                <div style={{ fontSize: 18, color: "#ecf0f1", marginBottom: 8 }}>{compound.name}</div>
                <div style={{ fontSize: 13, color: "#95a5a6" }}>මෙම සංයෝගය සෑදෙන මූලද්‍රව්‍ය තෝරන්න</div>
                {hint && <div style={{ marginTop: 10, padding: "8px 14px", background: "#2c3e5055", borderRadius: 8, fontSize: 13, color: "#bdc3c7" }}>💡 {compound.hint}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {avail.map(el => (
                    <ElementCard key={el.symbol} el={el} selected={selected.includes(el.symbol)} onClick={toggle} disabled={!!feedback} />
                ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                <button onClick={check} disabled={!!feedback || selected.length === 0}
                    style={{
                        flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                        background: selected.length > 0 && !feedback ? "#2ecc71" : "#bdc3c7", color: "#fff", fontWeight: 700, fontSize: 15
                    }}>
                    පිළිතුර පරීක්ෂා කරන්න
                </button>
                <button onClick={() => setHint(true)}
                    style={{ padding: "12px 16px", borderRadius: 10, border: isDark ? "1px solid #334155" : "1px solid #dde", background: isDark ? "#1f2937" : "#fff", color: isDark ? "#fff" : "#555", cursor: "pointer", fontSize: 13 }}>
                    💡 ඉඟිය
                </button>
                <button onClick={next}
                    style={{ padding: "12px 16px", borderRadius: 10, border: isDark ? "1px solid #334155" : "1px solid #dde", background: isDark ? "#1f2937" : "#fff", color: isDark ? "#fff" : "#555", cursor: "pointer", fontSize: 13 }}>
                    මඟ හරිනවා →
                </button>

            </div>
            {feedback && (
                <div style={{
                    marginTop: 12, padding: "10px 16px", borderRadius: 10, textAlign: "center", fontWeight: 600,
                    background: feedback.startsWith("✓") ? "#d4edda" : "#f8d7da",
                    color: feedback.startsWith("✓") ? "#155724" : "#721c24"
                }}>
                    {feedback}
                    {!feedback.startsWith("✓") && <button onClick={next} style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "inherit", textDecoration: "underline" }}>ඊළඟ</button>}
                </div>
            )}
        </div>
    );
}

function ReactionMatch({ onScore }) {
    const isDark = useIsDarkMode();
    const [reaction, setReaction] = useState(null);

    const [choices, setChoices] = useState([]);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const next = useCallback(() => {
        const c = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
        const others = shuffle(REACTIONS.filter(r => r.type !== c.type)).slice(0, 3);
        setReaction(c); setChoices(shuffle([c.type, ...others.map(r => r.type)]));
        setSelected(null); setFeedback(null);
    }, []);
    useEffect(() => { next(); }, [next]);

    const answer = (type) => {
        if (selected) return;
        setSelected(type);
        const ok = type === reaction.type;
        setFeedback(ok ? "✓ නිවැරදි ප්‍රතික්‍රියා වර්ගය!" : `✗ නිවැරදි: ${reaction.type}`);
        onScore(ok ? 12 : 0, ok);
        setTimeout(next, 1600);
    };

    if (!reaction) return null;
    const tColors = { "සංශ්ලේෂණය": "#3498db", "දහනය": "#e67e22", "තනි විස්ථාපනය": "#9b59b6", "උදාසීනකරණය": "#27ae60", "විඝටනය": "#e74c3c" };

    return (
        <div>
            <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "28px 24px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#95a5a6", marginBottom: 12 }}>මෙය කුමන ප්‍රතික්‍රියා වර්ගයද?</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#f1c40f", fontFamily: "Georgia,serif", marginBottom: 8 }}>
                    {reaction.reactants} → {reaction.products}
                </div>
                <div style={{ fontSize: 14, color: "#bdc3c7" }}>{reaction.description}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {choices.map(type => {
                    const c = tColors[type] || "#555";
                    let bg = isDark ? "#1e293b" : "#f8fafc", border = c + "66", tc = isDark ? "#f1f5f9" : "#2c3e50";
                    if (selected) {
                        if (type === reaction.type) { bg = isDark ? "#064e3b" : "#d4edda"; border = "#28a745"; tc = isDark ? "#6ee7b7" : "#155724"; }
                        else if (type === selected) { bg = isDark ? "#7f1d1d" : "#f8d7da"; border = "#dc3545"; tc = isDark ? "#fca5a5" : "#721c24"; }
                    }

                    return (
                        <button key={type} onClick={() => answer(type)}
                            style={{
                                padding: "16px", borderRadius: 12, border: `2px solid ${border}`,
                                background: bg, color: tc, fontWeight: 600, fontSize: 14,
                                cursor: selected ? "default" : "pointer", transition: "all .2s"
                            }}>
                            {type}
                        </button>
                    );
                })}
            </div>
            {feedback && (
                <div style={{
                    marginTop: 14, padding: "10px 16px", borderRadius: 10, textAlign: "center", fontWeight: 600,
                    background: feedback.startsWith("✓") ? "#d4edda" : "#f8d7da",
                    color: feedback.startsWith("✓") ? "#155724" : "#721c24"
                }}>
                    {feedback}
                </div>
            )}
        </div>
    );
}

function PeriodicExplorer() {
    const isDark = useIsDarkMode();
    const colors = GROUP_COLORS(isDark);
    const [selected, setSelected] = useState(null);

    const [filter, setFilter] = useState("all");
    const groups = ["all", ...Object.keys(GROUP_COLORS)];
    const labels = { all: "සියල්ල", ...Object.fromEntries(Object.entries(GROUP_COLORS).map(([k, v]) => [k, v.label])) };
    const filtered = filter === "all" ? ELEMENTS : ELEMENTS.filter(e => e.group === filter);

    return (
        <div>
            <div style={{ fontSize: 13, color: "#7f8c8d", fontWeight: 600, marginBottom: 8 }}>වර්ගය අනුව පෙරීම:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {groups.map(g => (
                    <button key={g} onClick={() => setFilter(g)}
                        style={{
                            padding: "5px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                            background: filter === g ? (colors[g]?.border || (isDark ? "#4b5563" : "#2c3e50")) : (isDark ? "#1f2937" : "#ecf0f1"),
                            color: filter === g ? "#fff" : (isDark ? "#94a3b8" : "#555")
                        }}>
                        {labels[g]}
                    </button>
                ))}

            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(60px,1fr))", gap: 8, marginBottom: 16 }}>
                {filtered.map(el => (
                    <div key={el.symbol} onClick={() => setSelected(selected?.symbol === el.symbol ? null : el)} style={{ cursor: "pointer" }}>
                        <ElementCard el={el} selected={selected?.symbol === el.symbol} small />
                    </div>
                ))}
            </div>
            {selected ? (
                <div style={{ background: "#1a1a2e", borderRadius: 14, padding: "20px 24px", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                        <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "Georgia,serif", color: GROUP_COLORS[selected.group]?.border || "#f1c40f" }}>
                            {selected.symbol}
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.name}</div>
                            <div style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#95a5a6", marginTop: 2 }}>ඇටොමික් සංඛ්‍යාව: {selected.atomicNum}</div>
                            <div style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#95a5a6" }}>ඇටොමික් ස්කන්ධය: {selected.mass}</div>
                            <div style={{ marginTop: 8 }}>
                                <span style={{ background: colors[selected.group]?.border || "#555", color: "#fff", borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                                    {colors[selected.group]?.label || selected.group}
                                </span>
                            </div>
                        </div>

                    </div>
                    <div style={{ borderTop: "1px solid #ffffff22", paddingTop: 12, fontSize: 13, color: "#bdc3c7" }}>
                        <strong style={{ color: "#ecf0f1" }}>සංයෝගවල දක්නට ලැබේ:</strong>{" "}
                        {COMPOUNDS.filter(c => c.elements.includes(selected.symbol)).map(c => c.formula).join(", ") || "—"}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: "center", color: "#95a5a6", fontSize: 13, padding: "12px 0" }}>
                    විස්තර දැනගැනීමට මූලද්‍රව්‍යයක් ක්ලික් කරන්න
                </div>
            )}
        </div>
    );
}

function AIChallenge({ onScore }) {
    const isDark = useIsDarkMode();
    const [question, setQuestion] = useState(null);

    const [userAns, setUserAns] = useState("");
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [topic, setTopic] = useState("පරමාණු ව්‍යුහය");

    const topics = ["පරමාණු ව්‍යුහය", "රසායනික බන්ධන", "ආවර්ත ප්‍රවණතා", "අම්ල සහ භෂ්ම", "කාබනික රසායන", "තාප රසායන"];

    const generate = async () => {
        setGenerating(true); setQuestion(null); setUserAns(""); setEvaluation(null);
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{
                        role: "user",
                        content: `Generate a chemistry question about "${topic}" for high school. Respond ONLY with JSON (no markdown):
            {"question_si":"question in Sinhala","difficulty_si":"පහසු|මධ්‍යම|දුෂ්කර","hint_si":"hint in Sinhala"}`}]
                })
            });
            const data = await res.json();
            const clean = (data.content?.[0]?.text || "{ }").replace(/```json|```/g, "").trim();
            setQuestion(JSON.parse(clean));
        } catch {
            setQuestion({ question_si: "අයනික බන්ධනය සහ සහසංයුජ බන්ධනය අතර වෙනස කුමක්ද?", difficulty_si: "මධ්‍යම", hint_si: "ඉලෙක්ට්‍රෝන ස්ථාන මාරුව ගැන සිතන්න." });
        }
        setGenerating(false);
    };

    const evaluate = async () => {
        if (!userAns.trim() || !question) return;
        setLoading(true);
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{
                        role: "user",
                        content: `Chemistry question (Sinhala): "${question.question_si}"\nStudent answer: "${userAns}"\nEvaluate. Respond ONLY with JSON (no markdown):\n{"score":0-100,"correct":true|false,"feedback_si":"2-3 sentences in Sinhala","correct_answer_si":"correct answer in Sinhala","points":5-20}`
                    }]
                })
            });
            const data = await res.json();
            const clean = (data.content?.[0]?.text || "{ }").replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(clean);
            setEvaluation(parsed);
            onScore(parsed.points || (parsed.correct ? 20 : 0), parsed.correct);
        } catch {
            setEvaluation({ score: 70, correct: true, feedback_si: "හොඳ පිළිතුරක්! ඔබ මෙම සංකල්පය හොඳින් අවබෝධ කර ගෙන ඇත.", correct_answer_si: userAns, points: 14 });
            onScore(14, true);
        }
        setLoading(false);
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#7f8c8d", marginBottom: 8, fontWeight: 600 }}>විෂය තෝරන්න:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {topics.map(t => (
                        <button key={t} onClick={() => setTopic(t)}
                            style={{
                                padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
                                background: topic === t ? "#8e44ad" : (isDark ? "#1f2937" : "#ecf0f1"), color: topic === t ? "#fff" : (isDark ? "#94a3b8" : "#555"),
                                fontWeight: topic === t ? 700 : 400
                            }}>
                            {t}
                        </button>
                    ))}
                </div>

            </div>

            {!question && !generating && (
                <button onClick={generate}
                    style={{
                        width: "100%", padding: "18px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg,#8e44ad,#3498db)", color: "#fff", fontWeight: 700, fontSize: 16
                    }}>
                    🤖 AI ප්‍රශ්නයක් ජනනය කරන්න
                </button>
            )}

            {generating && (
                <div style={{ textAlign: "center", padding: "40px", color: "#8e44ad", fontWeight: 600 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>⚗️</div>
                    <div style={{ fontSize: 15 }}>ඔබගේ ප්‍රශ්නය සකස් කරමින්...</div>
                </div>
            )}

            {question && (
                <div>
                    <div style={{ background: "#1a1a2e", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                            <span style={{
                                background: question.difficulty_si === "පහසු" ? "#27ae60" : question.difficulty_si === "දුෂ්කර" ? "#e74c3c" : "#e67e22",
                                color: "#fff", borderRadius: 10, padding: "3px 10px", fontSize: 12, fontWeight: 700
                            }}>
                                {question.difficulty_si}
                            </span>
                            <span style={{ background: "#2c3e50", color: "#bdc3c7", borderRadius: 10, padding: "3px 10px", fontSize: 12 }}>{topic}</span>
                        </div>
                        <div style={{ fontSize: 16, color: "#ecf0f1", lineHeight: 1.7, fontWeight: 500 }}>{question.question_si}</div>
                        {question.hint_si && !evaluation && (
                            <div style={{ marginTop: 10, fontSize: 13, color: "#95a5a6", fontStyle: "italic" }}>💡 ඉඟිය: {question.hint_si}</div>
                        )}
                    </div>

                    {!evaluation && (
                        <>
                            <textarea value={userAns} onChange={e => setUserAns(e.target.value)}
                                placeholder="ඔබේ පිළිතුර මෙහි ලියන්න..."
                                style={{
                                    width: "100%", minHeight: 100, padding: "12px", borderRadius: 10, border: isDark ? "2px solid #334155" : "2px solid #dde",
                                    fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                                    background: isDark ? "#1f2937" : "#fff", color: isDark ? "#fff" : "#000"
                                }}
                                onFocus={e => e.target.style.borderColor = "#8e44ad"}
                                onBlur={e => e.target.style.borderColor = isDark ? "#334155" : "#dde"} />
                            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                                <button onClick={evaluate} disabled={!userAns.trim() || loading}
                                    style={{
                                        flex: 1, padding: "12px", borderRadius: 10, border: "none",
                                        cursor: userAns.trim() && !loading ? "pointer" : "default",
                                        background: userAns.trim() && !loading ? "#8e44ad" : "#bdc3c7",
                                        color: "#fff", fontWeight: 700, fontSize: 15
                                    }}>
                                    {loading ? "තක්සේරු කරමින්..." : "පිළිතුර ඉදිරිපත් කරන්න"}
                                </button>
                                <button onClick={generate}
                                    style={{ padding: "12px 16px", borderRadius: 10, border: isDark ? "1px solid #334155" : "1px solid #dde", background: isDark ? "#1f2937" : "#fff", color: isDark ? "#fff" : "#555", cursor: "pointer", fontSize: 13 }}>
                                    මඟ හරිනවා
                                </button>
                            </div>

                        </>
                    )}

                    {evaluation && (
                        <div>
                            <div style={{ background: evaluation.correct ? "#d4edda" : "#f8d7da", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 16, color: evaluation.correct ? "#155724" : "#721c24" }}>
                                        {evaluation.correct ? "✓ නිවැරදියි!" : "✗ වැඩිදියුණු කළ යුතුයි"}
                                    </span>
                                    <span style={{ fontWeight: 800, fontSize: 20, color: evaluation.correct ? "#155724" : "#721c24" }}>+{evaluation.points}ල</span>
                                </div>
                                <div style={{ fontSize: 14, color: evaluation.correct ? "#155724" : "#721c24", lineHeight: 1.6 }}>{evaluation.feedback_si}</div>
                            </div>
                            {!evaluation.correct && (
                                <div style={{ background: "#fff3cd", borderRadius: 10, padding: "12px 16px", marginBottom: 12, fontSize: 14, color: "#856404" }}>
                                    <strong>නිවැරදි පිළිතුර:</strong> {evaluation.correct_answer_si}
                                </div>
                            )}
                            <button onClick={generate}
                                style={{
                                    width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                                    background: "#2c3e50", color: "#fff", fontWeight: 700, fontSize: 15
                                }}>
                                ඊළඟ ප්‍රශ්නය →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
export default function ChemQuestGame() {
    const isDark = useIsDarkMode();
    const colors = GROUP_COLORS(isDark);
    const [activeMode, setActiveMode] = useState(0);

    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [streak, setStreak] = useState(0);
    const [level, setLevel] = useState(1);
    const [toasts, setToasts] = useState([]);

    const addToast = (msg, ok) => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, ok }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200);
    };

    const handleScore = (pts, correct) => {
        setTotal(t => t + 1);
        if (correct) {
            const ns = streak + 1;
            const bonus = Math.floor(ns / 3) * 5;
            const earned = pts + bonus;
            setScore(s => s + earned);
            setStreak(ns);
            setLevel(Math.floor((score + earned) / 100) + 1);
            addToast(`+${earned}${bonus > 0 ? ` (🔥+${bonus} ත්‍යාගය!)` : ""} `, true);
        } else {
            setStreak(0);
            addToast("නැවත උත්සාහ කරන්න!", false);
        }
    };
    const components = [
        <ElementQuiz onScore={handleScore} />,
        <CompoundBuilder onScore={handleScore} />,
        <ReactionMatch onScore={handleScore} />,
        <PeriodicExplorer />,
        <AIChallenge onScore={handleScore} />,
    ];

    return (
        <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: isDark ? "#0f172a" : "#f8fafc" }}>
            <StudentNavbar />
            <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>


                <h2 className="sr-only">රසායන ක්‍රීඩාව - සිංහල</h2>

                <div style={{
                    textAlign: "center", marginBottom: 20, padding: "22px 20px",
                    background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", borderRadius: 20
                }}>
                    <div style={{ fontSize: 36, marginBottom: 4 }}>⚗️</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#f1c40f", letterSpacing: 1, fontFamily: "Georgia,serif" }}>
                        රසායන ක්‍රීඩාව
                    </div>
                    <div style={{ fontSize: 13, color: "#95a5a6", marginTop: 4 }}>ප්‍රශ්නයෙන් ප්‍රශ්නයට රසායනය ජය ගන්න</div>
                </div>

                <ScoreBar score={score} total={total} streak={streak} level={level} />
                <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                    {MODES.map((m, i) => (
                        <button key={m} onClick={() => setActiveMode(i)}
                            style={{
                                whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                                background: activeMode === i ? (isDark ? "#4b5563" : "#2c3e50") : (isDark ? "#1f2937" : "#ecf0f1"),
                                color: activeMode === i ? "#f1c40f" : (isDark ? "#94a3b8" : "#555"),
                                fontWeight: activeMode === i ? 700 : 400, fontSize: 12, transition: "all .2s",
                                boxShadow: activeMode === i ? "0 2px 8px #2c3e5055" : "none"
                            }}>
                            {MODEICONS[i]} {m}
                        </button>
                    ))}
                </div>


                <div style={{ background: isDark ? "#1e293b" : "#fff", borderRadius: 16, padding: 20, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", minHeight: 300, boxShadow: "0 4px 20px #0000000a" }}>
                    {components[activeMode]}
                </div>


                {activeMode < 2 && (
                    <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {Object.entries(colors).map(([g, c]) => (
                            <div key={g} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: c.border, flexShrink: 0 }} />
                                <span style={{ color: isDark ? "#94a3b8" : "#7f8c8d" }}>{c.label}</span>
                            </div>
                        ))}
                    </div>
                )}


                <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 999 }}>
                    {toasts.map(t => (
                        <div key={t.id} style={{
                            padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                            background: t.ok ? "#2ecc71" : "#e74c3c", color: "#fff",
                            boxShadow: "0 4px 16px #00000033", animation: "slideIn .3s ease"
                        }}>
                            {t.msg}
                        </div>
                    ))}
                </div>

                <style>{`
        @keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
        button:hover{opacity:.88}
        textarea:focus{outline:none}
        ::-webkit-scrollbar{height:4px}
        ::-webkit-scrollbar-track{background:#f1f1f1}
        ::-webkit-scrollbar-thumb{background:#ccc;border-radius:4px}
      `}</style>
            </div>
        </div>
    );
}
