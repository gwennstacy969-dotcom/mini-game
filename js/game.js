/**
 * RiYooIQ - Main Game Controller
 * Manages screen transitions, game loop, AI logic, input handling (touch & keyboard),
 * scoring, stats, and real-time tug/push battle mechanics.
 */

class RiYooGame {
    constructor() {
        // Game Settings
        this.theme = 'matematika'; // 'matematika' | 'ipa'
        this.arenaType = 'tug_of_war'; // 'tug_of_war' | 'arm_wrestling' | 'cliff_push'
        this.targetQuestions = 10; // 5, 10, 15, 20, 25
        this.mode = 'vs_ai'; // 'vs_ai' | 'multiplayer'
        this.difficulty = 'normal'; // 'easy' | 'normal' | 'hard'

        // Gameplay State
        this.powerBalance = 0; // -100 (P1 Win) to +100 (P2/AI Win)
        this.isPlaying = false;
        this.isPaused = false;
        this.matchStartTime = 0;

        // Player 1 State
        this.p1 = {
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            answerTimes: [],
            questionStartTime: 0,
            currentQuestion: null,
            isLocked: false,
            lockTimer: null
        };

        // Player 2 / AI State
        this.p2 = {
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            answerTimes: [],
            questionStartTime: 0,
            currentQuestion: null,
            isLocked: false,
            lockTimer: null,
            aiTimer: null
        };

        // Idle decay timer
        this.idleDecayTimer = null;

        // Canvas Arena Instance
        this.arena = null;

        // PWA Install Prompt State
        this.deferredPrompt = null;

        // DOM Elements
        this.initDOMElements();
        this.bindEvents();
        this.initPWA();
    }

