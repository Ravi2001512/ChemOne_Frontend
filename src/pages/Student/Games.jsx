import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';
import { Trophy, X, Medal } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- ප්‍රශ්න 100 ක බැංකුව ---
const TOTAL_QUESTIONS = [
    { q: "ප්‍රබල අම්ලයක pH අගය කීයද?", a: "1-3", b: "11-14", correct: "a", effect: "ACID" },
    { q: "සෘණ ආරෝපණයක් සහිත අංශුව කුමක්ද?", a: "ප්‍රෝටෝනය", b: "ඉලෙක්ට්‍රෝනය", correct: "b", effect: "SHOCK" },
    { q: "සෝඩියම් ජලය සමග ප්‍රතික්‍රියා කළ විට?", a: "පිපිරුමක් ඇතිවේ", b: "අයිස් සෑදේ", correct: "a", effect: "BOOM" },
    { q: "රත්තරන් වල රසායනික සංකේතය කුමක්ද?", a: "Au", b: "Gd", correct: "a", effect: "ACID" },
    { q: "කාබන් වල සංයුජතාව කීයද?", a: "2", b: "4", correct: "b", effect: "SHOCK" },
    { q: "වාතයේ වැඩිපුරම ඇති වායුව?", a: "ඔක්සිජන්", b: "නයිට්‍රජන්", correct: "b", effect: "BOOM" },
    { q: "දියමන්ති සෑදී ඇත්තේ කුමන මූලද්‍රව්‍යයෙන්ද?", a: "කාබන්", b: "සිලිකන්", correct: "a", effect: "SHOCK" },
    { q: "ලුණු වල රසායනික නාමය?", a: "NaCl", b: "KCl", correct: "a", effect: "ACID" },
    { q: "ඕසෝන් ස්ථරයේ සංකේතය?", a: "O2", b: "O3", correct: "b", effect: "BOOM" },
    { q: "යකඩ මලකෑමට අවශ්‍ය වන්නේ?", a: "ජලය හා ඔක්සිජන්", b: "නයිට්‍රජන්", correct: "a", effect: "ACID" },
    { q: "ආවර්තිතා වගුවේ 1 වන මූලද්‍රව්‍යය?", a: "හයිඩ්‍රජන්", b: "හීලියම්", correct: "a", effect: "SHOCK" },
    { q: "හීලියම් යනු කුමන වර්ගයේ වායුවක්ද?", a: "උදාසීන වායුවකි", b: "සක්‍රීය වායුවකි", correct: "a", effect: "BOOM" },
    { q: "ජලයේ රසායනික සූත්‍රය?", a: "HO2", b: "H2O", correct: "b", effect: "ACID" },
    { q: "කාබන් ඩයොක්සයිඩ් වායුවේ සූත්‍රය?", a: "CO2", b: "CO", correct: "a", effect: "BOOM" },
    { q: "පරමාණුවක න්‍යෂ්ටියේ ඇත්තේ?", a: "ප්‍රෝටෝන හා නියුට්‍රෝන", b: "ඉලෙක්ට්‍රෝන පමණි", correct: "a", effect: "SHOCK" },
    { q: "භෂ්මයක pH අගය?", a: "7 ට වැඩි", b: "7 ට අඩු", correct: "a", effect: "ACID" },
    { q: "ලෝහයක් නොවන මූලද්‍රව්‍යය කුමක්ද?", a: "යකඩ", b: "සල්ෆර්", correct: "b", effect: "BOOM" },
    { q: "මිනිස් සිරුරේ වැඩිපුරම ඇති ලෝහය?", a: "යකඩ", b: "කැල්සියම්", correct: "b", effect: "SHOCK" },
    { q: "සල්ෆියුරික් අම්ලයේ සූත්‍රය?", a: "H2SO4", b: "HCl", correct: "a", effect: "ACID" },
    { q: "හයිඩ්‍රොක්ලෝරික් අම්ලයේ සූත්‍රය?", a: "H2SO4", b: "HCl", correct: "b", effect: "BOOM" },
    { q: "ස්කන්ධ ක්‍රමාංකය යනු?", a: "p + n එකතුව", b: "p ගණන පමණි", correct: "a", effect: "SHOCK" },
    { q: "පැන්සල් කූරු සෑදීමට ගන්නා ද්‍රව්‍යය?", a: "මිනිරන්", b: "ගල් අඟුරු", correct: "a", effect: "ACID" },
    { q: "හුණුගල් වල රසායනික නාමය?", a: "කැල්සියම් කාබනේට්", b: "සෝඩියම් කාබනේට්", correct: "a", effect: "BOOM" },
    { q: "වියළි අයිස් යනු කුමක්ද?", a: "ඝන CO2", b: "ඝන O2", correct: "a", effect: "SHOCK" },
    { q: "පරමාණුක ක්‍රමාංකය 11 වූ මූලද්‍රව්‍යය?", a: "මැග්නීසියම්", b: "සෝඩියම්", correct: "b", effect: "ACID" },
    { q: "ලෝහ රත් කළ විට ප්‍රසාරණය?", a: "වේ", b: "නොවේ", correct: "a", effect: "BOOM" },
    { q: "ඇලුමිනියම් වල රසායනික සංකේතය?", a: "Al", b: "Am", correct: "a", effect: "SHOCK" },
    { q: "රසදිය (Mercury) කාමර උෂ්ණත්වයේදී?", a: "ඝන", b: "ද්‍රව", correct: "b", effect: "ACID" },
    { q: "විදුලිය හොඳින්ම ගෙන යන ලෝහය?", a: "තඹ", b: "රිදී", correct: "b", effect: "BOOM" },
    { q: "ගිනිකූරු නිෂ්පාදනයට ගන්නා මූලද්‍රව්‍යය?", a: "සල්ෆර්", b: "පොස්පරස්", correct: "b", effect: "SHOCK" },
    { q: "මීතේන් වායුවේ සූත්‍රය?", a: "CH4", b: "C2H6", correct: "a", effect: "ACID" },
    { q: "ග්ලූකෝස් අණුවක කාබන් පරමාණු ගණන?", a: "6", b: "12", correct: "a", effect: "BOOM" },
    { q: "ප්‍රෝටෝනයක ආරෝපණය?", a: "ධන", b: "සෘණ", correct: "a", effect: "SHOCK" },
    { q: "නියුට්‍රෝනයක ආරෝපණය?", a: "උදාසීන", b: "ධන", correct: "a", effect: "ACID" },
    { q: "ඇමෝනියා වායුවේ සූත්‍රය?", a: "NH3", b: "NO2", correct: "a", effect: "BOOM" },
    { q: "පොටෑසියම් වල රසායනික සංකේතය?", a: "P", b: "K", correct: "b", effect: "SHOCK" },
    { q: "මැග්නීසියම් පීත්ත පටියක් දහනය වූ විට ලැබෙන වර්ණය?", a: "දීප්තිමත් සුදු", b: "නිල්", correct: "a", effect: "ACID" },
    { q: "පිත්තල සෑදීමට ගන්නා ලෝහ?", a: "තඹ හා සින්ක්", b: "තඹ හා ටින්", correct: "a", effect: "BOOM" },
    { q: "ලෝකඩ (Bronze) සෑදීමට ගන්නා ලෝහ?", a: "තඹ හා ටින්", b: "යකඩ හා නිකල්", correct: "a", effect: "SHOCK" },
    { q: "ආවර්තිතා වගුවේ 18 වන කාණ්ඩය?", a: "උදාසීන වායු", b: "හැලජන", correct: "a", effect: "ACID" },
    { q: "ක්ලෝරීන් වල පරමාණුක ක්‍රමාංකය?", a: "17", b: "18", correct: "a", effect: "BOOM" },
    { q: "හීලියම් පරමාණුවක ඉලෙක්ට්‍රෝන ගණන?", a: "1", b: "2", correct: "b", effect: "SHOCK" },
    { q: "නියොන් (Neon) වල සංකේතය?", a: "Ne", b: "Ni", correct: "a", effect: "ACID" },
    { q: "කැල්සියම් වල සංයුජතාව?", a: "1", b: "2", correct: "b", effect: "BOOM" },
    { q: "යකඩ වල සංකේතය?", a: "Fe", b: "Ir", correct: "a", effect: "SHOCK" },
    { q: "තඹ වල සංකේතය?", a: "Cu", b: "Co", correct: "a", effect: "ACID" },
    { q: "රිදී වල සංකේතය?", a: "Ag", b: "Si", correct: "a", effect: "BOOM" },
    { q: "ඊයම් (Lead) වල සංකේතය?", a: "Pb", b: "Ld", correct: "a", effect: "SHOCK" },
    { q: "අයඩීන් වල වර්ණය?", a: "තද දම්", b: "කහ", correct: "a", effect: "ACID" },
    { q: "එතනෝල් වල ක්‍රියාකාරී සමූහය?", a: "-OH", b: "-COOH", correct: "a", effect: "BOOM" },
    { q: "අම්ලයක් හා භෂ්මයක් ප්‍රතික්‍රියා කිරීම?", a: "උදාසීනීකරණය", b: "ඔක්සිකරණය", correct: "a", effect: "SHOCK" },
    { q: "ප්‍රතික්‍රියාවක වේගය වැඩි කරන ද්‍රව්‍ය?", a: "උත්ප්‍රේරක", b: "ප්‍රතික්‍රියක", correct: "a", effect: "ACID" },
    { q: "ස්වාභාවික වායුවේ ප්‍රධාන සංරචකය?", a: "මීතේන්", b: "ප්‍රොපේන්", correct: "a", effect: "BOOM" },
    { q: "LP ගෑස් වල අඩංගු වායූන්?", a: "ප්‍රොපේන් හා බියුටේන්", b: "මීතේන් හා එතේන්", correct: "a", effect: "SHOCK" },
    { q: "පරමාණුක ස්කන්ධ ඒකකය?", a: "amu", b: "kg", correct: "a", effect: "ACID" },
    { q: "මවුලය යනු කුමක්ද?", a: "ද්‍රව්‍ය ප්‍රමාණය මැනීමේ ඒකකය", b: "බර මැනීමේ ඒකකය", correct: "a", effect: "BOOM" },
    { q: "ඇවගාඩ්‍රෝ නියතය?", a: "6.022 x 10^23", b: "1.6 x 10^-19", correct: "a", effect: "SHOCK" },
    { q: "නැප්තලීන් වලට සිදුවන සංසිද්ධිය?", a: "ඌර්ධවපාතනය", b: "වාෂ්පීකරණය", correct: "a", effect: "ACID" },
    { q: "කිරි ඇඹුල් වීමට හේතු වන අම්ලය?", a: "ලැක්ටික් අම්ලය", b: "සිට්‍රික් අම්ලය", correct: "a", effect: "BOOM" },
    { q: "දෙහි වල අඩංගු අම්ලය?", a: "සිට්‍රික් අම්ලය", b: "ටාටරික් අම්ලය", correct: "a", effect: "SHOCK" },
    { q: "විනාකිරි වල අඩංගු අම්ලය?", a: "ඇසිටික් අම්ලය", b: "ෆෝමික් අම්ලය", correct: "a", effect: "ACID" },
    { q: "හුණු වතුර කිරි පැහැ ගැන්වෙන වායුව?", a: "CO2", b: "O2", correct: "a", effect: "BOOM" },
    { q: "හයිඩ්‍රජන් වායුව හඳුනා ගැනීමේ පරීක්ෂාව?", a: "පොප් හඬ", b: "නිල් දැල්ල", correct: "a", effect: "SHOCK" },
    { q: "ගිනි නිවන උපකරණ වල භාවිතා වන වායුව?", a: "CO2", b: "O2", correct: "a", effect: "ACID" },
    { q: "ඉලෙක්ට්‍රෝන පිටකිරීම?", a: "ඔක්සිකරණය", b: "ඔක්සිහරණය", correct: "a", effect: "BOOM" },
    { q: "ඉලෙක්ට්‍රෝන ලබාගැනීම?", a: "ඔක්සිහරණය", b: "ඔක්සිකරණය", correct: "a", effect: "SHOCK" },
    { q: "බෝර් ආකෘතියේ 2 වන ශක්ති මට්ටමේ උපරිම ඉලෙක්ට්‍රෝන?", a: "8", b: "2", correct: "a", effect: "ACID" },
    { q: "පොස්පරස් වල සංකේතය?", a: "P", b: "Ph", correct: "a", effect: "BOOM" },
    { q: "සල්ෆර් වල සංකේතය?", a: "S", b: "Su", correct: "a", effect: "SHOCK" },
    { q: "ෆ්ලෝරීන් වල සංකේතය?", a: "F", b: "Fl", correct: "a", effect: "ACID" },
    { q: "මැග්නීසියම් වල සංකේතය?", a: "Mg", b: "Mn", correct: "a", effect: "BOOM" },
    { q: "සින්ක් වල සංකේතය?", a: "Zn", b: "Z", correct: "a", effect: "SHOCK" },
    { q: "යකඩ ඔක්සයිඩ් වල වර්ණය?", a: "රතු දුඹුරු", b: "නිල්", correct: "a", effect: "ACID" },
    { q: "තඹ සල්ෆේට් වල වර්ණය?", a: "නිල්", b: "කහ", correct: "a", effect: "BOOM" },
    { q: "පිරිසිදු රත්තරන් වල කැරට් අගය?", a: "24", b: "22", correct: "a", effect: "SHOCK" },
    { q: "කාබනික රසායනයේ පදනම කුමක්ද?", a: "කාබන්", b: "නයිට්‍රජන්", correct: "a", effect: "ACID" },
    { q: "පොලිමර් වල ඒකකය?", a: "මොනෝමර්", b: "අණු", correct: "a", effect: "BOOM" },
    { q: "ස්වාභාවික රබර් වල මූලික ඒකකය?", a: "අයිසොප්‍රීන්", b: "එතීන්", correct: "a", effect: "SHOCK" },
    { q: "වල්කනයිස් කළ රබර් වල අඩංගු මූලද්‍රව්‍යය?", a: "සල්ෆර්", b: "නයිට්‍රජන්", correct: "a", effect: "ACID" },
    { q: "ආවර්තිතා වගුව නිපදවූ විද්‍යාඥයා?", a: "මෙන්ඩලීව්", b: "නියුටන්", correct: "a", effect: "BOOM" },
    { q: "ඇල්කේන වල පොදු සූත්‍රය?", a: "CnH2n+2", b: "CnH2n", correct: "a", effect: "SHOCK" },
    { q: "ඇල්කීන වල පොදු සූත්‍රය?", a: "CnH2n", b: "CnH2n-2", correct: "a", effect: "ACID" },
    { q: "පළතුරු ඉදවීමට ගන්නා වායුව?", a: "එතිලීන්", b: "මීතේන්", correct: "a", effect: "BOOM" },
    { q: "ග්‍රැපීන් යනු කුමන මූලද්‍රව්‍යයේ රූපයක්ද?", a: "කාබන්", b: "සිලිකන්", correct: "a", effect: "SHOCK" },
    { q: "ලෝහ විද්‍යුත් සන්නායක වන්නේ ඇයි?", a: "සංචාරක ඉලෙක්ට්‍රෝන නිසා", b: "ප්‍රෝටෝන නිසා", correct: "a", effect: "ACID" },
    { q: "යකඩ මලකෑම වැළැක්වීමට තට්ටුවක් දැමීම?", a: "ගැල්වනයිස් කිරීම", b: "ඌර්ධවපාතනය", correct: "a", effect: "BOOM" },
    { q: "ආහාර කල්තබා ගැනීමට ගන්නා රසායනයක්?", a: "සෝඩියම් බෙන්සොඒට්", b: "සල්ෆියුරික් අම්ලය", correct: "a", effect: "SHOCK" },
    { q: "විද්‍යුත් විච්ඡේදනයකදී ධන අග්‍රය?", a: "ඇනෝඩය", b: "කැතෝඩය", correct: "a", effect: "ACID" },
    { q: "විද්‍යුත් විච්ඡේදනයකදී සෘණ අග්‍රය?", a: "කැතෝඩය", b: "ඇනෝඩය", correct: "a", effect: "BOOM" },
    { q: "සෝඩා බෝතලයක අඩංගු අම්ලය?", a: "කාබොනික් අම්ලය", b: "නයිට්‍රික් අම්ලය", correct: "a", effect: "SHOCK" },
    { q: "හීලියම් පරමාණුවක නියුට්‍රෝන ගණන?", a: "2", b: "1", correct: "a", effect: "ACID" },
    { q: "ඔක්සිජන් වල පරමාණුක ක්‍රමාංකය?", a: "8", b: "16", correct: "a", effect: "BOOM" },
    { q: "නයිට්‍රජන් වල පරමාණුක ක්‍රමාංකය?", a: "7", b: "14", correct: "a", effect: "SHOCK" },
    { q: "සෝඩියම් හයිඩ්‍රොක්සයිඩ් වල pH අගය?", a: "13-14", b: "1-2", correct: "a", effect: "ACID" },
    { q: "කාබනික ද්‍රව්‍ය දහනය වූ විට ලැබෙන වායුව?", a: "CO2", b: "N2", correct: "a", effect: "BOOM" },
    { q: "විදුලි බුබුළු තුළ පුරවන වායුව?", a: "ආගන් (Argon)", b: "ඔක්සිජන්", correct: "a", effect: "SHOCK" },
    { q: "බ්‍රෝමීන් වල වර්ණය?", a: "රතු දුඹුරු ද්‍රවයකි", b: "නිල් වායුවකි", correct: "a", effect: "ACID" },
    { q: "හයිඩ්‍රජන් පෙරොක්සයිඩ් සූත්‍රය?", a: "H2O2", b: "HO", correct: "a", effect: "BOOM" },
    { q: "එස්ටර වල සුවඳ?", a: "සුවඳවත් පළතුරු සුවඳ", b: "නරක සුවඳ", correct: "a", effect: "SHOCK" },
    { q: "ආවර්තිතා වගුවේ 2 වන කාණ්ඩය?", a: "ක්ෂාරීය පාංශු ලෝහ", b: "ක්ෂාර ලෝහ", correct: "a", effect: "ACID" }
];

