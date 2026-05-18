import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';
import { Trophy, X, Medal, Beaker, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- DATA: CHEM BATTLE 100 ---
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

// --- DATA: LAB GAME ---
const REACTIONS_DATABASE = [
    { a: 'Na', b: 'H2O', res: 'BOOM!', meme: '💥 බුම්මාතේ!', sound: 'අඩෝ සෝඩියම් වතුරට දැම්මේ කවුද?!', type: 'danger' },
    { a: 'HCl', b: 'NaOH', res: 'Neutral', meme: '🧂 ලුණුයි වතුරයි!', sound: 'ශාන්ති ශාන්ති... නියමයි පුතා.', type: 'safe' },
    { a: 'H2SO4', b: 'Sugar', res: 'Snake', meme: '🐍 කළු සර්පයා!', sound: 'සීනි ටික කර කරගත්තා නේද?', type: 'funny' },
    { a: 'K', b: 'H2O', res: 'Lilac Fire', meme: '🔥 පර්පල් ගින්දර!', sound: 'ලැබ් එක ඉවරයි! දුවපන්!', type: 'danger' },
    { a: 'NH3', b: 'HCl', res: 'Smoke', meme: '☁️ සුදු දුම් මකරා!', sound: 'ඇමෝනියම් ක්ලෝරයිඩ් දුම බලන්න.', type: 'funny' },
    { a: 'Pb(NO3)2', b: 'KI', res: 'Gold', meme: '✨ රත්තරන් වැස්සක්!', sound: 'ෂා... මේක නම් මැජික් එකක් වගේ.', type: 'safe' },
    { a: 'Cu', b: 'HNO3', res: 'Toxic', meme: '🧪 දුඹුරු වලාකුළ!', sound: 'ඕක ආග්රහණය කරන්න එපා ඕයි!', type: 'danger' },
    { a: 'Mg', b: 'O2', res: 'Flash', meme: '😎 ඇස් පේන්නෑ!', sound: 'මැග්නීසියම් පීත්ත පටිය දිහා බලන්න එපා කිව්වා නේද?', type: 'funny' },
    { a: 'Phenol', b: 'Base', res: 'Pink', meme: '🌸 තද රෝස පාටයි!', sound: 'ෆීනොප්තලීන් දැම්මම ලස්සනයි නේද?', type: 'safe' },
    { a: 'AgNO3', b: 'NH4OH', res: 'Mirror', meme: '🪞 මූණ පේනවා!', sound: 'ටොලන්ස් පරීක්ෂණය හරියටම කළා.', type: 'safe' },
    { a: 'Ethanol', b: 'H2SO4', res: 'Gas', meme: '🎈 එතීන් වායුව!', sound: 'එතීන් හැදෙන සුවඳ එනවා.', type: 'safe' },
    { a: 'Phone', b: 'H2SO4', res: 'Dead', meme: '📱 ෆෝන් එක ඉවරයි!', sound: 'කවුද ඕයි ෆෝන් එක ඇසිඩ් එකට දැම්මේ?', type: 'funny' },
];

// --- REUSABLE COMPONENTS ---

const LeaderboardModal = ({ show, onClose, data, loading, gameTitle }) => {
    const isOrganic = gameTitle.includes('ORGANIC');
    const headerBg = isOrganic ? 'bg-cyan-500' : 'bg-yellow-500';
    const borderCol = isOrganic ? 'border-cyan-500/50' : 'border-yellow-500/50';
    const textCol = isOrganic ? 'text-cyan-600 dark:text-cyan-400' : 'text-yellow-600 dark:text-yellow-400';
    const firstPlaceBg = isOrganic ? 'bg-cyan-500/10 border-cyan-500' : 'bg-yellow-500/10 border-yellow-500';
    const firstPlaceNumBg = isOrganic ? 'bg-cyan-500 text-black' : 'bg-yellow-500 text-black';

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`bg-white dark:bg-slate-900 border-2 ${borderCol} w-full max-w-lg rounded-3xl overflow-hidden relative z-10 shadow-2xl`}>
                        <div className={`${headerBg} p-6 flex justify-between items-center`}>
                            <h2 className="text-black font-black text-2xl flex items-center gap-2">
                                <Trophy size={28} />
                                {gameTitle} TOP 10
                            </h2>
                            <button onClick={onClose} className="bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all">
                                <X size={24} className="text-black" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-20 text-slate-400">පූරණය වෙමින්...</div>
                            ) : data.length > 0 ? (
                                <div className="space-y-3">
                                    {data.map((entry, index) => (
                                        <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border ${index === 0 ? firstPlaceBg : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${index === 0 ? firstPlaceNumBg : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{entry.student?.name || "Unknown Scientist"}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Batch: {entry.student?.batch || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black ${index === 0 ? textCol : 'text-slate-900 dark:text-white'}`}>{entry.score}{(gameTitle.includes('LAB') || gameTitle.includes('ORGANIC')) ? '' : '%'}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{(gameTitle.includes('LAB') || gameTitle.includes('ORGANIC')) ? 'Points' : 'Victory'}</p>
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
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono italic">මෙම මාසයේ හොඳම දක්ෂතා පමණක් පෙන්වයි</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --- GAME: CHEM BATTLE 100 ---

const ChemBattle100 = ({ onOpenLeaderboard }) => {
    const [gameState, setGameState] = useState('START');
    const [sessionQuestions, setSessionQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playerHP, setPlayerHP] = useState(100);
    const [enemyHP, setEnemyHP] = useState(100);
    const [feedback, setFeedback] = useState("");
    const [animTrigger, setAnimTrigger] = useState(null);

    const submitScore = async (finalScore) => {
        try {
            await API.post('/games/score', { game: 'chembattle', score: finalScore });
            toast.success("ඔබේ ලකුණු සටහන් කර ගත්තා!");
        } catch (error) { console.error("Error submitting score", error); }
    };

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
        <div className="w-full flex flex-col items-center">
            {/* HUD Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h1 className="text-xl font-black text-yellow-400">CHEM-BATTLE: 100 Q-BANK</h1>
                <div className="bg-blue-600/20 px-4 py-1 rounded-full border border-blue-500 text-sm">
                    ප්‍රශ්නය: <span className="text-white font-bold">{gameState === 'PLAYING' ? currentIndex + 1 : 0} / 10</span>
                </div>
            </div>

            {gameState === 'START' ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-10">
                    <div className="text-6xl mb-4">🧪</div>
                    <p className="mb-6 text-slate-400">ප්‍රශ්න 100න් අහඹු 10කට මුහුණ දෙන්න සූදානම්ද?</p>
                    <div className="flex flex-col gap-4 items-center">
                        <button onClick={startNewGame} className="bg-yellow-500 text-black px-12 py-5 rounded-2xl font-black text-3xl shadow-[0_8px_0_rgb(161,98,7)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(161,98,7)] transition-all">
                            Start Challenge
                        </button>
                        <button onClick={() => onOpenLeaderboard('chembattle')} className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold transition-all">
                            <Trophy size={20} />
                            Leaderboard එක බලන්න
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
                        <h2 className="text-2xl font-bold text-center mb-10 leading-snug">{sessionQuestions[currentIndex]?.q}</h2>
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
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-slate-900 p-12 rounded-[3rem] border-4 border-yellow-500 text-center shadow-2xl max-w-lg w-full">
                    <h2 className="text-5xl font-black mb-4 text-white uppercase tracking-tighter">{playerHP > 0 && enemyHP === 0 ? "You Won! 🏆" : "Defeated! 💀"}</h2>
                    <p className="text-slate-400 mb-8 font-medium">අවසන් ප්‍රතිඵලය: {100 - enemyHP}% ක ජයක්!</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={startNewGame} className="bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:bg-yellow-400 transition-all shadow-lg active:scale-90 w-full">Play Again</button>
                        <button onClick={() => onOpenLeaderboard('chembattle')} className="bg-slate-800 text-yellow-400 px-12 py-4 rounded-full font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700 w-full flex items-center justify-center gap-2">
                            <Trophy size={20} /> Leaderboard
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// --- GAME: LAB GAME ---

const LabGame = ({ onOpenLeaderboard }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [reaction, setReaction] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [shake, setShake] = useState(false);

    const generateOptions = useCallback(() => {
        const shuffled = [...REACTIONS_DATABASE].sort(() => 0.5 - Math.random());
        setCurrentOptions(shuffled.slice(0, 4));
    }, []);

    useEffect(() => { generateOptions(); }, [generateOptions]);

    useEffect(() => {
        if (timeLeft > 0 && !isGameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isGameOver) {
            setIsGameOver(true);
            if (score > 0) submitScore(score);
        }
    }, [timeLeft, isGameOver]);

    const submitScore = async (finalScore) => {
        try {
            await API.post('/games/score', { game: 'labgame', score: finalScore });
            toast.success("ලකුණු සටහන් කර ගත්තා!");
        } catch (error) { console.error("Error submitting score", error); }
    };

    const handleMix = (mix) => {
        setReaction(mix);
        if (mix.type === 'danger') {
            setScore(prev => prev - 20);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } else {
            setScore(prev => prev + 10);
        }
        setTimeout(() => {
            setReaction(null);
            generateOptions();
        }, 2000);
    };

    const resetGame = () => {
        setScore(0);
        setTimeLeft(45);
        setIsGameOver(false);
        setReaction(null);
        generateOptions();
    };

    return (
        <div className={`w-full max-w-xl flex flex-col items-center p-6 rounded-3xl transition-all duration-300 ${shake ? 'bg-red-900/40 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'bg-slate-900/60 border border-slate-800'}`}>
            <div className="w-full flex justify-between items-center mb-6 bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Score</p>
                    <p className={`text-2xl font-black ${score >= 0 ? 'text-green-400' : 'text-red-500'}`}>{score}</p>
                </div>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-yellow-500">🧪 ලැබ් අමාරුව</h1>
                    <p className="text-[10px] text-slate-500">A/L CHEMISTRY CHAOS</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Time</p>
                    <p className={`text-2xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</p>
                </div>
            </div>

            <div className={`w-full aspect-video rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center relative shadow-2xl ${reaction?.type === 'danger' ? 'border-red-500 bg-red-950/50' :
                reaction?.type === 'safe' ? 'border-green-500 bg-green-950/50' :
                    'border-slate-700 bg-slate-950'
                }`}>
                {reaction ? (
                    <div className="text-center animate-bounce">
                        <span className="text-7xl block mb-2">{reaction.meme.split(' ')[0]}</span>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{reaction.meme}</h2>
                    </div>
                ) : (
                    <div className="text-center opacity-40">
                        <div className="flex gap-4 justify-center mb-4">
                            <div className="w-8 h-12 border-2 border-white rounded-b-lg animate-pulse"></div>
                            <div className="w-8 h-12 border-2 border-white rounded-b-lg animate-pulse delay-75"></div>
                        </div>
                        <p className="text-sm font-medium">මික්ස් කරන්න එකක් තෝරන්න...</p>
                    </div>
                )}
            </div>

            <div className="w-full mt-4 bg-blue-600/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <p className="text-blue-400 text-sm font-bold italic">
                    Sir: <span className="text-blue-100">"{reaction ? reaction.sound : 'ලැබ් එක පුපුරවගන්නේ නැතුව වැඩ කරපන් ළමයෝ!'}"</span>
                </p>
            </div>

            <div className="w-full mt-6 grid grid-cols-2 gap-3">
                {currentOptions.map((opt, idx) => (
                    <button
                        key={idx}
                        disabled={reaction || isGameOver}
                        onClick={() => handleMix(opt)}
                        className="group relative bg-slate-800 hover:bg-yellow-500 transition-all p-4 rounded-xl border-b-4 border-black active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="block text-xs text-slate-400 group-hover:text-black font-bold uppercase mb-1">Reaction {idx + 1}</span>
                        <span className="block text-lg font-black group-hover:text-black whitespace-nowrap">{opt.a} + {opt.b}</span>
                    </button>
                ))}
            </div>

            <button onClick={() => onOpenLeaderboard('labgame')} className="mt-6 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold transition-all text-sm">
                <Trophy size={16} /> Leaderboard
            </button>

            {isGameOver && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center">
                    <h2 className="text-6xl font-black text-red-600 mb-2 italic">Game Over!</h2>
                    <p className="text-2xl mb-6 text-white">ඔයාගේ ලකුණු ප්‍රමාණය: <span className="text-yellow-400 font-bold">{score}</span></p>
                    <div className="flex flex-col gap-4">
                        <button onClick={resetGame} className="bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:bg-yellow-500 transition-colors shadow-lg">Retry</button>
                        <button onClick={() => onOpenLeaderboard('labgame')} className="text-yellow-500 font-bold underline">Leaderboard බලන්න</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- EXPANDED ORGANIC CUSTOMERS DATABASE (22 UNIQUE REAGENTS) ---
const CUSTOMERS_DATABASE = [
    {
        id: 1,
        reagent: "PCl3 / PCl5 / SOCl2",
        wants: "-OH (Alcohols)",
        successMeme: "🧪 Alkyl Halide හන්දි පත් වුණා!",
        sirVoice: "නියමයි පුතා, ඇල්කොහොල් වල -OH අයින් කරලා Cl දාන්න ඕකුන් මරු.",
        correctGroup: "Alcohol",
        options: ["Alcohol", "Alkane", "Carboxylic Acid", "Ketone"]
    },
    {
        id: 2,
        reagent: "2,4-DNPH (Brady's Reagent)",
        wants: ">C=O (Carbonyl Compounds)",
        successMeme: "🟠 තැඹිලි/කහ පාට අවක්ෂේපයක් ආවා!",
        sirVoice: "කාබොනයිල් සංයෝග අඳුනගන්න බ්රැඩීගේ ප්රතිකාරකය තරම් එකෙක් නෑ.",
        correctGroup: "Carbonyl",
        options: ["Alcohol", "Carbonyl", "Ester", "Alkyne"]
    },
    {
        id: 3,
        reagent: "Tollens Reagent (AgNO3 + NH4OH)",
        wants: "-CHO (Aldehydes only)",
        successMeme: "🪞 රිදී කැඩපත (Silver Mirror) හැදුණා!",
        sirVoice: "ඇල්ඩිහයිඩ් විතරයි ඕකට රිදී කැඩපත දෙන්නේ, කීටෝන දෙන්නෑ හරිද?",
        correctGroup: "Aldehyde",
        options: ["Ketone", "Aldehyde", "Amine", "Alkene"]
    },
    {
        id: 4,
        reagent: "Na2CO3 / NaHCO3 Gas Test",
        wants: "-COOH (Carboxylic Acids)",
        successMeme: "🫧 CO2 බුබුළු දැම්මා!",
        sirVoice: "කාබොක්සිලික් ඇසිඩ් එකක් නිසා තමයි ඔය කාබනේට් එක්ක CO2 පිටවුණේ.",
        correctGroup: "Acid",
        options: ["Phenol", "Alcohol", "Acid", "Ester"]
    },
    {
        id: 5,
        reagent: "FeCl3 Solution",
        wants: "Phenol (ෆීනෝල්)",
        successMeme: "💜 තද දම් පාට සංකීර්ණයක්!",
        sirVoice: "ෆීනෝල් වලට FeCl3 දැම්මම දම් පාට වෙනවා කියලා කීප පාරක් කිව්වද?",
        correctGroup: "Phenol",
        options: ["Alcohol", "Phenol", "Aniline", "Alkane"]
    },
    {
        id: 6,
        reagent: "LiAlH4 (Strong Reduction)",
        wants: "Reduction Targets (-COOH / -CHO / 🌲)",
        successMeme: "🔋 ප්රාථමික ඇල්කොහොල් බවට පත්වුණා!",
        sirVoice: "LiAlH4 කියන්නේ දරුණු ඔක්සිහරණයක්, ඇසිඩ් එක කෙලින්ම ඇල්කොහොල් කරනවා.",
        correctGroup: "Acid",
        options: ["Acid", "Alkane", "Alkyl Halide", "Ether"]
    },
    {
        id: 7,
        reagent: "Lucas Reagent (ZnCl2 / Conc. HCl)",
        wants: "3° Alcohols (තෘතීයික ඇල්කොහොල්)",
        successMeme: "⏱️ තත්පරයෙන් බොඳවුණා! (Instant Turbidity)",
        sirVoice: "තෘතීයික ඇල්කොහොල් ලූකාස් එක්ක ක්ෂණිකව බොඳවීමක් දෙනවා ළමයෝ.",
        correctGroup: "Alcohol",
        options: ["Alcohol", "Ether", "Alkane", "Aldehyde"]
    },
    {
        id: 8,
        reagent: "Ammoniacal Cu2Cl2",
        wants: "Terminal Alkynes (අග්රස්ථ ඇල්කයින)",
        successMeme: "🔴 රතු පාට අවක්ෂේපයක්!",
        sirVoice: "ත්රිත්ව බන්ධනය කෙළවරේ තියෙන ඇල්කයින විතරයි මේකට රතු පාට දෙන්නේ.",
        correctGroup: "Alkyne",
        options: ["Alkene", "Alkyne", "Alkane", "Benzene"]
    },
    {
        id: 9,
        reagent: "Na Metal (සෝඩියම් ලෝහය)",
        wants: "Active Hydrogen (-OH / -COOH)",
        successMeme: "🎈 හයිඩ්රජන් (H2) වායුව පිටවුණා!",
        sirVoice: "සක්රීය හයිඩ්රජන් තියෙන ඕනම එකෙක් සෝඩියම් එක්ක හයිඩ්රජන් දෙනවා.",
        correctGroup: "Alcohol",
        options: ["Alcohol", "Ether", "Ketone", "Alkane"]
    },
    {
        id: 10,
        reagent: "Dilute NaOH / Heat (Aldol)",
        wants: "Alpha-H තියෙන Carbonyls",
        successMeme: "🧬 ඇල්ඩෝල් සංcondensation එකක්!",
        sirVoice: "ඇල්ෆා හයිඩ්රජන් තියෙන ඇල්ඩිහයිඩ්/කීටෝන තමයි ඕකට අහුවෙන්නේ.",
        correctGroup: "Carbonyl",
        options: ["Carbonyl", "Acid", "Ester", "Alcohol"]
    },
    {
        id: 11,
        reagent: "Concentrated HNO3 + H2SO4",
        wants: "Benzene Ring (නයිට්රෝකරණය)",
        successMeme: "🟡 කහ පාට නයිට්රොබෙන්සීන් තෙල් තට්ටුවක්!",
        sirVoice: "බෙන්සීන් වල ඉලෙක්ට්රොෆිලික ආදේශනය... නයිට්රෝ කාණ්ඩයක් ඇතුල් කලා.",
        correctGroup: "Benzene",
        options: ["Benzene", "Alkane", "Alkene", "Alcohol"]
    },
    {
        id: 12,
        reagent: "Alkaline KMnO4 / Heat",
        wants: "Alkyl Benzenes (Toluene etc.)",
        successMeme: "🤍 බෙන්සොයික් ඇසිඩ් සුදු ස්ඵටික!",
        sirVoice: "බෙන්සීන් වළල්ලට උඩින් මොන කාබන් දාමය තිබ්බත් KMnO4 දාලා තැම්බුවම ඇසිඩ් එක වෙනවා.",
        correctGroup: "Benzene",
        options: ["Benzene", "Alkane", "Amine", "Ester"]
    },
    {
        id: 13,
        reagent: "Br2 Water (බ්රෝමින් ජලය)",
        wants: "Unsaturation (ඇල්කීන / ඇල්කයින)",
        successMeme: "🎨 රතු-දුඹුරු පාට නැතිවුණා! (Decolorization)",
        sirVoice: "අසංතෘප්ත බන්ධන තියෙන තැන්වලට බ්රෝමින් එකතුවෙලා පාට නැති කරනවා.",
        correctGroup: "Alkene",
        options: ["Alkene", "Alkane", "Ether", "Ketone"]
    },
    {
        id: 14,
        reagent: "Neutral FeCl3 Test 2",
        wants: "Enols (ඊනෝල් කාණ්ඩ)",
        successMeme: "🟢 කොළ හෝ දම් පාට විචිත්ර සංකීර්ණයක්!",
        sirVoice: "ෆීනෝල් වගේම ඊනෝල් ව්යුහ තියෙන ඒවත් FeCl3 එක්ක පාට දෙනවා.",
        correctGroup: "Enol",
        options: ["Enol", "Alkane", "Ester", "Amine"]
    },
    {
        id: 15,
        reagent: "Br2 / FeBr3 catalyst",
        wants: "Benzene (Electrophilic Substitution)",
        successMeme: "🧪 බ්රෝමොබෙන්සීන් හැදුණා!",
        sirVoice: "FeBr3 ලුවිස් ඇසිඩ් එකක් නැතුව බෙන්සීන් වලට බ්රෝමින් ආදේශ කරන්න බෑ.",
        correctGroup: "Benzene",
        options: ["Benzene", "Alkane", "Alcohol", "Aldehyde"]
    },
    {
        id: 16,
        reagent: "HNO2 / HCl (0 - 5 °C)",
        wants: "Aniline / Primary Aromatic Amines",
        successMeme: "🥶 ඩයසෝනියම් ලුණු (Diazonium Salt) ස්ථායී වුණා!",
        sirVoice: "අයිස් උෂ්ණත්වයේදී විතරයි ඕක හැදෙන්නේ, රත් කළොත් ඩයසෝනියම් එක කැඩෙනවා.",
        correctGroup: "Aniline",
        options: ["Aniline", "Alkane", "Ketone", "Ether"]
    },
    {
        id: 17,
        reagent: "I2 / NaOH (Iodoform Test)",
        wants: "CH3CO- or CH3CH(OH)- Groups",
        successMeme: "🟡 කහ පාට අයිඩොෆෝම් ස්ඵටික!",
        sirVoice: "මෙතිල් කීටෝන හෝ මෙතිල් ඇල්කොහොල් තියෙන ඒවා විතරයි අයිඩොෆෝම් දෙන්නේ.",
        correctGroup: "Carbonyl",
        options: ["Carbonyl", "Acid", "Ether", "Alkyne"]
    },
    {
        id: 18,
        reagent: "H2 / Pd / BaSO4 (Rosenmund)",
        wants: "Acid Chlorides (-COCl)",
        successMeme: "🍭 පාලනය කළ ඔක්සිහරණයෙන් Aldehyde හැදුණා!",
        sirVoice: "BaSO4 දාන්නේ උත්ප්රේරක විෂක් විදිහට, නැත්නම් ඕක ඇල්කොහොල් වෙනකන්ම බහිනවා.",
        correctGroup: "Acid Chloride",
        options: ["Acid Chloride", "Alkane", "Amine", "Phenol"]
    },
    {
        id: 19,
        reagent: "Dry Ether / Mg Metal",
        wants: "Alkyl Halides (R-X)",
        successMeme: "🧙‍♂️ ග්රීනාඩ් ප්රතිකාරකය (Grignard) මැජික් එක වගේ හැදුණා!",
        sirVoice: "ඕගැනික් වල ඕනම කාබන් දාමයක් දික් කරන්න ඕන වෙන ප්රධානම භාණ්ඩය තමයි ඔය.",
        correctGroup: "Alkyl Halide",
        options: ["Alkyl Halide", "Alcohol", "Acid", "Ester"]
    },
    {
        id: 20,
        reagent: "Anhydrous AlCl3 / CH3Cl",
        wants: "Benzene (Friedel-Crafts Alkylation)",
        successMeme: "🏎️ ටොලුයින් (Toluene) නිපදවුණා!",
        sirVoice: "බෙන්සීන් වළල්ලට මෙතිල් කාණ්ඩයක් බද්ධ කරන්න AlCl3 උදව් වෙනවා.",
        correctGroup: "Benzene",
        options: ["Benzene", "Alkane", "Alcohol", "Amine"]
    },
    {
        id: 21,
        reagent: "Concentrated H2SO4 / 170°C",
        wants: "Alcohols (Dehydration)",
        successMeme: "⛽ ජල අණුවක් ඉවත් වී ඇල්කීනයක් ලැබුණා!",
        sirVoice: "වැඩි උෂ්ණත්වයේදී විජලනය වෙලා ද්විත්ව බන්ධන හැදෙනවා කියලා මතක තියාගන්න.",
        correctGroup: "Alcohol",
        options: ["Alcohol", "Alkane", "Ester", "Aldehyde"]
    },
    {
        id: 22,
        reagent: "NaOH / CaO (Soda Lime) + Heat",
        wants: "Sodium Salts of Carboxylic Acids",
        successMeme: "✂️ කාබන් අණුවක් අඩු වී Alkane ලැබුණා!",
        sirVoice: "ඩෙකාබොක්සිලේට් වෙනවා කියන්නේ කාබන් දාමය කොට කරන්න තියෙන හොඳම ක්රමය.",
        correctGroup: "Acid Salt",
        options: ["Acid Salt", "Alcohol", "Alkyne", "Ether"]
    }
];

const OrganicCafe = ({ onOpenLeaderboard }) => {
    const [currentRound, setCurrentRound] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [sirVoice, setSirVoice] = useState("ඕගැනික් පරිවර්තන ටික ගොඩදාගන්න කඩේට එන පාරිභෝගිකයන්ට හරියට සර්ව් කරන්න.");
    const [timeLeft, setTimeLeft] = useState(45);
    const [isGameOver, setIsGameOver] = useState(false);

    const submitScore = async (finalScore) => {
        try {
            await API.post('/games/score', { game: 'organiccafe', score: finalScore });
            toast.success("ඔබේ ලකුණු සටහන් කර ගත්තා!");
        } catch (error) { console.error("Error submitting score", error); }
    };

    const loadNewCustomer = useCallback(() => {
        const randomCustomer = CUSTOMERS_DATABASE[Math.floor(Math.random() * CUSTOMERS_DATABASE.length)];
        const shuffledOptions = [...randomCustomer.options].sort(() => 0.5 - Math.random());

        setCurrentRound({
            ...randomCustomer,
            options: shuffledOptions
        });
        setFeedback(null);
    }, []);

    useEffect(() => {
        loadNewCustomer();
    }, [loadNewCustomer]);

    useEffect(() => {
        if (timeLeft > 0 && !isGameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isGameOver) {
            setIsGameOver(true);
            if (score > 0) submitScore(score);
        }
    }, [timeLeft, isGameOver, score]);

    const handleServe = (selectedGroup) => {
        if (feedback || isGameOver) return;

        const isCorrect = selectedGroup === currentRound.correctGroup;
        let pointChange = isCorrect ? 15 : -10;

        const newAnswered = totalAnswered + 1;
        setTotalAnswered(newAnswered);

        if (isCorrect) {
            const newScore = score + pointChange;
            setScore(newScore);
            setStreak(prev => prev + 1);
            setFeedback({ type: 'success', text: currentRound.successMeme });
            setSirVoice(currentRound.sirVoice);
        } else {
            const newScore = score + pointChange;
            setScore(newScore);
            setStreak(0);
            setFeedback({ type: 'error', text: `❌ වැරදියි! ඒ ප්රතිකාරකය ක්රියා කරන්නේ ${currentRound.wants} එක්ක.` });
            setSirVoice("නොදන්න ඕගැනික්! මොනවාද මේ වත්කරන කුප්ප විකාර?");
        }

        setTimeout(() => {
            loadNewCustomer();
        }, 2000);
    };

    const resetGame = () => {
        setScore(0);
        setStreak(0);
        setTotalAnswered(0);
        setTimeLeft(45);
        setIsGameOver(false);
        setFeedback(null);
        setSirVoice("ඕගැනික් පරිවර්තන ටික ගොඩදාගන්න කඩේට එන පාරිභෝගිකයන්ට හරියට සර්ව් කරන්න.");
        loadNewCustomer();
    };

    if (!currentRound) return <div className="text-slate-800 dark:text-white text-center mt-20">Loading Organic Lab...</div>;

    return (
        <div className="w-full max-w-xl flex flex-col items-center p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 relative shadow-xl dark:shadow-none transition-all">

            {/* Top HUD Display */}
            <div className="w-full flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 transition-all">
                <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest block">SCORE</span>
                    <span className={`text-2xl font-black ${score >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-500'}`}>{score}</span>
                </div>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-cyan-600 dark:text-cyan-400">ඕගනික් කඩේ</h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">🔥 Streak: {streak}</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest block">TIME</span>
                    <span className={`text-2xl font-black ${timeLeft < 10 ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Strict Organic Sir Commentary */}
            <div className="w-full mb-4 bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-md">
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold italic">
                    Chemistry Master Says: <span className="text-emerald-950 dark:text-emerald-100 font-medium">"{sirVoice}"</span>
                </p>
            </div>

            {/* Active Reaction Vessel Card */}
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all">

                {/* Customer Reagent Showcase */}
                <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900 text-center border-b border-slate-200 dark:border-slate-800 transition-all">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-50 dark:bg-cyan-950 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800/50 transition-all">
                        ප්රතිකාරකය (Incoming Reagent)
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-850 dark:text-white mt-4 font-mono leading-tight">
                        {currentRound.reagent}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">මෙම ප්රතිකාරකයට ගැලපෙන කාබනික ක්රියාකාරී කාණ්ඩය කුමක්ද?</p>
                </div>

                {/* Reaction Middleware Output Display */}
                <div className="h-24 px-6 flex items-center justify-center bg-slate-50 dark:bg-slate-950/40 relative border-b border-slate-100 dark:border-none transition-all">
                    {feedback ? (
                        <div className={`w-full text-center p-3 rounded-xl border transition-all ${feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                            }`}>
                            <p className="text-sm font-bold tracking-wide">{feedback.text}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-600 font-mono italic">පහත කාණ්ඩවලින් එකක් තෝරා ප්රතික්රියා කරවන්න...</p>
                    )}
                </div>

                {/* Organic Ingredient Dispenser (Buttons) */}
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800 transition-all">
                    {currentRound.options.map((option, idx) => (
                        <button
                            key={idx}
                            disabled={feedback !== null || isGameOver}
                            onClick={() => handleServe(option)}
                            className="bg-white dark:bg-slate-800 hover:bg-cyan-500 hover:text-black dark:hover:bg-cyan-500 dark:hover:text-black border border-slate-300 dark:border-none border-b-4 dark:border-b-4 border-slate-400 dark:border-slate-950 text-slate-800 dark:text-white disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-800 dark:disabled:hover:text-white active:border-b-0 active:translate-y-1 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all uppercase shadow-sm dark:shadow-none"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Button */}
            <button onClick={() => onOpenLeaderboard('organiccafe')} className="mt-6 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold transition-all text-sm">
                <Trophy size={16} /> Leaderboard බලන්න
            </button>

            {/* Game Over Screen Overlay */}
            {isGameOver && (
                <div className="fixed inset-0 bg-slate-100/95 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center">
                    <h2 className="text-5xl sm:text-6xl font-black text-rose-600 dark:text-red-600 mb-2 italic">Game Over!</h2>
                    <p className="text-xl sm:text-2xl mb-6 text-slate-800 dark:text-white">ඔයාගේ ලකුණු ප්‍රමාණය: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{score}</span></p>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <button onClick={resetGame} className="bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-4 rounded-full font-black text-lg sm:text-xl hover:bg-cyan-500 hover:text-black dark:hover:bg-cyan-500 transition-colors shadow-lg">Retry</button>
                        <button onClick={() => onOpenLeaderboard('organiccafe')} className="text-cyan-600 dark:text-cyan-400 font-bold underline">Leaderboard බලන්න</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// MAIN GAMES PAGE 

export default function Games() {
    const [activeTab, setActiveTab] = useState('BATTLE'); // BATTLE | LAB | ORGANIC
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [leaderboardGame, setLeaderboardGame] = useState('');

    const fetchLeaderboard = async (game) => {
        setLeaderboardGame(game === 'chembattle' ? 'CHEM BATTLE' : game === 'organiccafe' ? 'ORGANIC CAFE' : 'LAB CHAOS');
        setLoadingLeaderboard(true);
        setShowLeaderboard(true);
        try {
            const res = await API.get(`/games/leaderboard/${game}`);
            setLeaderboardData(res.data);
        } catch (error) {
            console.error("Error fetching leaderboard", error);
            toast.error("Leaderboard ලබා ගැනීමට නොහැකි වුණා.");
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black text-slate-900 dark:text-white selection:bg-yellow-500 selection:text-black transition-colors duration-300">
            <StudentNavbar />

            <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col items-center">

                {/* Game Switcher Tabs */}
                <div className="flex flex-wrap justify-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl mb-12 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
                    <button
                        onClick={() => setActiveTab('BATTLE')}
                        className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'BATTLE' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'}`}
                    >
                        <Zap size={18} />
                        Chem Battle 100
                    </button>
                    <button
                        onClick={() => setActiveTab('LAB')}
                        className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'LAB' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'}`}
                    >
                        <Beaker size={18} />
                        Lab Chaos
                    </button>
                    <button
                        onClick={() => setActiveTab('ORGANIC')}
                        className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'ORGANIC' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'}`}
                    >
                        <Medal size={18} />
                        Organic Cafe
                    </button>
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex justify-center"
                >
                    {activeTab === 'BATTLE' ? (
                        <ChemBattle100 onOpenLeaderboard={fetchLeaderboard} />
                    ) : activeTab === 'LAB' ? (
                        <LabGame onOpenLeaderboard={fetchLeaderboard} />
                    ) : (
                        <OrganicCafe onOpenLeaderboard={fetchLeaderboard} />
                    )}
                </motion.div>

                <div className="mt-16 text-slate-700 dark:text-slate-500 text-[10px] font-mono uppercase tracking-widest text-center">
                    ChemBridge Arcade // Powered by Meme Engine v1.0
                </div>
            </div>

            <LeaderboardModal
                show={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                data={leaderboardData}
                loading={loadingLeaderboard}
                gameTitle={leaderboardGame}
            />

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .shake-anim { animation: shake 0.2s ease-in-out infinite; }
            `}</style>
        </div>
    );
}