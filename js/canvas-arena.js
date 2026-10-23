/**
 * RiYooIQ - Canvas Arena Engine (60 FPS)
 * High-performance HTML5 Canvas animation engine with:
 * 1. Tarik Tambang (Tug of War)
 * 2. Adu Panco (Arm Wrestling)
 * 3. Dorong-dorongan di Tepi Jurang (Cliff Push Battle)
 * Features dynamic character expressions, particle system, camera shake, and physics spring.
 */

class CanvasArena {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.arenaType = 'tug_of_war'; // 'tug_of_war' | 'arm_wrestling' | 'cliff_push'
        this.powerBalance = 0; // -100 (P1 win) to +100 (P2 win)
        this.displayedBalance = 0; // Smooth interpolated balance
        this.isGameOver = false;
        this.winner = null; // 'p1' | 'p2' | null

        // Particle system
        this.particles = [];
        this.floatingClouds = [];

        // Camera shake
        this.shakeIntensity = 0;

        // Animation timing
        this.lastTime = performance.now();
        this.animFrameId = null;

        // Character dynamic states
        this.p1State = { strain: 0, cheer: 0, fallProgress: 0 };
        this.p2State = { strain: 0, cheer: 0, fallProgress: 0 };

        this.initClouds();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    initClouds() {
        this.floatingClouds = [
            { x: 50, y: 35, speed: 0.15, size: 45, opacity: 0.4 },
            { x: 220, y: 20, speed: 0.22, size: 60, opacity: 0.6 },
            { x: 450, y: 40, speed: 0.12, size: 50, opacity: 0.35 },
            { x: 700, y: 25, speed: 0.18, size: 55, opacity: 0.5 }
        ];
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width || 800;
        this.height = rect.height || 360;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        if (this.ctx) {
            this.ctx.resetTransform?.();
            this.ctx.scale(dpr, dpr);
        }
    }

    setArena(type) {
        this.arenaType = type;
        this.particles = [];
        this.shakeIntensity = 0;
        this.p1State = { strain: 0, cheer: 0, fallProgress: 0 };
        this.p2State = { strain: 0, cheer: 0, fallProgress: 0 };
    }

    setPowerBalance(val) {
        this.powerBalance = Math.max(-100, Math.min(100, val));
    }

    triggerHit(targetPlayer, isCorrect) {
        if (isCorrect) {
            this.shakeIntensity = 8;
            const x = targetPlayer === 'p1' ? this.width * 0.3 : this.width * 0.7;
            const y = this.height * 0.55;
            this.spawnCorrectParticles(x, y);
        } else {
            this.shakeIntensity = 4;
            const x = targetPlayer === 'p1' ? this.width * 0.35 : this.width * 0.65;
            const y = this.height * 0.5;
            this.spawnSweatParticles(x, y);
        }
    }

