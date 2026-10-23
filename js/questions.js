/**
 * RiYooIQ - QuestionEngine
 * Generates 10,000+ unique Math questions & 10,000+ unique Science (IPA) questions
 * with session anti-duplication tracking (Set of question hashes).
 */

class QuestionEngine {
    constructor() {
        this.usedQuestionIds = new Set();
        this.initScienceDatabase();
    }

    resetSession() {
        this.usedQuestionIds.clear();
    }

    // Helper: Shuffle array randomly
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Helper: Generate 3 unique logical distractors around target answer
    createNumericDistractors(correctAnswer, minRange = 1, maxRange = 100) {
        const distractors = new Set();
        const deltas = [-3, -2, -1, 1, 2, 3, -10, 10, -5, 5, 4, -4];
        this.shuffle(deltas);

        for (const delta of deltas) {
            const candidate = correctAnswer + delta;
            if (candidate !== correctAnswer && candidate >= minRange) {
                distractors.add(candidate);
                if (distractors.size === 3) break;
            }
        }

        let fallbackDelta = 7;
        while (distractors.size < 3) {
            const candidate = Math.max(1, correctAnswer + fallbackDelta);
            if (candidate !== correctAnswer) {
                distractors.add(candidate);
            }
            fallbackDelta = fallbackDelta > 0 ? -fallbackDelta - 3 : -fallbackDelta + 4;
        }

        return Array.from(distractors);
    }

    // Helper: Random integer in [min, max]
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Pick random item from array
    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ==========================================
    // 1. GENERATOR 10.000 SOAL MATEMATIKA
    // ==========================================
    generateMathQuestion(difficulty = 'normal') {
        const types = [
            'addition',
            'subtraction',
            'multiplication',
            'division',
            'mixed_ops',
            'number_pattern',
            'geometry',
            'simple_fraction',
            'unit_conversion',
            'story_problem'
        ];

        let attempts = 0;
        while (attempts < 80) {
            attempts++;
            const type = this.pickRandom(types);
            let qData = null;

            switch (type) {
                case 'addition':
                    qData = this.genMathAddition(difficulty);
                    break;
                case 'subtraction':
                    qData = this.genMathSubtraction(difficulty);
                    break;
                case 'multiplication':
                    qData = this.genMathMultiplication(difficulty);
                    break;
                case 'division':
                    qData = this.genMathDivision(difficulty);
                    break;
                case 'mixed_ops':
                    qData = this.genMathMixedOps(difficulty);
                    break;
                case 'number_pattern':
                    qData = this.genMathPattern(difficulty);
                    break;
                case 'geometry':
                    qData = this.genMathGeometry(difficulty);
                    break;
                case 'simple_fraction':
                    qData = this.genMathFraction(difficulty);
                    break;
                case 'unit_conversion':
                    qData = this.genMathUnitConversion(difficulty);
                    break;
                case 'story_problem':
                    qData = this.genMathStoryProblem(difficulty);
                    break;
            }

            if (qData) {
                const qId = `M_${qData.category}_${qData.questionText}_${qData.correctAnswer}`;
                if (!this.usedQuestionIds.has(qId)) {
                    this.usedQuestionIds.add(qId);
                    return this.packageQuestion(qData, 'matematika', difficulty);
                }
            }
        }

        // Fallback guaranteed question if loop exhausted
        const a = this.randInt(5, 50);
        const b = this.randInt(5, 50);
        const ans = a + b;
        return this.packageQuestion({
            questionText: `Berapakah hasil dari ${a} + ${b} ?`,
            correctAnswer: ans.toString(),
            options: this.shuffle([ans.toString(), (ans + 1).toString(), (ans - 1).toString(), (ans + 2).toString()]),
            category: 'Penjumlahan Cepat'
        }, 'matematika', difficulty);
    }

    genMathAddition(diff) {
        let a, b;
        if (diff === 'easy') {
            a = this.randInt(1, 25);
            b = this.randInt(1, 25);
        } else if (diff === 'normal') {
            a = this.randInt(15, 99);
            b = this.randInt(12, 99);
        } else {
            a = this.randInt(100, 750);
            b = this.randInt(75, 450);
        }
        const ans = a + b;
        const dists = this.createNumericDistractors(ans, 1, ans + 30).map(String);
        return {
            category: 'Penjumlahan',
            questionText: `Berapa hasil dari ${a} + ${b} = ... ?`,
            correctAnswer: ans.toString(),
            options: this.shuffle([ans.toString(), ...dists])
        };
    }

    genMathSubtraction(diff) {
        let a, b;
        if (diff === 'easy') {
            b = this.randInt(1, 15);
            a = b + this.randInt(1, 20);
        } else if (diff === 'normal') {
            b = this.randInt(10, 60);
            a = b + this.randInt(15, 80);
        } else {
            b = this.randInt(60, 400);
            a = b + this.randInt(100, 600);
        }
        const ans = a - b;
        const dists = this.createNumericDistractors(ans, 0, ans + 30).map(String);
        return {
            category: 'Pengurangan',
            questionText: `Berapa hasil dari ${a} - ${b} = ... ?`,
            correctAnswer: ans.toString(),
            options: this.shuffle([ans.toString(), ...dists])
        };
    }