    initPWA() {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('[RiYooIQ] Service Worker terdaftar sukses:', reg.scope))
                    .catch(err => console.log('[RiYooIQ] Service Worker registrasi gagal:', err));
            });
        }

        // Intercept native beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btnInstallTop = document.getElementById('btn-install-app');
            if (btnInstallTop) btnInstallTop.classList.add('pulse-install');
            console.log('[RiYooIQ] Native PWA install prompt siap digunakan!');
        });

        // App Installed event
        window.addEventListener('appinstalled', () => {
            console.log('[RiYooIQ] Aplikasi berhasil terpasang di perangkat!');
            this.deferredPrompt = null;
            this.modalInstall?.classList.add('hidden');
        });
    }

    initDOMElements() {
        // Screens
        this.screens = {
            loading: document.getElementById('screen-loading'),
            menu: document.getElementById('screen-menu'),
            setup1: document.getElementById('screen-setup-1'),
            setup2: document.getElementById('screen-setup-2'),
            gameplay: document.getElementById('screen-gameplay'),
            victory: document.getElementById('screen-victory')
        };

        // Loading elements
        this.loadingBar = document.getElementById('loading-bar-fill');
        this.loadingText = document.getElementById('loading-text');

        // Setup 1 Cards
        this.themeCards = document.querySelectorAll('.theme-card');

        // Setup 2 Options
        this.arenaCards = document.querySelectorAll('.arena-card');
        this.questionButtons = document.querySelectorAll('.btn-qcount');
        this.modeButtons = document.querySelectorAll('.btn-mode');
        this.diffButtons = document.querySelectorAll('.btn-diff');

        // Gameplay HUD
        this.hudTugFillP1 = document.getElementById('tug-fill-p1');
        this.hudTugFillP2 = document.getElementById('tug-fill-p2');
        this.hudTugIndicator = document.getElementById('tug-indicator-needle');
        this.hudP1Score = document.getElementById('hud-p1-score');
        this.hudP2Score = document.getElementById('hud-p2-score');
        this.hudTargetGoal = document.getElementById('hud-target-goal');
        this.hudArenaTitle = document.getElementById('hud-arena-title');

        // Player Panels
        this.panelP1 = document.getElementById('panel-p1');
        this.panelP2 = document.getElementById('panel-p2');
        this.panelAI = document.getElementById('panel-ai');

        // Question Containers
        this.p1Category = document.getElementById('p1-category');
        this.p1Question = document.getElementById('p1-question');
        this.p1Options = document.querySelectorAll('.p1-option-btn');
        this.p1LockOverlay = document.getElementById('p1-lock-overlay');
        this.p1LockTimerText = document.getElementById('p1-lock-time');
        this.p1StreakBadge = document.getElementById('p1-streak-badge');

        this.p2Category = document.getElementById('p2-category');
        this.p2Question = document.getElementById('p2-question');
        this.p2Options = document.querySelectorAll('.p2-option-btn');
        this.p2LockOverlay = document.getElementById('p2-lock-overlay');
        this.p2LockTimerText = document.getElementById('p2-lock-time');
        this.p2StreakBadge = document.getElementById('p2-streak-badge');

        this.aiStatusText = document.getElementById('ai-status-text');
        this.aiThinkingBar = document.getElementById('ai-thinking-bar');
        this.aiQuestionText = document.getElementById('ai-question-text');

        // Victory Modal / Screen
        this.vicTitle = document.getElementById('vic-title');
        this.vicSubtitle = document.getElementById('vic-subtitle');
        this.vicP1Stats = document.getElementById('vic-p1-stats');
        this.vicP2Stats = document.getElementById('vic-p2-stats');

        // Modals
        this.modalHowToPlay = document.getElementById('modal-howtoplay');
        this.modalInstall = document.getElementById('modal-install');
    }

    bindEvents() {
        // Sound toggles
        const btnSfx = document.getElementById('btn-toggle-sfx');
        const btnMusic = document.getElementById('btn-toggle-music');
        if (btnSfx) {
            btnSfx.addEventListener('click', () => {
                const on = window.soundEngine.toggleSfx();
                btnSfx.classList.toggle('active', on);
                btnSfx.querySelector('.icon-text').textContent = on ? 'SFX: ON 🔔' : 'SFX: OFF 🔕';
                window.soundEngine.playClick();
            });
        }
        if (btnMusic) {
            btnMusic.addEventListener('click', () => {
                const on = window.soundEngine.toggleMusic();
                btnMusic.classList.toggle('active', on);
                btnMusic.querySelector('.icon-text').textContent = on ? 'Musik: ON 🎵' : 'Musik: OFF 🔇';
                window.soundEngine.playClick();
            });
        }

        // PWA Install Action Handlers
        const handleOpenInstall = () => {
            window.soundEngine?.playClick();
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('[RiYooIQ] PWA install accepted!');
                    }
                    this.deferredPrompt = null;
                });
            } else {
                this.modalInstall?.classList.remove('hidden');
            }
        };

        document.getElementById('btn-install-app')?.addEventListener('click', handleOpenInstall);
        document.getElementById('btn-install-pwa-main')?.addEventListener('click', handleOpenInstall);
        document.getElementById('btn-trigger-pwa-install')?.addEventListener('click', () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then(() => {
                    this.deferredPrompt = null;
                    this.modalInstall?.classList.add('hidden');
                });
            } else {
                alert('Silakan gunakan menu browser Anda: Titik Tiga (⋮) -> "Install Aplikasi" atau "Tambahkan ke Layar Utama".');
            }
        });

        document.getElementById('btn-close-install')?.addEventListener('click', () => {
            window.soundEngine?.playClick();
            this.modalInstall?.classList.add('hidden');
        });

        // Main Menu buttons
        document.getElementById('btn-start-game')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.showScreen('setup1');
        });

        document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.modalHowToPlay?.classList.remove('hidden');
        });

        document.getElementById('btn-close-howtoplay')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.modalHowToPlay?.classList.add('hidden');
        });

        // Setup 1 -> Back / Next
        document.getElementById('btn-setup1-back')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.showScreen('menu');
        });

        document.getElementById('btn-setup1-next')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.showScreen('setup2');
        });

        this.themeCards.forEach(card => {
            card.addEventListener('click', () => {
                window.soundEngine.playClick();
                this.themeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.theme = card.dataset.theme;
            });
        });

        // Setup 2 Arena Cards
        this.arenaCards.forEach(card => {
            card.addEventListener('click', () => {
                window.soundEngine.playClick();
                this.arenaCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.arenaType = card.dataset.arena;
            });
        });

        // Setup 2 Question count buttons
        this.questionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundEngine.playClick();
                this.questionButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.targetQuestions = parseInt(btn.dataset.count, 10);
            });
        });

        // Setup 2 Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundEngine.playClick();
                this.modeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.mode = btn.dataset.mode;
            });
        });

        // Setup 2 Difficulty buttons
        this.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundEngine.playClick();
                this.diffButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.dataset.diff;
            });
        });

        // Setup 2 Navigation
        document.getElementById('btn-setup2-back')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.showScreen('setup1');
        });

        document.getElementById('btn-start-match')?.addEventListener('click', () => {
            window.soundEngine.playStart();
            this.startMatch();
        });

        // Gameplay buttons
        this.p1Options.forEach((btn, index) => {
            const handleP1 = (e) => {
                e.preventDefault();
                this.handleAnswer('p1', index);
            };
            btn.addEventListener('touchstart', handleP1, { passive: false });
            btn.addEventListener('click', handleP1);
        });

        this.p2Options.forEach((btn, index) => {
            const handleP2 = (e) => {
                e.preventDefault();
                this.handleAnswer('p2', index);
            };
            btn.addEventListener('touchstart', handleP2, { passive: false });
            btn.addEventListener('click', handleP2);
        });

        // Pause button
        document.getElementById('btn-game-pause')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.togglePause();
        });

        document.getElementById('btn-resume-game')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.togglePause();
        });

        document.getElementById('btn-quit-game')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.endMatch(null, true);
            this.showScreen('menu');
        });

        // Victory buttons
        document.getElementById('btn-play-again')?.addEventListener('click', () => {
            window.soundEngine.playStart();
            this.startMatch();
        });

        document.getElementById('btn-back-menu')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.showScreen('menu');
        });

        // Keyboard Controls Handler
        window.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    handleKeyboardInput(e) {
        if (!this.isPlaying || this.isPaused) return;

        // Player 1 controls: A (0), S (1), D (2), F (3) or 1, 2, 3, 4
        const key = e.key.toUpperCase();
        if (key === 'A' || key === '1') this.handleAnswer('p1', 0);
        else if (key === 'S' || key === '2') this.handleAnswer('p1', 1);
        else if (key === 'D' || key === '3') this.handleAnswer('p1', 2);
        else if (key === 'F' || key === '4') this.handleAnswer('p1', 3);

        // Player 2 controls in Multiplayer:
        if (this.mode === 'multiplayer') {
            if (key === 'J' || key === 'ARROWLEFT') this.handleAnswer('p2', 0);
            else if (key === 'K' || key === 'ARROWUP') this.handleAnswer('p2', 1);
            else if (key === 'L' || key === 'ARROWDOWN') this.handleAnswer('p2', 2);
            else if (key === ';' || key === 'ARROWRIGHT' || key === ':') this.handleAnswer('p2', 3);
        }
    }

    showScreen(screenKey) {
        Object.keys(this.screens).forEach(key => {
            if (this.screens[key]) {
                if (key === screenKey) {
                    this.screens[key].classList.remove('hidden');
                } else {
                    this.screens[key].classList.add('hidden');
                }
            }
        });

        if (screenKey === 'gameplay') {
            if (!this.arena) {
                const ArenaClass = window.CanvasArena || CanvasArena;
                this.arena = new ArenaClass('arena-canvas');
            }
            this.arena.setArena(this.arenaType);
            this.arena.reset();
            this.arena.resize();
            this.arena.start();
        } else if (this.arena) {
            this.arena.stop();
        }
    }

    startLoading(onComplete) {
        let progress = 0;
        const messages = [
            'Menyiapkan arena pertarungan seru...',
            'Menghubungkan 20.000 generator soal pintar...',
            'Memanaskan tali tambang & meja panco...',
            'Siap-siap jadi juara RiYooIQ!'
        ];

        const interval = setInterval(() => {
            progress += 3;
            if (this.loadingBar) {
                this.loadingBar.style.width = `${progress}%`;
            }

            const msgIdx = Math.min(messages.length - 1, Math.floor((progress / 100) * messages.length));
            if (this.loadingText) {
                this.loadingText.textContent = `${messages[msgIdx]} (${progress}%)`;
            }

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 400);
            }
        }, 35);
    }

    // ==========================================
    // GAMEPLAY LIFECYCLE
    // ==========================================
    startMatch() {
        this.isPlaying = true;
        this.isPaused = false;
        document.getElementById('modal-pause')?.classList.add('hidden');
        document.getElementById('modal-howtoplay')?.classList.add('hidden');
        document.getElementById('modal-install')?.classList.add('hidden');
        this.powerBalance = 0;
        this.matchStartTime = performance.now();

        // Reset QuestionEngine session history
        window.questionEngine.resetSession();

        // Reset Players
        this.p1 = {
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            answerTimes: [],
            questionStartTime: performance.now(),
            currentQuestion: null,
            isLocked: false,
            lockTimer: null
        };

        this.p2 = {
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            answerTimes: [],
            questionStartTime: performance.now(),
            currentQuestion: null,
            isLocked: false,
            lockTimer: null,
            aiTimer: null
        };

        // Configure Layout according to Mode
        if (this.mode === 'vs_ai') {
            this.panelP2?.classList.add('hidden');
            this.panelAI?.classList.remove('hidden');
        } else {
            this.panelP2?.classList.remove('hidden');
            this.panelAI?.classList.add('hidden');
        }

        // Set Arena Title in HUD
        const arenaNames = {
            tug_of_war: 'Tarik Tambang Ceria 🪢',
            arm_wrestling: 'Adu Panco Juara 🦾',
            cliff_push: 'Dorong di Tepi Jurang ⛰️'
        };
        if (this.hudArenaTitle) {
            this.hudArenaTitle.textContent = arenaNames[this.arenaType] || 'Arena Pertandingan';
        }
        if (this.hudTargetGoal) {
            this.hudTargetGoal.textContent = `Target: ${this.targetQuestions} Jawaban`;
        }

        this.showScreen('gameplay');
        this.updateHUD();

        // Load First Questions
        this.loadNextQuestion('p1');
        if (this.mode === 'multiplayer') {
            this.loadNextQuestion('p2');
        } else {
            this.scheduleAIAnswer();
        }

        // Start Idle Decay Monitor
        this.startIdleDecay();
    }

    loadNextQuestion(player) {
        if (!this.isPlaying) return;

        const q = this.theme === 'matematika'
            ? window.questionEngine.generateMathQuestion(this.difficulty)
            : window.questionEngine.generateScienceQuestion(this.difficulty);

        if (player === 'p1') {
            this.p1.currentQuestion = q;
            this.p1.questionStartTime = performance.now();
            this.renderQuestionCard('p1', q);
        } else {
            this.p2.currentQuestion = q;
            this.p2.questionStartTime = performance.now();
            if (this.mode === 'multiplayer') {
                this.renderQuestionCard('p2', q);
            }
        }
    }

    renderQuestionCard(player, q) {
        if (player === 'p1') {
            if (this.p1Category) this.p1Category.textContent = q.category;
            if (this.p1Question) this.p1Question.textContent = q.questionText;
            this.p1Options.forEach((btn, idx) => {
                const optText = btn.querySelector('.btn-opt-text');
                if (optText) optText.textContent = q.options[idx] || '';
                btn.classList.remove('correct-pulse', 'wrong-shake');
            });
        } else if (player === 'p2') {
            if (this.p2Category) this.p2Category.textContent = q.category;
            if (this.p2Question) this.p2Question.textContent = q.questionText;
            this.p2Options.forEach((btn, idx) => {
                const optText = btn.querySelector('.btn-opt-text');
                if (optText) optText.textContent = q.options[idx] || '';
                btn.classList.remove('correct-pulse', 'wrong-shake');
            });
        }
    }

    handleAnswer(player, optionIndex) {
        if (!this.isPlaying || this.isPaused) return;

        const p = player === 'p1' ? this.p1 : this.p2;
        if (p.isLocked || !p.currentQuestion) return;

        const selectedAnswer = p.currentQuestion.options[optionIndex];
        const isCorrect = selectedAnswer === p.currentQuestion.correctAnswer;
        const answerTime = (performance.now() - p.questionStartTime) / 1000;
        p.answerTimes.push(answerTime);

        // Step strength based on target questions
        const step = 100 / this.targetQuestions;

        const btnElement = player === 'p1' ? this.p1Options[optionIndex] : this.p2Options[optionIndex];

        if (isCorrect) {
            p.score += 100 + p.currentStreak * 20;
            p.correctCount++;
            p.currentStreak++;
            if (p.currentStreak > p.maxStreak) p.maxStreak = p.currentStreak;

            // Shift power balance towards player victory:
            // P1 pulls to negative (-), P2/AI pulls to positive (+)
            if (player === 'p1') {
                this.powerBalance -= step;
            } else {
                this.powerBalance += step;
            }

            // Audio & Visual Effects
            window.soundEngine.playCorrect();
            window.soundEngine.playPushOrTug();
            this.arena?.triggerHit(player, true);
            this.arena?.setPowerBalance(this.powerBalance);

            if (btnElement) {
                btnElement.classList.add('correct-pulse');
            }

            // Update streak badge
            this.updateStreakBadge(player);

            // Check Win Condition
            if (this.checkWinCondition()) return;

            // Load next question quickly
            setTimeout(() => {
                this.loadNextQuestion(player);
            }, 250);

        } else {
            p.wrongCount++;
            p.currentStreak = 0;
            this.updateStreakBadge(player);

            window.soundEngine.playWrong();
            this.arena?.triggerHit(player, false);

            if (btnElement) {
                btnElement.classList.add('wrong-shake');
            }

            // Freeze Penalty: 1.5 Seconds
            this.applyPenalty(player, 1.5);
        }

        this.updateHUD();
    }

    applyPenalty(player, durationSec) {
        const p = player === 'p1' ? this.p1 : this.p2;
        p.isLocked = true;

        const overlay = player === 'p1' ? this.p1LockOverlay : this.p2LockOverlay;
        const timerText = player === 'p1' ? this.p1LockTimerText : this.p2LockTimerText;

        if (overlay) overlay.classList.remove('hidden');

        let remaining = durationSec;
        if (timerText) timerText.textContent = remaining.toFixed(1) + 's';

        const tickInterval = setInterval(() => {
            remaining -= 0.1;
            if (timerText) timerText.textContent = Math.max(0, remaining).toFixed(1) + 's';
        }, 100);

        p.lockTimer = setTimeout(() => {
            clearInterval(tickInterval);
            p.isLocked = false;
            if (overlay) overlay.classList.add('hidden');
        }, durationSec * 1000);
    }

    updateStreakBadge(player) {
        const p = player === 'p1' ? this.p1 : this.p2;
        const badge = player === 'p1' ? this.p1StreakBadge : this.p2StreakBadge;
        if (!badge) return;

        if (p.currentStreak >= 2) {
            badge.textContent = `🔥 KOMBO ${p.currentStreak}x!`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // ==========================================
    // AI BEHAVIOR SIMULATOR (VS AI MODE)
    // ==========================================
    scheduleAIAnswer() {
        if (!this.isPlaying || this.mode !== 'vs_ai') return;

        // Difficulty specs:
        // Easy: 4.0 - 7.0 s, 70% accuracy
        // Normal: 2.5 - 4.5 s, 85% accuracy
        // Hard: 1.2 - 2.8 s, 95% accuracy
        let minTime = 2.5, maxTime = 4.5, accuracy = 0.85;
        if (this.difficulty === 'easy') {
            minTime = 4.0; maxTime = 7.0; accuracy = 0.70;
        } else if (this.difficulty === 'hard') {
            minTime = 1.2; maxTime = 2.8; accuracy = 0.95;
        }

        const thinkDuration = minTime + Math.random() * (maxTime - minTime);

        // Generate AI Question
        const aiQ = this.theme === 'matematika'
            ? window.questionEngine.generateMathQuestion(this.difficulty)
            : window.questionEngine.generateScienceQuestion(this.difficulty);

        this.p2.currentQuestion = aiQ;
        if (this.aiQuestionText) {
            this.aiQuestionText.textContent = `"${aiQ.questionText}"`;
        }
        if (this.aiStatusText) {
            this.aiStatusText.textContent = '🤖 AI sedang menghitung...';
        }

        // Animate thinking bar
        if (this.aiThinkingBar) {
            this.aiThinkingBar.style.transition = `width ${thinkDuration}s linear`;
            this.aiThinkingBar.style.width = '100%';
        }

        this.p2.aiTimer = setTimeout(() => {
            if (!this.isPlaying || this.isPaused) return;

            // Reset thinking bar
            if (this.aiThinkingBar) {
                this.aiThinkingBar.style.transition = 'none';
                this.aiThinkingBar.style.width = '0%';
            }

            const isCorrect = Math.random() < accuracy;
            const step = 100 / this.targetQuestions;

            if (isCorrect) {
                this.p2.score += 100;
                this.p2.correctCount++;
                this.p2.currentStreak++;
                this.powerBalance += step; // Pull towards AI victory

                if (this.aiStatusText) {
                    this.aiStatusText.textContent = '⚡ AI Menjawab Benar!';
                }

                window.soundEngine.playPushOrTug();
                this.arena?.triggerHit('p2', true);
                this.arena?.setPowerBalance(this.powerBalance);

            } else {
                this.p2.wrongCount++;
                this.p2.currentStreak = 0;
                if (this.aiStatusText) {
                    this.aiStatusText.textContent = '❌ AI Salah Menjawab!';
                }
                this.arena?.triggerHit('p2', false);
            }

            this.updateHUD();

            if (!this.checkWinCondition()) {
                // Next AI turn
                setTimeout(() => {
                    this.scheduleAIAnswer();
                }, 800);
            }
        }, thinkDuration * 1000);
    }

    // ==========================================
    // IDLE DECAY (Pressure mechanism)
    // ==========================================
    startIdleDecay() {
        if (this.idleDecayTimer) clearInterval(this.idleDecayTimer);

        this.idleDecayTimer = setInterval(() => {
            if (!this.isPlaying || this.isPaused) return;

            const now = performance.now();
            const p1IdleTime = (now - this.p1.questionStartTime) / 1000;

            // If player 1 is idle for more than 7 seconds, slight pressure drift towards opponent
            if (p1IdleTime > 7.0) {
                this.powerBalance = Math.min(100, this.powerBalance + 1.2);
                this.arena?.setPowerBalance(this.powerBalance);
                this.updateHUD();
                this.checkWinCondition();
            }
        }, 1200);
    }

    // ==========================================
    // WIN / LOSE CONDITIONS & VICTORY SCREEN
    // ==========================================
    checkWinCondition() {
        let winner = null;

        // Condition 1: KO Balance hit
        if (this.powerBalance <= -100) {
            winner = 'p1';
        } else if (this.powerBalance >= 100) {
            winner = 'p2';
        }
        // Condition 2: Target questions hit
        else if (this.p1.correctCount >= this.targetQuestions) {
            winner = 'p1';
        } else if (this.p2.correctCount >= this.targetQuestions) {
            winner = 'p2';
        }

        if (winner) {
            this.endMatch(winner, false);
            return true;
        }

        return false;
    }

    endMatch(winner, aborted = false) {
        this.isPlaying = false;
        if (this.idleDecayTimer) clearInterval(this.idleDecayTimer);
        if (this.p1.lockTimer) clearTimeout(this.p1.lockTimer);
        if (this.p2.lockTimer) clearTimeout(this.p2.lockTimer);
        if (this.p2.aiTimer) clearTimeout(this.p2.aiTimer);

        if (aborted) return;

        // Trigger arena finale animation
        this.arena?.setGameOver(winner);

        if (winner === 'p1') {
            window.soundEngine.playVictory();
        } else {
            window.soundEngine.playFall();
        }

        // Show Victory Screen after short celebration delay
        setTimeout(() => {
            this.showVictoryScreen(winner);
        }, 1400);
    }

    showVictoryScreen(winner) {
        const isP1 = winner === 'p1';
        const p2Name = this.mode === 'vs_ai' ? 'Komputer (AI)' : 'Pemain 2';

        if (this.vicTitle) {
            this.vicTitle.textContent = isP1 ? '🎉 HORE! KAMU MENANG! 🏆' : `💪 ${p2Name.toUpperCase()} MENANG!`;
        }

        if (this.vicSubtitle) {
            this.vicSubtitle.textContent = isP1
                ? 'Luar biasa! Otak cerdas dan kecepatan jarimu berhasil mengalahkan lawan!'
                : 'Pertandingan yang seru! Jangan menyerah, ayo coba lagi dan raih kemenangan!';
        }

        // Statistics
        const p1Total = this.p1.correctCount + this.p1.wrongCount;
        const p1Acc = p1Total > 0 ? Math.round((this.p1.correctCount / p1Total) * 100) : 0;
        const p1AvgTime = this.p1.answerTimes.length > 0
            ? (this.p1.answerTimes.reduce((a, b) => a + b, 0) / this.p1.answerTimes.length).toFixed(1)
            : '0.0';

        const p2Total = this.p2.correctCount + this.p2.wrongCount;
        const p2Acc = p2Total > 0 ? Math.round((this.p2.correctCount / p2Total) * 100) : 0;
        const p2AvgTime = this.p2.answerTimes.length > 0
            ? (this.p2.answerTimes.reduce((a, b) => a + b, 0) / this.p2.answerTimes.length).toFixed(1)
            : '0.0';

        if (this.vicP1Stats) {
            this.vicP1Stats.innerHTML = `
                <div class="stat-badge p1-badge">Pemain 1 (Kiri)</div>
                <div class="stat-row"><span>Skor:</span> <strong>${this.p1.score}</strong></div>
                <div class="stat-row"><span>Jawaban Benar:</span> <strong>${this.p1.correctCount} / ${this.targetQuestions}</strong></div>
                <div class="stat-row"><span>Akurasi:</span> <strong>${p1Acc}%</strong></div>
                <div class="stat-row"><span>Rata-rata Waktu:</span> <strong>${p1AvgTime} detik</strong></div>
                <div class="stat-row"><span>Kombo Terbaik:</span> <strong>${this.p1.maxStreak}x</strong></div>
            `;
        }

        if (this.vicP2Stats) {
            this.vicP2Stats.innerHTML = `
                <div class="stat-badge p2-badge">${p2Name}</div>
                <div class="stat-row"><span>Skor:</span> <strong>${this.p2.score}</strong></div>
                <div class="stat-row"><span>Jawaban Benar:</span> <strong>${this.p2.correctCount} / ${this.targetQuestions}</strong></div>
                <div class="stat-row"><span>Akurasi:</span> <strong>${p2Acc}%</strong></div>
                <div class="stat-row"><span>Rata-rata Waktu:</span> <strong>${p2AvgTime} detik</strong></div>
                <div class="stat-row"><span>Kombo Terbaik:</span> <strong>${this.p2.maxStreak}x</strong></div>
            `;
        }

        this.showScreen('victory');
    }

    updateHUD() {
        if (this.hudP1Score) this.hudP1Score.textContent = this.p1.score;
        if (this.hudP2Score) this.hudP2Score.textContent = this.p2.score;

        // Tug Bar (-100 to +100)
        // 0 balance = 50% needle position
        const needlePercent = 50 + (this.powerBalance / 2);
        if (this.hudTugIndicator) {
            this.hudTugIndicator.style.left = `${Math.max(5, Math.min(95, needlePercent))}%`;
        }

        // Fill bars
        if (this.hudTugFillP1 && this.hudTugFillP2) {
            if (this.powerBalance < 0) {
                // P1 leading
                this.hudTugFillP1.style.width = `${Math.min(50, -this.powerBalance / 2)}%`;
                this.hudTugFillP2.style.width = '0%';
            } else {
                // P2 leading
                this.hudTugFillP1.style.width = '0%';
                this.hudTugFillP2.style.width = `${Math.min(50, this.powerBalance / 2)}%`;
            }
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const modalPause = document.getElementById('modal-pause');
        if (this.isPaused) {
            modalPause?.classList.remove('hidden');
        } else {
            modalPause?.classList.add('hidden');
        }
    }
}

window.RiYooGame = RiYooGame;

// Initialize RiYooIQ when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const game = new RiYooGame();
    window.riyooGame = game;
    game.startLoading(() => {
        game.showScreen('menu');
    });
});