    spawnCorrectParticles(x, y) {
        const colors = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#FFF'];
        for (let i = 0; i < 22; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 3 + Math.random() * 4,
                alpha: 1,
                decay: 0.025 + Math.random() * 0.02,
                type: 'star'
            });
        }
    }

    spawnDust(x, y, dir) {
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + Math.random() * 5,
                vx: dir * (1 + Math.random() * 2),
                vy: -0.5 - Math.random() * 1.5,
                color: '#D8CBB5',
                size: 4 + Math.random() * 5,
                alpha: 0.8,
                decay: 0.035,
                type: 'dust'
            });
        }
    }

    spawnSweatParticles(x, y) {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y - 20 + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random() * 2,
                color: '#4CC9F0',
                size: 3 + Math.random() * 3,
                alpha: 1,
                decay: 0.03,
                type: 'sweat'
            });
        }
    }

    setGameOver(winner) {
        this.isGameOver = true;
        this.winner = winner;
        this.shakeIntensity = 12;
        // Celebration confetti
        for (let i = 0; i < 80; i++) {
            this.particles.push({
                x: this.width * 0.5 + (Math.random() - 0.5) * 300,
                y: this.height * 0.2,
                vx: (Math.random() - 0.5) * 8,
                vy: -3 - Math.random() * 6,
                color: ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#9B5DE5'][Math.floor(Math.random() * 5)],
                size: 5 + Math.random() * 5,
                alpha: 1,
                decay: 0.012,
                type: 'confetti',
                rot: Math.random() * Math.PI,
                vrot: (Math.random() - 0.5) * 0.2
            });
        }
    }

    reset() {
        this.powerBalance = 0;
        this.displayedBalance = 0;
        this.isGameOver = false;
        this.winner = null;
        this.particles = [];
        this.shakeIntensity = 0;
        this.p1State = { strain: 0, cheer: 0, fallProgress: 0 };
        this.p2State = { strain: 0, cheer: 0, fallProgress: 0 };
    }

    start() {
        if (!this.animFrameId) {
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    }

    stop() {
        if (this.animFrameId) {
            const caf = window.cancelAnimationFrame || clearTimeout;
            caf(this.animFrameId);
            this.animFrameId = null;
        }
    }

    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        const raf = window.requestAnimationFrame || (cb => setTimeout(() => cb(performance.now()), 16));
        this.animFrameId = raf(t => this.loop(t));
    }

    update(dt) {
        // Smooth interpolation of power balance
        const target = this.powerBalance;
        const diff = target - this.displayedBalance;
        this.displayedBalance += diff * Math.min(1, dt * 6);

        // Camera shake dampening
        if (this.shakeIntensity > 0) {
            this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 18);
        }

        // Update clouds
        this.floatingClouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.width + 60) {
                cloud.x = -60;
            }
        });

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.type === 'confetti' || p.type === 'sweat') {
                p.vy += 0.15; // Gravity
            }
            if (p.rot !== undefined && p.vrot !== undefined) {
                p.rot += p.vrot;
            }
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Falling animation if cliff push game over
        if (this.arenaType === 'cliff_push' && this.isGameOver) {
            if (this.winner === 'p1') {
                this.p2State.fallProgress += dt * 1.5;
            } else if (this.winner === 'p2') {
                this.p1State.fallProgress += dt * 1.5;
            }
        }
    }

    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // Apply camera shake
        if (this.shakeIntensity > 0) {
            const sx = (Math.random() - 0.5) * this.shakeIntensity;
            const sy = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(sx, sy);
        }

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // Render specific arena
        switch (this.arenaType) {
            case 'tug_of_war':
                this.renderTugOfWar(ctx, w, h);
                break;
            case 'arm_wrestling':
                this.renderArmWrestling(ctx, w, h);
                break;
            case 'cliff_push':
                this.renderCliffPush(ctx, w, h);
                break;
        }

        // Render particles on top
        this.renderParticles(ctx);

        ctx.restore();
    }

    // ==========================================
    // ARENA 1: TARIK TAMBANG (TUG OF WAR)
    // ==========================================
    renderTugOfWar(ctx, w, h) {
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        skyGrad.addColorStop(0, '#A7ECEE');
        skyGrad.addColorStop(1, '#DEF5E5');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.7);

        // Background clouds
        this.drawClouds(ctx);

        // Ground & grass
        const groundY = h * 0.68;
        const grassGrad = ctx.createLinearGradient(0, groundY, 0, h);
        grassGrad.addColorStop(0, '#58B868');
        grassGrad.addColorStop(1, '#3A8A48');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, groundY, w, h - groundY);

        // Ground texture detail
        ctx.fillStyle = '#4CA85C';
        ctx.fillRect(0, groundY, w, 6);

        // Center Marker Line on Ground
        const centerX = w * 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(centerX - 4, groundY, 8, h - groundY);
        // Yard marks
        for (let i = -3; i <= 3; i++) {
            if (i === 0) continue;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(centerX + i * 50 - 2, groundY, 4, 15);
        }

        // Dynamic offset based on balance (-100 to +100)
        // -100 means P1 pulled P2 towards left!
        const shiftX = (this.displayedBalance / 100) * (w * 0.22);

        const ropeY = groundY - 45;
        const p1X = centerX - 160 + shiftX;
        const p2X = centerX + 160 + shiftX;

        // Draw Thick Braided Rope
        ctx.save();
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#C49758';
        ctx.lineCap = 'round';

        // Rope wave/tension
        const tensionSag = Math.sin(performance.now() * 0.01) * 3;
        ctx.beginPath();
        ctx.moveTo(p1X + 15, ropeY);
        ctx.quadraticCurveTo(centerX + shiftX, ropeY + tensionSag, p2X - 15, ropeY);
        ctx.stroke();

        // Inner rope pattern highlight
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#E0B579';
        ctx.stroke();

        // Red Center Ribbon on Rope
        const ribbonX = centerX + shiftX;
        const ribbonY = ropeY + tensionSag * 0.5;
        ctx.fillStyle = '#EF476F';
        ctx.beginPath();
        ctx.arc(ribbonX, ribbonY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Hanging ribbon tails
        ctx.strokeStyle = '#EF476F';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(ribbonX, ribbonY);
        ctx.lineTo(ribbonX - 6, ribbonY + 22);
        ctx.moveTo(ribbonX, ribbonY);
        ctx.lineTo(ribbonX + 6, ribbonY + 24);
        ctx.stroke();
        ctx.restore();

        // Character 1 (Player 1 - Left, Cyan/Blue)
        const p1Status = this.displayedBalance < -20 ? 'winning' : (this.displayedBalance > 20 ? 'losing' : 'normal');
        this.drawTugCharacter(ctx, p1X, groundY, 'p1', p1Status, -1);

        // Character 2 (Player 2 / AI - Right, Red/Orange)
        const p2Status = this.displayedBalance > 20 ? 'winning' : (this.displayedBalance < -20 ? 'losing' : 'normal');
        this.drawTugCharacter(ctx, p2X, groundY, 'p2', p2Status, 1);

        // Periodic dust when pulling
        if (Math.abs(this.displayedBalance) > 10 && Math.random() < 0.25) {
            if (this.displayedBalance < 0) this.spawnDust(p1X, groundY - 5, -1);
            if (this.displayedBalance > 0) this.spawnDust(p2X, groundY - 5, 1);
        }
    }

    drawTugCharacter(ctx, x, groundY, player, status, facing) {
        ctx.save();
        ctx.translate(x, groundY);

        const isP1 = player === 'p1';
        const suitColor = isP1 ? '#118AB2' : '#E76F51';
        const beltColor = isP1 ? '#06D6A0' : '#F4A261';
        const skinColor = '#FFD1A4';

        // Leaning angle for pulling (radians)
        // If winning, pulls harder backwards
        const lean = (status === 'winning' ? 0.35 : (status === 'losing' ? 0.08 : 0.22)) * -facing;
        ctx.rotate(lean);

        // Legs
        ctx.strokeStyle = '#264653';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        // Back leg digging in
        ctx.beginPath();
        ctx.moveTo(-10 * facing, -40);
        ctx.lineTo(-28 * facing, -5);
        ctx.lineTo(-38 * facing, -2);
        ctx.stroke();

        // Front leg braced
        ctx.beginPath();
        ctx.moveTo(10 * facing, -40);
        ctx.lineTo(12 * facing, -15);
        ctx.lineTo(24 * facing, -2);
        ctx.stroke();

        // Shoes
        ctx.fillStyle = '#EF476F';
        ctx.beginPath();
        ctx.ellipse(-38 * facing, -2, 10, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(24 * facing, -2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body / Shirt
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.roundRect(-22, -80, 44, 44, 12);
        ctx.fill();

        // Belt
        ctx.fillStyle = beltColor;
        ctx.fillRect(-22, -45, 44, 8);

        // Arms gripping rope
        ctx.strokeStyle = suitColor;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(24 * facing, -45); // Reaching to the rope
        ctx.stroke();

        // Hands
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(24 * facing, -45, 7, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, -104, 22, 0, Math.PI * 2);
        ctx.fill();

        // Headband
        ctx.fillStyle = isP1 ? '#06D6A0' : '#FFD166';
        ctx.fillRect(-22, -114, 44, 8);

        // Face details
        this.drawFace(ctx, 0, -104, status, facing);

        // Sweat drops if losing
        if (status === 'losing') {
            ctx.fillStyle = '#4CC9F0';
            ctx.beginPath();
            ctx.arc(-14 * facing, -118, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // ==========================================
    // ARENA 2: ADU PANCO (ARM WRESTLING)
    // ==========================================
    renderArmWrestling(ctx, w, h) {
        // Spotlight indoor arena background
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 40, w * 0.5, h * 0.5, w * 0.7);
        bgGrad.addColorStop(0, '#3A405A');
        bgGrad.addColorStop(1, '#1A1C29');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Table height
        const tableY = h * 0.62;
        const centerX = w * 0.5;

        // Arm wrestling table base
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.roundRect(centerX - 240, tableY, 480, h - tableY, [16, 16, 0, 0]);
        ctx.fill();

        // Table top wood trim
        const woodGrad = ctx.createLinearGradient(0, tableY, 0, tableY + 28);
        woodGrad.addColorStop(0, '#D4A373');
        woodGrad.addColorStop(1, '#A9714B');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(centerX - 250, tableY, 500, 24);

        // Brass corner trims
        ctx.fillStyle = '#E9C46A';
        ctx.fillRect(centerX - 245, tableY, 20, 24);
        ctx.fillRect(centerX + 225, tableY, 20, 24);

        // Elbow cushions
        // P1 Cushion (Blue)
        ctx.fillStyle = '#118AB2';
        ctx.beginPath();
        ctx.roundRect(centerX - 130, tableY - 14, 60, 16, 6);
        ctx.fill();

        // P2 Cushion (Red)
        ctx.fillStyle = '#EF476F';
        ctx.beginPath();
        ctx.roundRect(centerX + 70, tableY - 14, 60, 16, 6);
        ctx.fill();

        // Characters Behind the Table (Portraits)
        const p1Status = this.displayedBalance < -20 ? 'winning' : (this.displayedBalance > 20 ? 'losing' : 'normal');
        const p2Status = this.displayedBalance > 20 ? 'winning' : (this.displayedBalance < -20 ? 'losing' : 'normal');

        this.drawBustCharacter(ctx, centerX - 180, tableY, 'p1', p1Status, 1);
        this.drawBustCharacter(ctx, centerX + 180, tableY, 'p2', p2Status, -1);

        // Arm Wrestling Dynamics
        // armAngle in degrees: -50 (P1 slammed P2 down) to +50 (P2 slammed P1 down)
        const armAngle = (this.displayedBalance / 100) * 55; // deg
        const armAngleRad = (armAngle * Math.PI) / 180;

        const pivotX = centerX;
        const pivotY = tableY - 8;
        const armLength = 85;

        // Grip Position
        const gripX = pivotX + Math.sin(armAngleRad) * armLength;
        const gripY = pivotY - Math.cos(armAngleRad) * armLength;

        // Draw Player 1 Arm (from Left Cushion to Grip)
        const p1ElbowX = centerX - 100;
        const p1ElbowY = tableY - 6;

        ctx.strokeStyle = '#FFD1A4';
        ctx.lineWidth = 26;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(p1ElbowX, p1ElbowY);
        ctx.lineTo(gripX, gripY);
        ctx.stroke();

        // P1 Wristband
        ctx.strokeStyle = '#118AB2';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(gripX - Math.sin(armAngleRad) * 14 - 10, gripY + Math.cos(armAngleRad) * 14);
        ctx.lineTo(gripX - Math.sin(armAngleRad) * 6, gripY + Math.cos(armAngleRad) * 6);
        ctx.stroke();

        // Draw Player 2 Arm (from Right Cushion to Grip)
        const p2ElbowX = centerX + 100;
        const p2ElbowY = tableY - 6;

        ctx.strokeStyle = '#F4A261';
        ctx.lineWidth = 26;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(p2ElbowX, p2ElbowY);
        ctx.lineTo(gripX, gripY);
        ctx.stroke();

        // P2 Wristband
        ctx.strokeStyle = '#EF476F';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(gripX + Math.sin(armAngleRad) * 14 + 10, gripY + Math.cos(armAngleRad) * 14);
        ctx.lineTo(gripX + Math.sin(armAngleRad) * 6, gripY + Math.cos(armAngleRad) * 6);
        ctx.stroke();

        // Interlocked Clenched Hands
        ctx.fillStyle = '#E76F51';
        ctx.beginPath();
        ctx.arc(gripX, gripY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Strain / Electric tension lines near hand grip
        if (Math.abs(this.displayedBalance) < 80) {
            ctx.strokeStyle = '#FFD166';
            ctx.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                const ox = (Math.random() - 0.5) * 36;
                const oy = (Math.random() - 0.5) * 36;
                ctx.beginPath();
                ctx.moveTo(gripX + ox, gripY + oy);
                ctx.lineTo(gripX + ox + (Math.random() - 0.5) * 14, gripY + oy + (Math.random() - 0.5) * 14);
                ctx.stroke();
            }
        } else {
            // Slam shockwave on win
            ctx.save();
            ctx.strokeStyle = '#FFD166';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(gripX, gripY, 35, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 22px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SLAM!!', gripX, gripY - 30);
            ctx.restore();
        }
    }

    drawBustCharacter(ctx, x, tableY, player, status, facing) {
        ctx.save();
        ctx.translate(x, tableY);

        const isP1 = player === 'p1';
        const suitColor = isP1 ? '#118AB2' : '#EF476F';
        const skinColor = isP1 ? '#FFD1A4' : '#F4A261';

        // Lean forward into match
        const lean = (status === 'winning' ? 0.15 : (status === 'losing' ? -0.1 : 0.05)) * facing;
        ctx.rotate(lean);

        // Torso
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.roundRect(-36, -70, 72, 70, [18, 18, 0, 0]);
        ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, -100, 26, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Band
        ctx.fillStyle = isP1 ? '#264653' : '#F4A261';
        ctx.beginPath();
        ctx.arc(0, -112, 26, Math.PI, Math.PI * 2);
        ctx.fill();

        // Face
        this.drawFace(ctx, 0, -100, status, facing);

        ctx.restore();
    }

    // ==========================================
    // ARENA 3: DORONG-DORONGAN DI TEPI JURANG (CLIFF PUSH)
    // ==========================================
    renderCliffPush(ctx, w, h) {
        // Dramatic Canyon Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#5390D9');
        skyGrad.addColorStop(0.5, '#72EFDD');
        skyGrad.addColorStop(1, '#FFDDD2');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Floating fluffy abyss clouds at bottom
        this.drawAbyssMist(ctx, w, h);

        // Stone Cliff Bridge
        const bridgeY = h * 0.65;
        const bridgeWidth = w * 0.62;
        const bridgeLeft = (w - bridgeWidth) * 0.5;
        const bridgeRight = bridgeLeft + bridgeWidth;

        // Deep Ravine Drop-offs (Left & Right voids)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, bridgeY, bridgeLeft, h - bridgeY);
        ctx.fillRect(bridgeRight, bridgeY, w - bridgeRight, h - bridgeY);

        // Stone Platform Piers
        ctx.fillStyle = '#4A4E69';
        ctx.beginPath();
        ctx.roundRect(bridgeLeft, bridgeY, bridgeWidth, h - bridgeY, [12, 12, 0, 0]);
        ctx.fill();

        // Stone block paver texture
        ctx.fillStyle = '#9A8C98';
        ctx.fillRect(bridgeLeft, bridgeY, bridgeWidth, 12);

        // Stone cracks/lines
        ctx.strokeStyle = '#22223B';
        ctx.lineWidth = 2;
        for (let i = bridgeLeft + 40; i < bridgeRight; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, bridgeY);
            ctx.lineTo(i + 10, bridgeY + 12);
            ctx.stroke();
        }

        // Danger Warning Zones near Cliff Edges
        const dangerMargin = 60;
        const isP1Danger = this.displayedBalance > 55;
        const isP2Danger = this.displayedBalance < -55;

        if (isP1Danger) {
            ctx.fillStyle = 'rgba(239, 71, 111, 0.35)';
            ctx.fillRect(bridgeLeft, bridgeY, dangerMargin, 12);
            this.drawDangerBadge(ctx, bridgeLeft + 25, bridgeY - 35, 'AWAS JURANG!');
        }

        if (isP2Danger) {
            ctx.fillStyle = 'rgba(239, 71, 111, 0.35)';
            ctx.fillRect(bridgeRight - dangerMargin, bridgeY, dangerMargin, 12);
            this.drawDangerBadge(ctx, bridgeRight - 25, bridgeY - 35, 'AWAS JURANG!');
        }

        // Push Battle Position along bridge
        // Balance 0 is dead center. -100 pushes P2 off right. +100 pushes P1 off left.
        const centerX = w * 0.5;
        const maxOffset = bridgeWidth * 0.42;
        // Balance shifts push point: negative balance moves push point to right (P1 pushing P2 away)
        const pushX = centerX + (-this.displayedBalance / 100) * maxOffset;

        // P1 & P2 Positions
        const p1X = pushX - 35;
        const p2X = pushX + 35;

        const p1Status = this.displayedBalance < -20 ? 'winning' : (this.displayedBalance > 20 ? 'losing' : 'normal');
        const p2Status = this.displayedBalance > 20 ? 'winning' : (this.displayedBalance < -20 ? 'losing' : 'normal');

        // Draw Fighter 1 (Left, Cyan/Blue)
        if (this.p1State.fallProgress > 0) {
            // Falling down cliff!
            this.drawFallingCharacter(ctx, bridgeLeft - 20, bridgeY, 'p1', this.p1State.fallProgress);
        } else {
            this.drawPushFighter(ctx, p1X, bridgeY, 'p1', p1Status, 1);
        }

        // Draw Fighter 2 (Right, Red/Orange)
        if (this.p2State.fallProgress > 0) {
            // Falling down cliff!
            this.drawFallingCharacter(ctx, bridgeRight + 20, bridgeY, 'p2', this.p2State.fallProgress);
        } else {
            this.drawPushFighter(ctx, p2X, bridgeY, 'p2', p2Status, -1);
        }

        // Clashing Hands Effect at center pushX
        if (!this.isGameOver) {
            ctx.fillStyle = '#FFD166';
            ctx.beginPath();
            ctx.arc(pushX, bridgeY - 48, 8 + Math.sin(performance.now() * 0.02) * 2, 0, Math.PI * 2);
            ctx.fill();

            // Ground pebble crumbles if high pressure
            if (Math.abs(this.displayedBalance) > 50 && Math.random() < 0.2) {
                const dropX = this.displayedBalance > 0 ? bridgeLeft + Math.random() * 20 : bridgeRight - Math.random() * 20;
                this.particles.push({
                    x: dropX,
                    y: bridgeY + 5,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: 2 + Math.random() * 3,
                    color: '#6C757D',
                    size: 3 + Math.random() * 3,
                    alpha: 1,
                    decay: 0.02,
                    type: 'rock'
                });
            }
        }
    }

    drawPushFighter(ctx, x, groundY, player, status, facing) {
        ctx.save();
        ctx.translate(x, groundY);

        const isP1 = player === 'p1';
        const suitColor = isP1 ? '#118AB2' : '#EF476F';
        const skinColor = '#FFD1A4';

        // Leaning forward to push against opponent
        const lean = (status === 'winning' ? 0.35 : (status === 'losing' ? 0.05 : 0.22)) * facing;
        ctx.rotate(lean);

        // Legs braced
        ctx.strokeStyle = '#264653';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        // Back leg
        ctx.beginPath();
        ctx.moveTo(-10 * facing, -40);
        ctx.lineTo(-26 * facing, -4);
        ctx.stroke();

        // Front leg
        ctx.beginPath();
        ctx.moveTo(8 * facing, -40);
        ctx.lineTo(14 * facing, -4);
        ctx.stroke();

        // Shoes
        ctx.fillStyle = isP1 ? '#06D6A0' : '#FFD166';
        ctx.beginPath();
        ctx.ellipse(-26 * facing, -2, 9, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(14 * facing, -2, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.roundRect(-20, -78, 40, 42, 10);
        ctx.fill();

        // Arms pushing forward with open palms
        ctx.strokeStyle = suitColor;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(0, -66);
        ctx.lineTo(26 * facing, -48);
        ctx.stroke();

        // Hands
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(26 * facing, -48, 8, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, -100, 22, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Band
        ctx.fillStyle = isP1 ? '#264653' : '#F4A261';
        ctx.beginPath();
        ctx.arc(0, -110, 22, Math.PI, Math.PI * 2);
        ctx.fill();

        // Face
        this.drawFace(ctx, 0, -100, status, facing);

        ctx.restore();
    }

    drawFallingCharacter(ctx, x, groundY, player, progress) {
        ctx.save();
        const fallY = groundY + progress * 240;
        const spin = progress * Math.PI * 4;

        ctx.translate(x, fallY);
        ctx.rotate(spin);
        ctx.scale(Math.max(0.2, 1 - progress * 0.6), Math.max(0.2, 1 - progress * 0.6));

        const suitColor = player === 'p1' ? '#118AB2' : '#EF476F';
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.roundRect(-18, -30, 36, 40, 8);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FFD1A4';
        ctx.beginPath();
        ctx.arc(0, -50, 18, 0, Math.PI * 2);
        ctx.fill();

        // Screaming mouth
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, -46, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawDangerBadge(ctx, x, y, text) {
        ctx.save();
        ctx.fillStyle = '#EF476F';
        ctx.beginPath();
        ctx.roundRect(x - 45, y - 12, 90, 24, 6);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawAbyssMist(ctx, w, h) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 5; i++) {
            const x = (i * (w / 4) + performance.now() * 0.02) % (w + 100) - 50;
            ctx.beginPath();
            ctx.ellipse(x, h * 0.88, 70, 25, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==========================================
    // REUSABLE CARTOON FACE RENDERER
    // ==========================================
    drawFace(ctx, x, y, status, facing) {
        const eyeOffsetX = 7 * facing;

        if (status === 'winning') {
            // Confident happy eyes (arches)
            ctx.strokeStyle = '#264653';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x + eyeOffsetX - 6, y - 3, 5, Math.PI, 0);
            ctx.arc(x + eyeOffsetX + 6, y - 3, 5, Math.PI, 0);
            ctx.stroke();

            // Broad smile
            ctx.beginPath();
            ctx.arc(x + eyeOffsetX, y + 4, 7, 0, Math.PI);
            ctx.stroke();
        } else if (status === 'losing') {
            // Panicked sweating eyes (wide white circles + tiny pupils)
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x + eyeOffsetX - 6, y - 3, 6, 0, Math.PI * 2);
            ctx.arc(x + eyeOffsetX + 6, y - 3, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + eyeOffsetX - 6, y - 3, 2.5, 0, Math.PI * 2);
            ctx.arc(x + eyeOffsetX + 6, y - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Trembling wavy mouth
            ctx.strokeStyle = '#264653';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x + eyeOffsetX - 7, y + 6);
            ctx.lineTo(x + eyeOffsetX - 2, y + 8);
            ctx.lineTo(x + eyeOffsetX + 3, y + 5);
            ctx.lineTo(x + eyeOffsetX + 7, y + 7);
            ctx.stroke();
        } else {
            // Normal determined face
            ctx.fillStyle = '#264653';
            ctx.beginPath();
            ctx.arc(x + eyeOffsetX - 6, y - 3, 3, 0, Math.PI * 2);
            ctx.arc(x + eyeOffsetX + 6, y - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            // Determined mouth / small smile
            ctx.strokeStyle = '#264653';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(x + eyeOffsetX, y + 5, 5, 0, Math.PI * 0.8);
            ctx.stroke();
        }
    }

    drawClouds(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.floatingClouds.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size * 0.45, 0, Math.PI * 2);
            ctx.arc(c.x + c.size * 0.35, c.y - c.size * 0.15, c.size * 0.38, 0, Math.PI * 2);
            ctx.arc(c.x + c.size * 0.7, c.y, c.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    renderParticles(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;

            if (p.type === 'confetti') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot || 0);
                ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size * 0.6);
            } else if (p.type === 'star') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }
}

window.CanvasArena = CanvasArena;