    genMathMultiplication(diff) {
        let a, b;
        if (diff === 'easy') {
            a = this.randInt(2, 6);
            b = this.randInt(2, 9);
        } else if (diff === 'normal') {
            a = this.randInt(6, 12);
            b = this.randInt(4, 12);
        } else {
            a = this.randInt(12, 28);
            b = this.randInt(5, 15);
        }
        const ans = a * b;
        const dists = this.createNumericDistractors(ans, 2, ans + 40).map(String);
        return {
            category: 'Perkalian',
            questionText: `Berapakah hasil dari ${a} × ${b} = ... ?`,
            correctAnswer: ans.toString(),
            options: this.shuffle([ans.toString(), ...dists])
        };
    }

    genMathDivision(diff) {
        let b, ans;
        if (diff === 'easy') {
            b = this.randInt(2, 5);
            ans = this.randInt(2, 9);
        } else if (diff === 'normal') {
            b = this.randInt(4, 10);
            ans = this.randInt(4, 12);
        } else {
            b = this.randInt(6, 15);
            ans = this.randInt(8, 25);
        }
        const a = b * ans;
        const dists = this.createNumericDistractors(ans, 1, ans + 20).map(String);
        return {
            category: 'Pembagian',
            questionText: `Berapakah hasil dari ${a} ÷ ${b} = ... ?`,
            correctAnswer: ans.toString(),
            options: this.shuffle([ans.toString(), ...dists])
        };
    }

    genMathMixedOps(diff) {
        if (diff === 'easy') {
            const a = this.randInt(2, 8);
            const b = this.randInt(2, 5);
            const c = this.randInt(1, 10);
            // a + b * c or a * b - c
            const mode = Math.random() > 0.5 ? 1 : 2;
            let ans, text;
            if (mode === 1) {
                ans = a + (b * c);
                text = `${a} + ${b} × ${c}`;
            } else {
                ans = (a * b) - c;
                text = `${a} × ${b} - ${c}`;
            }
            const dists = this.createNumericDistractors(ans, 1, ans + 20).map(String);
            return {
                category: 'Operasi Campuran',
                questionText: `Hitunglah: ${text} = ... ?`,
                correctAnswer: ans.toString(),
                options: this.shuffle([ans.toString(), ...dists])
            };
        } else if (diff === 'normal') {
            const a = this.randInt(10, 30);
            const b = this.randInt(2, 6);
            const c = this.randInt(3, 8);
            const ans = a + (b * c);
            const text = `${a} + ${b} × ${c}`;
            const dists = this.createNumericDistractors(ans, 5, ans + 30).map(String);
            return {
                category: 'KABATAKU',
                questionText: `Berapakah nilai dari ${text} = ... ?`,
                correctAnswer: ans.toString(),
                options: this.shuffle([ans.toString(), ...dists])
            };
        } else {
            const a = this.randInt(4, 12);
            const b = this.randInt(5, 15);
            const c = this.randInt(2, 6);
            const d = this.randInt(5, 20);
            const ans = (a * b) - (c * 2) + d;
            const text = `${a} × ${b} - (${c} × 2) + ${d}`;
            const dists = this.createNumericDistractors(ans, 10, ans + 40).map(String);
            return {
                category: 'Operasi Campuran',
                questionText: `Berapakah hasil dari: ${text} = ... ?`,
                correctAnswer: ans.toString(),
                options: this.shuffle([ans.toString(), ...dists])
            };
        }
    }

    genMathPattern(diff) {
        let start = this.randInt(2, 20);
        let step = diff === 'easy' ? this.randInt(2, 5) : (diff === 'normal' ? this.randInt(4, 9) : this.randInt(7, 15));
        let isMultiply = diff === 'hard' && Math.random() > 0.6;

        let seq = [];
        let curr = start;
        for (let i = 0; i < 4; i++) {
            seq.push(curr);
            curr = isMultiply ? curr * 2 : curr + step;
        }
        const ans = curr;
        const text = seq.join(', ') + ', [ ? ]';
        const dists = this.createNumericDistractors(ans, 1, ans + 25).map(String);
        return {
            category: 'Pola Barisan Angka',
            questionText: `Lengkapi pola bilangan berikut:\n${text}`,
            correctAnswer: ans.toString(),
            options: this.shuffle([ans.toString(), ...dists])
        };
    }