const MEME_QUOTES = {
    wrong: ["අයියෝ සාන්ත!", "ලැබ් එක ඉවරයි!", "ආයෙත් 6 වසරට පලයන්!", "ටීචර්ට කිව්වා ඕං!", "මොකක්ද ඒ කළේ?", "අයියෝ අයියෝ!", "ගෙදර පලයන් මචං"],
    right: ["අම්මෝ ඒක! 🔥", "සුපිරි වැඩක්!", "හරියටම හරි!", "වැඩ්ඩෙක් තමයි!", "Full Marks!", "සයන්ස් වැඩ්ඩෙක්!", "Boom! Correct!"]
};

export default function ChemBattle100() {
    const [gameState, setGameState] = useState('START');
    const [sessionQuestions, setSessionQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playerHP, setPlayerHP] = useState(100);
    const [enemyHP, setEnemyHP] = useState(100);
    const [feedback, setFeedback] = useState("");
    const [animTrigger, setAnimTrigger] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    // Fetch Leaderboard
    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const res = await API.get('/games/leaderboard/chembattle');
            setLeaderboard(res.data);
            setShowLeaderboard(true);
        } catch (error) {
            console.error("Error fetching leaderboard", error);
            toast.error("Leaderboard එක ලබා ගැනීමට නොහැකි වුණා.");
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    // Submit Score
    const submitScore = async (finalScore) => {
        try {
            await API.post('/games/score', {
                game: 'chembattle',
                score: finalScore
            });
            toast.success("ඔබේ ලකුණු සටහන් කර ගත්තා!");
        } catch (error) {
            console.error("Error submitting score", error);
        }
    };

    // නව වටයක් ආරම්භ කරන විට අහඹු ලෙස ප්‍රශ්න 10ක් තෝරා ගැනීම
    const startNewGame = () => {
        const shuffled = [...TOTAL_QUESTIONS].sort(() => 0.5 - Math.random());
        setSessionQuestions(shuffled.slice(0, 10));
        setPlayerHP(100);
        setEnemyHP(100);
        setCurrentIndex(0);
        setFeedback("වැඩේ පටන් ගමු!");
        setGameState('PLAYING');
    };

    const handleAnswer = (choice) => {
        if (gameState !== 'PLAYING') return;

        const currentQ = sessionQuestions[currentIndex];
        let nextPlayerHP = playerHP;
        let nextEnemyHP = enemyHP;

        if (choice === currentQ.correct) {
            setAnimTrigger(currentQ.effect);
            nextEnemyHP = Math.max(0, enemyHP - 10);
            setEnemyHP(nextEnemyHP);
            setFeedback(MEME_QUOTES.right[Math.floor(Math.random() * MEME_QUOTES.right.length)]);
        } else {
            setAnimTrigger('FAIL');
            nextPlayerHP = Math.max(0, playerHP - 15);
            setPlayerHP(nextPlayerHP);
            setFeedback(MEME_QUOTES.wrong[Math.floor(Math.random() * MEME_QUOTES.wrong.length)]);
        }

        setTimeout(() => {
            setAnimTrigger(null);
            if (currentIndex + 1 < 10 && nextPlayerHP > 0 && nextEnemyHP > 0) {
                setCurrentIndex(prev => prev + 1);
            } else {
                const finalScore = Math.max(0, 100 - nextEnemyHP);
                setGameState('GAMEOVER');
                if (finalScore > 0) submitScore(finalScore);
            }
        }, 1300);
    };

    return (
        <>
            <StudentNavbar />
            <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4">

                {/* HUD Header */}
                <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h1 className="text-xl font-black text-yellow-400">CHEM-BATTLE: 100 Q-BANK</h1>
                    <div className="bg-blue-600/20 px-4 py-1 rounded-full border border-blue-500 text-sm">
                        ප්‍රශ්නය: <span className="text-white font-bold">{currentIndex + 1} / 10</span>
                    </div>
                </div>

                {gameState === 'START' ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                        <p className="mb-6 text-slate-400">ප්‍රශ්න 100න් අහඹු 10කට මුහුණ දෙන්න සූදානම්ද?</p>
                        <div className="flex flex-col gap-4 items-center">
                            <button onClick={startNewGame} className="bg-yellow-500 text-black px-12 py-5 rounded-2xl font-black text-3xl shadow-[0_8px_0_rgb(161,98,7)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(161,98,7)] transition-all">
                                Start Challenge
                            </button>
                            <button onClick={fetchLeaderboard} disabled={loadingLeaderboard} className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold transition-all">
                                <Trophy size={20} />
                                {loadingLeaderboard ? "පූරණය වෙමින්..." : "Leaderboard එක බලන්න"}
                            </button>
                        </div>
                    </motion.div>
                ) : gameState === 'PLAYING' ? (
                    <div className="w-full max-w-4xl relative">

                        {/* Health Section */}
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <motion.div animate={animTrigger === 'FAIL' ? { x: [-5, 5, -5, 5, 0] } : {}} className="relative">
                                <div className="flex justify-between mb-1 text-xs font-bold text-green-400"><span>ඔබ</span><span>{playerHP}%</span></div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <motion.div animate={{ width: `${playerHP}%` }} className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                </div>
                                <div className="text-7xl mt-4 text-center">🧑‍🔬</div>
                            </motion.div>

                            <motion.div animate={['ACID', 'SHOCK', 'BOOM'].includes(animTrigger) ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}} className="relative">
                                <div className="flex justify-between mb-1 text-xs font-bold text-red-500"><span>සතුරා</span><span>{enemyHP}%</span></div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <motion.div animate={{ width: `${enemyHP}%` }} className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                                </div>
                                <div className="text-7xl mt-4 text-center relative">
                                    🧛‍♂️
                                    {animTrigger === 'ACID' && <motion.span initial={{ y: -30 }} animate={{ y: 30, opacity: 0 }} className="absolute inset-0 text-5xl">🧪</motion.span>}
                                    {animTrigger === 'SHOCK' && <motion.span animate={{ opacity: [0, 1, 0] }} className="absolute inset-0 text-cyan-400">⚡</motion.span>}
                                    {animTrigger === 'BOOM' && <motion.span animate={{ scale: [0, 2.5], opacity: [1, 0] }} className="absolute inset-0 text-orange-500">💥</motion.span>}
                                </div>
                            </motion.div>
                        </div>

                        {/* Feedback Popup */}
                        <AnimatePresence>
                            {animTrigger && (
                                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                                    <div className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-black text-3xl shadow-2xl -rotate-2 border-4 border-black">
                                        {feedback}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Question Card */}
                        <div className="bg-slate-900/80 backdrop-blur-md p-10 rounded-[2rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                            <h2 className="text-2xl font-bold text-center mb-10 leading-snug">
                                {sessionQuestions[currentIndex]?.q}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <button onClick={() => handleAnswer('a')} className="bg-slate-800 hover:bg-yellow-500 hover:text-black p-6 rounded-2xl font-bold text-xl transition-all active:scale-95 border-b-4 border-black">
                                    {sessionQuestions[currentIndex]?.a}
                                </button>
                                <button onClick={() => handleAnswer('b')} className="bg-slate-800 hover:bg-yellow-500 hover:text-black p-6 rounded-2xl font-bold text-xl transition-all active:scale-95 border-b-4 border-black">
                                    {sessionQuestions[currentIndex]?.b}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Game Over */
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-slate-900 p-12 rounded-[3rem] border-4 border-yellow-500 text-center shadow-2xl max-w-lg w-full">
                        <h2 className="text-5xl font-black mb-4 text-white uppercase tracking-tighter">
                            {playerHP > 0 && enemyHP === 0 ? "You Won! 🏆" : "Defeated! 💀"}
                        </h2>
                        <p className="text-slate-400 mb-8 font-medium">අවසන් ප්‍රතිඵලය: {100 - enemyHP}% ක ජයක්!</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={startNewGame} className="bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:bg-yellow-400 transition-all shadow-lg active:scale-90 w-full">
                                Play Again
                            </button>
                            <button onClick={fetchLeaderboard} className="bg-slate-800 text-yellow-400 px-12 py-4 rounded-full font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700 w-full flex items-center justify-center gap-2">
                                <Trophy size={20} />
                                Leaderboard
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className="mt-10 text-slate-600 text-xs font-mono">ChemBridge MEME ENGINE • Q-BANK V1.0</div>
            </div>

            {/* Leaderboard Modal */}
            <AnimatePresence>
                {showLeaderboard && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeaderboard(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border-2 border-yellow-500/50 w-full max-w-lg rounded-3xl overflow-hidden relative z-10 shadow-2xl">
                            <div className="bg-yellow-500 p-6 flex justify-between items-center">
                                <h2 className="text-black font-black text-2xl flex items-center gap-2">
                                    <Trophy size={28} />
                                    TOP 10 SCIENTISTS
                                </h2>
                                <button onClick={() => setShowLeaderboard(false)} className="bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all">
                                    <X size={24} className="text-black" />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {leaderboard.length > 0 ? (
                                    <div className="space-y-3">
                                        {leaderboard.map((entry, index) => (
                                            <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-800/50 border-slate-700'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{entry.student?.name || "Unknown Scientist"}</p>
                                                        <p className="text-xs text-slate-400">Batch: {entry.student?.batch || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-yellow-400">{entry.score}%</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Victory</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="text-5xl mb-4 opacity-20">🧪</div>
                                        <p className="text-slate-500 font-medium italic">තවමත් වාර්තා තබා නැත. පළමු වැන්නා වන්න!</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-800/50 p-4 text-center border-t border-slate-800">
                                <p className="text-xs text-slate-500 font-mono italic">මෙම මාසයේ හොඳම දක්ෂතා පමණක් පෙන්වයි</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}