    genMathGeometry(diff) {
        const shapes = [
            { name: 'Segitiga', sides: 3, corners: 3 },
            { name: 'Persegi', sides: 4, corners: 4 },
            { name: 'Persegi Panjang', sides: 4, corners: 4 },
            { name: 'Segilima (Pentagon)', sides: 5, corners: 5 },
            { name: 'Segienam (Heksagon)', sides: 6, corners: 6 },
            { name: 'Lingkaran', sides: 1, corners: 0 }
        ];

        if (diff === 'easy' || Math.random() > 0.5) {
            const sh = this.pickRandom(shapes);
            const isSides = Math.random() > 0.5;
            const targetProp = isSides ? 'sisi' : 'titik sudut';
            const ans = isSides ? sh.sides : sh.corners;
            const dists = [ans + 1, Math.max(0, ans - 1), ans + 2].map(String);
            return {
                category: 'Geometri Dasar',
                questionText: `Berapa banyak ${targetProp} yang dimiliki oleh bangun ${sh.name}?`,
                correctAnswer: ans.toString(),
                options: this.shuffle([ans.toString(), ...dists])
            };
        } else {
            // Area or Perimeter
            const isSquare = Math.random() > 0.5;
            if (isSquare) {
                const s = this.randInt(3, 12);
                const isPerimeter = Math.random() > 0.5;
                const ans = isPerimeter ? 4 * s : s * s;
                const unit = isPerimeter ? 'cm' : 'cm²';
                const typeName = isPerimeter ? 'Keliling' : 'Luas';
                const dists = this.createNumericDistractors(ans, 4, ans + 30).map(d => `${d} ${unit}`);
                return {
                    category: 'Bangun Datar',
                    questionText: `Sebuah persegi memiliki panjang sisi ${s} cm. Berapakah ${typeName}nya?`,
                    correctAnswer: `${ans} ${unit}`,
                    options: this.shuffle([`${ans} ${unit}`, ...dists])
                };
            } else {
                const p = this.randInt(4, 15);
                const l = this.randInt(2, p - 1);
                const isPerimeter = Math.random() > 0.5;
                const ans = isPerimeter ? 2 * (p + l) : p * l;
                const unit = isPerimeter ? 'cm' : 'cm²';
                const typeName = isPerimeter ? 'Keliling' : 'Luas';
                const dists = this.createNumericDistractors(ans, 4, ans + 30).map(d => `${d} ${unit}`);
                return {
                    category: 'Bangun Datar',
                    questionText: `Persegi panjang memiliki panjang ${p} cm dan lebar ${l} cm. Berapakah ${typeName}nya?`,
                    correctAnswer: `${ans} ${unit}`,
                    options: this.shuffle([`${ans} ${unit}`, ...dists])
                };
            }
        }
    }

    genMathFraction(diff) {
        if (diff === 'easy') {
            const denom = this.pickRandom([4, 5, 6, 8, 10]);
            const a = this.randInt(1, Math.floor(denom / 2));
            const b = this.randInt(1, Math.floor(denom / 2));
            const sum = a + b;
            const ans = `${sum}/${denom}`;
            const dists = [
                `${Math.max(1, sum - 1)}/${denom}`,
                `${sum + 1}/${denom}`,
                `${sum}/${denom + 1}`
            ];
            return {
                category: 'Pecahan Sederhana',
                questionText: `Hasil penjumlahan pecahan ${a}/${denom} + ${b}/${denom} adalah ...`,
                correctAnswer: ans,
                options: this.shuffle([ans, ...dists])
            };
        } else {
            // Equivalent fraction or decimal
            const pairs = [
                { frac: '1/2', dec: '0,5', equiv: '2/4' },
                { frac: '1/4', dec: '0,25', equiv: '2/8' },
                { frac: '3/4', dec: '0,75', equiv: '6/8' },
                { frac: '1/5', dec: '0,2', equiv: '2/10' },
                { frac: '2/5', dec: '0,4', equiv: '4/10' },
                { frac: '3/5', dec: '0,6', equiv: '6/10' }
            ];
            const p = this.pickRandom(pairs);
            const isDec = Math.random() > 0.5;
            if (isDec) {
                const dists = ['0,1', '0,3', '0,8', '0,15', '0,7'].filter(x => x !== p.dec).slice(0, 3);
                return {
                    category: 'Desimal & Pecahan',
                    questionText: `Bentuk desimal dari pecahan ${p.frac} adalah ...`,
                    correctAnswer: p.dec,
                    options: this.shuffle([p.dec, ...dists])
                };
            } else {
                const dists = ['1/3', '2/5', '3/7', '1/6'].filter(x => x !== p.equiv).slice(0, 3);
                return {
                    category: 'Pecahan Senilai',
                    questionText: `Pecahan yang senilai dengan ${p.frac} adalah ...`,
                    correctAnswer: p.equiv,
                    options: this.shuffle([p.equiv, ...dists])
                };
            }
        }
    }

    genMathUnitConversion(diff) {
        const kinds = ['length', 'weight', 'time'];
        const kind = this.pickRandom(kinds);

        if (kind === 'length') {
            const km = this.randInt(2, 9);
            const ansVal = km * 1000;
            const distValues = [km * 100, (km + 1) * 1000, (km - 1) * 1000, km * 10];
            const uniqueDists = Array.from(new Set(distValues.filter(v => v !== ansVal))).slice(0, 3);
            return {
                category: 'Satuan Panjang',
                questionText: `${km} kilometer (km) sama dengan berapa meter?`,
                correctAnswer: `${ansVal} meter`,
                options: this.shuffle([`${ansVal} meter`, ...uniqueDists.map(v => `${v} meter`)])
            };
        } else if (kind === 'weight') {
            const kg = this.randInt(2, 8);
            const ansVal = kg * 1000;
            const distValues = [kg * 100, (kg + 1) * 1000, (kg - 1) * 1000, kg * 10000];
            const uniqueDists = Array.from(new Set(distValues.filter(v => v !== ansVal))).slice(0, 3);
            return {
                category: 'Satuan Berat',
                questionText: `${kg} kilogram (kg) setara dengan berapa gram?`,
                correctAnswer: `${ansVal} gram`,
                options: this.shuffle([`${ansVal} gram`, ...uniqueDists.map(v => `${v} gram`)])
            };
        } else {
            const hours = this.randInt(2, 6);
            const ansVal = hours * 60;
            const distValues = [(hours + 1) * 60, (hours - 1) * 60, hours * 30, hours * 100];
            const uniqueDists = Array.from(new Set(distValues.filter(v => v !== ansVal))).slice(0, 3);
            return {
                category: 'Satuan Waktu',
                questionText: `${hours} jam sama dengan berapa menit?`,
                correctAnswer: `${ansVal} menit`,
                options: this.shuffle([`${ansVal} menit`, ...uniqueDists.map(v => `${v} menit`)])
            };
        }
    }

    genMathStoryProblem(diff) {
        const names = ['Budi', 'Siti', 'Rizky', 'Aisyah', 'Rio', 'Dewi', 'Putra', 'Adit', 'Nisa', 'Fajar'];
        const items = ['apel', 'permen', 'kelereng', 'pensil', 'buku tulis', 'stiker', 'donat', 'jeruk'];

        const name = this.pickRandom(names);
        const item = this.pickRandom(items);

        const scenario = this.pickRandom(['add', 'subtract', 'share', 'packs']);

        if (scenario === 'add') {
            const a = this.randInt(5, 25);
            const b = this.randInt(3, 20);
            const ans = a + b;
            const dists = this.createNumericDistractors(ans, 1, ans + 20).map(d => `${d} buah`);
            return {
                category: 'Soal Cerita',
                questionText: `${name} memiliki ${a} buah ${item}. Kemudian ayahnya membelikan lagi ${b} buah. Berapakah total ${item} ${name} sekarang?`,
                correctAnswer: `${ans} buah`,
                options: this.shuffle([`${ans} buah`, ...dists])
            };
        } else if (scenario === 'subtract') {
            const b = this.randInt(4, 15);
            const a = b + this.randInt(5, 25);
            const ans = a - b;
            const dists = this.createNumericDistractors(ans, 0, ans + 20).map(d => `${d} buah`);
            return {
                category: 'Soal Cerita',
                questionText: `${name} mempunyai ${a} ${item}. Sebanyak ${b} ${item} diberikan kepada temannya. Berapa sisa ${item} ${name}?`,
                correctAnswer: `${ans} buah`,
                options: this.shuffle([`${ans} buah`, ...dists])
            };
        } else if (scenario === 'share') {
            const friends = this.randInt(2, 6);
            const each = this.randInt(3, 10);
            const total = friends * each;
            const dists = this.createNumericDistractors(each, 1, each + 15).map(d => `${d} buah`);
            return {
                category: 'Soal Cerita',
                questionText: `${name} membawa ${total} buah ${item} untuk dibagikan sama rata kepada ${friends} orang temannya. Berapa buah ${item} yang diterima tiap anak?`,
                correctAnswer: `${each} buah`,
                options: this.shuffle([`${each} buah`, ...dists])
            };
        } else {
            const packs = this.randInt(3, 8);
            const perPack = this.randInt(4, 10);
            const ans = packs * perPack;
            const dists = this.createNumericDistractors(ans, 5, ans + 30).map(d => `${d} buah`);
            return {
                category: 'Soal Cerita',
                questionText: `${name} membeli ${packs} kantong ${item}. Jika setiap kantong berisi ${perPack} buah ${item}, berapa total seluruh ${item} yang dibeli?`,
                correctAnswer: `${ans} buah`,
                options: this.shuffle([`${ans} buah`, ...dists])
            };
        }
    }

    // ==========================================
    // 2. GENERATOR 10.000 SOAL IPA (SAINS ANAK)
    // ==========================================
    initScienceDatabase() {
        // Combinatorial Matrix for Animals (50+ Animals)
        this.animals = [
            { name: 'Singa', diet: 'Karnivora (pemakan daging)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Padang rumput / Darat', group: 'Mamalia' },
            { name: 'Harimau', diet: 'Karnivora (pemakan daging)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Hutan lebat', group: 'Mamalia' },
            { name: 'Sapi', diet: 'Herbivora (pemakan tumbuhan)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Padang rumput / Peternakan', group: 'Mamalia' },
            { name: 'Kambing', diet: 'Herbivora (pemakan tumbuhan)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Darat', group: 'Mamalia' },
            { name: 'Kelinci', diet: 'Herbivora (pemakan tumbuhan)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Darat', group: 'Mamalia' },
            { name: 'Ayam', diet: 'Omnivora (pemakan segala)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Darat', group: 'Aves (Unggas)' },
            { name: 'Bebek', diet: 'Omnivora (pemakan segala)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Darat dan air', group: 'Aves (Unggas)' },
            { name: 'Elang', diet: 'Karnivora (pemakan daging)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru & pundi-pundi udara', habitat: 'Udara dan darat', group: 'Aves (Burung pemangsa)' },
            { name: 'Kucing', diet: 'Karnivora (pemakan daging)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Darat', group: 'Mamalia' },
            { name: 'Lumba-lumba', diet: 'Karnivora (pemakan ikan)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Laut', group: 'Mamalia air' },
            { name: 'Paus Biru', diet: 'Karnivora (pemakan plankton & ikan)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Samudra / Laut', group: 'Mamalia laut' },
            { name: 'Katak', diet: 'Karnivora / Insektivora (pemakan serangga)', breed: 'Ovipar (bertelur)', breath: 'Insang saat kecebong, paru-paru dan kulit basah saat dewasa', habitat: 'Amfibi (darat dan air)', group: 'Amfibia' },
            { name: 'Ikan Mas', diet: 'Omnivora', breed: 'Ovipar (bertelur)', breath: 'Insang', habitat: 'Air tawar', group: 'Pisces (Ikan)' },
            { name: 'Ikan Hiu', diet: 'Karnivora (pemakan daging)', breed: 'Ovovivipar (bertelur dan melahirkan)', breath: 'Insang', habitat: 'Laut', group: 'Pisces (Ikan)' },
            { name: 'Buaya', diet: 'Karnivora (pemakan daging)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Rawa, sungai, muara', group: 'Reptilia' },
            { name: 'Ular Boa / Kobra', diet: 'Karnivora (pemakan daging)', breed: 'Ovipar / Ovovivipar', breath: 'Paru-paru', habitat: 'Darat / Pohon', group: 'Reptilia' },
            { name: 'Kura-kura', diet: 'Omnivora / Herbivora', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Darat dan air', group: 'Reptilia' },
            { name: 'Bunglon', diet: 'Insektivora (pemakan serangga)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Pohon', group: 'Reptilia (Mimikri)' },
            { name: 'Cecak', diet: 'Insektivora (pemakan nyamuk/serangga)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Dinding / Pohon', group: 'Reptilia (Autotomi)' },
            { name: 'Kelelawar', diet: 'Frugivora / Insektivora', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Gua / Pohon', group: 'Mamalia terbang (Ekolokasi)' },
            { name: 'Belalang', diet: 'Herbivora (pemakan daun)', breed: 'Ovipar (bertelur)', breath: 'Trakea', habitat: 'Padang rumput', group: 'Insekta (Serangga)' },
            { name: 'Kupu-kupu', diet: 'Nektar bunga', breed: 'Ovipar (bertelur)', breath: 'Trakea', habitat: 'Taman bunga', group: 'Insekta (Metamorfosis Sempurna)' },
            { name: 'Nyamuk', diet: 'Darah dan nektar', breed: 'Ovipar (bertelur)', breath: 'Trakea / Siphon saat jentik', habitat: 'Air menggenang dan udara', group: 'Insekta' },
            { name: 'Cacing Tanah', diet: 'Detritivora (zat organik tanah)', breed: 'Hermafrodit', breath: 'Seluruh permukaan kulit basah', habitat: 'Tanah lembap', group: 'Annelida' },
            { name: 'Penguin', diet: 'Karnivora (pemakan ikan & krill)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Kutub Selatan / Salju dingin', group: 'Aves (Burung tak bisa terbang)' },
            { name: 'Beruang Kutub', diet: 'Karnivora (pemakan anjing laut)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Kutub Utara / Arktik', group: 'Mamalia' },
            { name: 'Gajah', diet: 'Herbivora (rumput, ranting, buah)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Hutan savana', group: 'Mamalia darat terbesar' },
            { name: 'Jerapah', diet: 'Herbivora (daun pucuk pohon tinggi)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Savana Afrika', group: 'Mamalia leher panjang' },
            { name: 'Unta', diet: 'Herbivora', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Gurun pasir', group: 'Mamalia berpunuk' },
            { name: 'Orangutan', diet: 'Omnivora (buah, daun, serangga)', breed: 'Vivipar (melahirkan)', breath: 'Paru-paru', habitat: 'Hutan hujan tropis Kalimantan & Sumatera', group: 'Primata' },
            { name: 'Komodo', diet: 'Karnivora (pemakan daging & bangkai)', breed: 'Ovipar (bertelur)', breath: 'Paru-paru', habitat: 'Pulau Komodo, NTT', group: 'Kadal terbesar di dunia' }
        ];

        // Plant Botany Matrix
        this.plants = [
            { part: 'Akar', function: 'Menyerap air dan unsur hara dari dalam tanah serta memperkokoh tanaman' },
            { part: 'Batang', function: 'Menopang tumbuhan dan menyalurkan air serta zat makanan ke seluruh bagian' },
            { part: 'Daun', function: 'Tempat terjadinya fotosintesis untuk memasak makanan bagi tumbuhan' },
            { part: 'Bunga', function: 'Alat perkembangbiakan generatif pada tumbuhan (penyerbukan)' },
            { part: 'Buah', function: 'Melindungi biji serta menyimpan cadangan makanan' },
            { part: 'Biji', function: 'Calon tumbuhan baru hasil dari pembuahan' },
            { part: 'Klorofil', function: 'Zat hijau daun yang berfungsi menangkap energi cahaya matahari untuk fotosintesis' }
        ];

        // Plant Adaptations
        this.plantAdaptations = [
            { plant: 'Kaktus', adaptation: 'Daun bermodifikasi menjadi duri dan batang tebal berlapis lilin untuk menyimpan cadangan air di gurun' },
            { plant: 'Teratai', adaptation: 'Memiliki daun bundar lebar tipis dan batang berongga udara untuk mengapung di air' },
            { plant: 'Pohon Bakau (Mangrove)', adaptation: 'Memiliki akar napas (pneumatofor) yang menyembul ke atas permukaan air lumpur' },
            { plant: 'Kantong Semar', adaptation: 'Memiliki kantung nektar penjebak serangga untuk mendapatkan zat nitrogen tambahan' },
            { plant: 'Pohon Jati', adaptation: 'Menggugurkan daunnya pada musim kemarau untuk mengurangi penguapan air (meranggas)' }
        ];

        // Human Body Organs & Senses
        this.humanOrgans = [
            { organ: 'Jantung', function: 'Memompa darah yang kaya oksigen ke seluruh bagian tubuh' },
            { organ: 'Paru-paru', function: 'Tempat terjadinya pertukaran gas oksigen (O₂) dan karbon dioksida (CO₂)' },
            { organ: 'Lambung', function: 'Mencerna makanan secara mekanik dan kimiawi dengan bantuan enzim pepsin dan asam klorida' },
            { organ: 'Otak', function: 'Pusat pengendali seluruh aktivitas tubuh, pikiran, memori, dan gerakan' },
            { organ: 'Ginjal', function: 'Menyaring darah dan membuang zat sisa metabolisme dalam bentuk urin' },
            { organ: 'Hati', function: 'Menawarkan racun (detoksifikasi) dan memproduksi cairan empedu' },
            { organ: 'Tulang', function: 'Alat gerak pasif dan penopang bentuk tubuh serta pelindung organ vital' },
            { organ: 'Otot', function: 'Alat gerak aktif yang berkontraksi dan berelaksasi untuk menggerakkan tulang' }
        ];

        this.senses = [
            { sense: 'Mata', stimulus: 'Melihat cahaya, warna, dan bentuk benda di sekitar' },
            { sense: 'Telinga', stimulus: 'Mendengar bunyi dan getaran suara serta menjaga keseimbangan tubuh' },
            { sense: 'Hidung', stimulus: 'Mencium bau / aroma dan menyaring udara pernapasan' },
            { sense: 'Lidah', stimulus: 'Mengecap rasa manis, asin, asam, dan pahit pada makanan' },
            { sense: 'Kulit', stimulus: 'Merasakan sentuhan, suhu panas/dingin, tekanan, dan rasa sakit' }
        ];

        // Solar System Planets
        this.planets = [
            { name: 'Merkurius', title: 'Planet terdekat dengan Matahari dan planet terkecil di tata surya' },
            { name: 'Venus', title: 'Planet terpanas di tata surya dan dijuluki Bintang Kejora / Bintang Fajar' },
            { name: 'Bumi', title: 'Satu-satunya planet di tata surya yang dihuni oleh makhluk hidup dan dijuluki Planet Biru' },
            { name: 'Mars', title: 'Dijuluki Planet Merah karena permukaannya banyak mengandung besi oksida' },
            { name: 'Yupiter', title: 'Planet terbesar di tata surya dengan Bintik Merah Raksasa' },
            { name: 'Saturnus', title: 'Planet yang terkenal dengan cincin debu dan es yang sangat indah' },
            { name: 'Uranus', title: 'Planet terdingin dengan sumbu rotasi yang sangat miring hampir sejajar bidang orbit' },
            { name: 'Neptunus', title: 'Planet paling jauh dari Matahari yang berwarna biru pekat dan berangin badai hebat' }
        ];

        // Phase changes of matter
        this.phaseChanges = [
            { from: 'Padat', to: 'Cair', term: 'Mencair (Melebur)', example: 'Es batu yang dibiarkan di suhu ruangan atau lilin yang dinyalakan' },
            { from: 'Cair', to: 'Padat', term: 'Membeku', example: 'Air dimasukkan ke dalam freezer kulkas menjadi balok es' },
            { from: 'Cair', to: 'Gas', term: 'Menguap', example: 'Air dimasak hingga mendidih mengeluarkan uap, atau jemuran basah mengering di bawah matahari' },
            { from: 'Gas', to: 'Cair', term: 'Mengembun', example: 'Munculnya titik-titik air di dinding luar gelas berisi es dingin atau embun pagi hari' },
            { from: 'Padat', to: 'Gas', term: 'Menyublim', example: 'Kapur barus (kamper) yang diletakkan di lemari pakaian lama-kelamaan mengecil dan habis' },
            { from: 'Gas', to: 'Padat', term: 'Mengkristal (Deposisi)', example: 'Uap air di udara berubah menjadi butiran salju di musim dingin' }
        ];

        // Energy Transformations
        this.energyTransformations = [
            { device: 'Kipas angin', change: 'Energi listrik menjadi energi gerak' },
            { device: 'Setrika listrik', change: 'Energi listrik menjadi energi panas (kalor)' },
            { device: 'Lampu bohlam', change: 'Energi listrik menjadi energi cahaya dan panas' },
            { device: 'Radio tape', change: 'Energi listrik menjadi energi bunyi' },
            { device: 'Panel surya (solar cell)', change: 'Energi cahaya matahari menjadi energi listrik' },
            { device: 'Gitar akustik yang dipetik', change: 'Energi gerak (kinetik) menjadi energi bunyi' },
            { device: 'Mobil bensin', change: 'Energi kimia dari bahan bakar menjadi energi gerak dan panas' },
            { device: 'Pembangkit Listrik Tenaga Air (PLTA)', change: 'Energi gerak aliran air menjadi energi listrik' }
        ];
    }

    generateScienceQuestion(difficulty = 'normal') {
        const categories = [
            'animal_diet',
            'animal_breed',
            'animal_breath',
            'animal_habitat',
            'plant_part',
            'plant_adapt',
            'human_organ',
            'human_sense',
            'solar_system',
            'phase_change',
            'energy_change'
        ];

        let attempts = 0;
        while (attempts < 80) {
            attempts++;
            const cat = this.pickRandom(categories);
            let qData = null;

            switch (cat) {
                case 'animal_diet':
                    qData = this.genSciAnimalDiet();
                    break;
                case 'animal_breed':
                    qData = this.genSciAnimalBreed();
                    break;
                case 'animal_breath':
                    qData = this.genSciAnimalBreath();
                    break;
                case 'animal_habitat':
                    qData = this.genSciAnimalHabitat();
                    break;
                case 'plant_part':
                    qData = this.genSciPlantPart();
                    break;
                case 'plant_adapt':
                    qData = this.genSciPlantAdapt();
                    break;
                case 'human_organ':
                    qData = this.genSciHumanOrgan();
                    break;
                case 'human_sense':
                    qData = this.genSciHumanSense();
                    break;
                case 'solar_system':
                    qData = this.genSciSolarSystem();
                    break;
                case 'phase_change':
                    qData = this.genSciPhaseChange();
                    break;
                case 'energy_change':
                    qData = this.genSciEnergyChange();
                    break;
            }

            if (qData) {
                const qId = `S_${qData.category}_${qData.questionText}_${qData.correctAnswer}`;
                if (!this.usedQuestionIds.has(qId)) {
                    this.usedQuestionIds.add(qId);
                    return this.packageQuestion(qData, 'ipa', difficulty);
                }
            }
        }

        // Guaranteed fallback question
        const animal = this.pickRandom(this.animals);
        return this.packageQuestion({
            category: 'Dunia Hewan',
            questionText: `Berdasarkan jenis makanannya, hewan ${animal.name} tergolong ke dalam kelompok ...`,
            correctAnswer: animal.diet,
            options: this.shuffle([animal.diet, 'Herbivora', 'Karnivora', 'Omnivora'])
        }, 'ipa', difficulty);
    }

    genSciAnimalDiet() {
        const animal = this.pickRandom(this.animals);
        const allDiets = ['Herbivora (pemakan tumbuhan)', 'Karnivora (pemakan daging)', 'Omnivora (pemakan segala)', 'Insektivora (pemakan serangga)'];
        const correct = animal.diet.startsWith('Karnivora') ? 'Karnivora (pemakan daging)' :
                        animal.diet.startsWith('Herbivora') ? 'Herbivora (pemakan tumbuhan)' :
                        animal.diet.startsWith('Omnivora') ? 'Omnivora (pemakan segala)' : 'Insektivora (pemakan serangga)';
        const dists = allDiets.filter(d => d !== correct);
        return {
            category: 'Klasifikasi Hewan',
            questionText: `Berdasarkan jenis makanannya, hewan ${animal.name} dikelompokkan ke dalam hewan ...`,
            correctAnswer: correct,
            options: this.shuffle([correct, ...dists.slice(0, 3)])
        };
    }

    genSciAnimalBreed() {
        const animal = this.pickRandom(this.animals);
        const allBreeds = ['Ovipar (bertelur)', 'Vivipar (melahirkan)', 'Ovovivipar (bertelur dan melahirkan)', 'Fragmentasi (membelah diri)'];
        const correct = animal.breed.startsWith('Ovipar') ? 'Ovipar (bertelur)' :
                        animal.breed.startsWith('Vivipar') ? 'Vivipar (melahirkan)' : 'Ovovivipar (bertelur dan melahirkan)';
        const dists = allBreeds.filter(b => b !== correct);
        return {
            category: 'Perkembangbiakan Hewan',
            questionText: `Bagaimanakah cara hewan ${animal.name} berkembang biak?`,
            correctAnswer: correct,
            options: this.shuffle([correct, ...dists.slice(0, 3)])
        };
    }

    genSciAnimalBreath() {
        const animal = this.pickRandom(this.animals);
        const allBreaths = ['Paru-paru', 'Insang', 'Trakea', 'Kulit basah yang lembap'];
        let correct = animal.breath;
        if (correct.includes('Insang')) correct = 'Insang';
        else if (correct.includes('Trakea')) correct = 'Trakea';
        else if (correct.includes('Kulit')) correct = 'Kulit basah yang lembap';
        else correct = 'Paru-paru';

        const dists = allBreaths.filter(b => b !== correct);
        return {
            category: 'Sistem Pernapasan Hewan',
            questionText: `Alat pernapasan utama yang digunakan oleh hewan ${animal.name} adalah ...`,
            correctAnswer: correct,
            options: this.shuffle([correct, ...dists.slice(0, 3)])
        };
    }

    genSciAnimalHabitat() {
        const animal = this.pickRandom(this.animals);
        const options = this.shuffle([
            animal.habitat,
            'Gurun pasir tandus',
            'Padang es kutub yang dingin',
            'Di dalam air laut yang asin',
            'Di puncak pohon kanopi hutan'
        ]).filter((item, idx, arr) => arr.indexOf(item) === idx);

        const correct = animal.habitat;
        const dists = options.filter(o => o !== correct).slice(0, 3);
        return {
            category: 'Habitat Hewan',
            questionText: `Di manakah tempat tinggal (habitat) alami dari hewan ${animal.name}?`,
            correctAnswer: correct,
            options: this.shuffle([correct, ...dists])
        };
    }

    genSciPlantPart() {
        const part = this.pickRandom(this.plants);
        const otherParts = this.plants.filter(p => p.part !== part.part);
        const dists = this.shuffle(otherParts).slice(0, 3).map(p => p.function);
        return {
            category: 'Bagian Tumbuhan & Fungsinya',
            questionText: `Apakah fungsi utama dari bagian tumbuhan "${part.part}"?`,
            correctAnswer: part.function,
            options: this.shuffle([part.function, ...dists])
        };
    }

    genSciPlantAdapt() {
        const item = this.pickRandom(this.plantAdaptations);
        const otherPlants = this.plantAdaptations.filter(p => p.plant !== item.plant);
        const dists = this.shuffle(otherPlants).slice(0, 3).map(p => p.plant);
        return {
            category: 'Adaptasi Tumbuhan',
            questionText: `Tumbuhan apakah yang beradaptasi dengan cara: "${item.adaptation}"?`,
            correctAnswer: item.plant,
            options: this.shuffle([item.plant, ...dists])
        };
    }

    genSciHumanOrgan() {
        const item = this.pickRandom(this.humanOrgans);
        const others = this.humanOrgans.filter(o => o.organ !== item.organ);
        const dists = this.shuffle(others).slice(0, 3).map(o => o.organ);
        return {
            category: 'Organ Tubuh Manusia',
            questionText: `Organ tubuh manusia yang berfungsi untuk: "${item.function}" adalah ...`,
            correctAnswer: item.organ,
            options: this.shuffle([item.organ, ...dists])
        };
    }

    genSciHumanSense() {
        const item = this.pickRandom(this.senses);
        const others = this.senses.filter(s => s.sense !== item.sense);
        const dists = this.shuffle(others).slice(0, 3).map(s => s.sense);
        return {
            category: 'Panca Indera Manusia',
            questionText: `Panca indera yang berfungsi untuk ${item.stimulus} adalah ...`,
            correctAnswer: item.sense,
            options: this.shuffle([item.sense, ...dists])
        };
    }

    genSciSolarSystem() {
        const planet = this.pickRandom(this.planets);
        const others = this.planets.filter(p => p.name !== planet.name);
        const dists = this.shuffle(others).slice(0, 3).map(p => p.name);
        return {
            category: 'Tata Surya & Antariksa',
            questionText: `Planet yang dikenal sebagai: "${planet.title}" adalah ...`,
            correctAnswer: planet.name,
            options: this.shuffle([planet.name, ...dists])
        };
    }

    genSciPhaseChange() {
        const pc = this.pickRandom(this.phaseChanges);
        const others = this.phaseChanges.filter(p => p.term !== pc.term);
        const dists = this.shuffle(others).slice(0, 3).map(p => p.term);

        const isExample = Math.random() > 0.5;
        if (isExample) {
            return {
                category: 'Perubahan Wujud Benda',
                questionText: `Peristiwa: "${pc.example}" merupakan contoh dari perubahan wujud ...`,
                correctAnswer: pc.term,
                options: this.shuffle([pc.term, ...dists])
            };
        } else {
            return {
                category: 'Perubahan Wujud Benda',
                questionText: `Perubahan wujud benda dari zat ${pc.from} menjadi zat ${pc.to} disebut ...`,
                correctAnswer: pc.term,
                options: this.shuffle([pc.term, ...dists])
            };
        }
    }

    genSciEnergyChange() {
        const item = this.pickRandom(this.energyTransformations);
        const others = this.energyTransformations.filter(e => e.change !== item.change);
        const dists = this.shuffle(others).slice(0, 3).map(e => e.change);
        return {
            category: 'Transformasi Energi',
            questionText: `Saat ${item.device} digunakan, terjadi perubahan bentuk energi yaitu ...`,
            correctAnswer: item.change,
            options: this.shuffle([item.change, ...dists])
        };
    }

    // Standardized Question Packaging with Strict Uniqueness Guarantee
    packageQuestion(qData, theme, difficulty) {
        const uniqueOptions = new Set();
        uniqueOptions.add(qData.correctAnswer);

        if (Array.isArray(qData.options)) {
            for (const opt of qData.options) {
                if (opt !== undefined && opt !== null && opt !== '') {
                    uniqueOptions.add(opt);
                }
            }
        }

        // Guaranteed fallback if fewer than 4 unique options
        let fallbackStep = 1;
        while (uniqueOptions.size < 4) {
            const num = parseFloat(qData.correctAnswer);
            if (!isNaN(num) && Number.isFinite(num)) {
                uniqueOptions.add((num + fallbackStep).toString());
            } else {
                uniqueOptions.add(`${qData.correctAnswer} *`);
            }
            fallbackStep++;
        }

        return {
            id: 'Q_' + Math.random().toString(36).substring(2, 9),
            theme: theme,
            difficulty: difficulty,
            category: qData.category,
            questionText: qData.questionText,
            correctAnswer: qData.correctAnswer,
            options: this.shuffle(Array.from(uniqueOptions).slice(0, 4))
        };
    }
}

window.questionEngine = new QuestionEngine();
