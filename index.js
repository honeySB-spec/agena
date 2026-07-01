/* Interactive Javascript - AGENA Landing Page */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. Particle Canvas Background (Floating AI Mind Orb)
    // -------------------------------------------------------------------------
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = (canvas.width = window.innerWidth);
        height = (canvas.height = window.innerHeight);
    });

    const particles = [];
    const particleCount = 180;
    const sphereRadius = Math.min(width, height) * 0.22;
    const focalLength = 350;

    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0.003;
    let targetRotY = 0.004;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Track mouse movement
    window.addEventListener("mousemove", (e) => {
        targetMouseX = (e.clientX - width / 2) * 0.08;
        targetMouseY = (e.clientY - height / 2) * 0.08;
        
        targetRotX = (e.clientY - height / 2) * 0.00001;
        targetRotY = (e.clientX - width / 2) * 0.00001;
    });

    // Create 3D spherical particle points
    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        particles.push({
            x: sphereRadius * Math.sin(phi) * Math.cos(theta),
            y: sphereRadius * Math.sin(phi) * Math.sin(theta),
            z: sphereRadius * Math.cos(phi),
            origX: sphereRadius * Math.sin(phi) * Math.cos(theta),
            origY: sphereRadius * Math.sin(phi) * Math.sin(theta),
            origZ: sphereRadius * Math.cos(phi),
            color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`
        });
    }

    function rotateX(point, angle) {
        const rad = angle;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const y = point.y * cos - point.z * sin;
        const z = point.z * cos + point.y * sin;
        point.y = y;
        point.z = z;
    }

    function rotateY(point, angle) {
        const rad = angle;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const x = point.x * cos - point.z * sin;
        const z = point.z * cos + point.x * sin;
        point.x = x;
        point.z = z;
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Smoothly interpolate rotation speeds & mouse drift offsets
        rotX += (targetRotX - rotX) * 0.05;
        rotY += (targetRotY - rotY) * 0.05;
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Apply a base drift
        const currentRotX = rotX + 0.002;
        const currentRotY = rotY + 0.002;

        const centerX = width / 2 + mouseX;
        const centerY = height / 2 + mouseY;

        // Draw connections
        ctx.lineWidth = 0.55;
        
        // Depth sorting
        particles.sort((a, b) => b.z - a.z);

        // Rotate & project all particles
        const projected = [];
        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];
            
            // Add a subtle wave morphing over time
            const time = Date.now() * 0.001;
            const wave = 1 + Math.sin(p.x * 0.01 + time) * 0.04;
            
            let tempP = { x: p.x * wave, y: p.y * wave, z: p.z * wave };
            
            rotateX(tempP, currentRotX);
            rotateY(tempP, currentRotY);
            
            p.x = tempP.x;
            p.y = tempP.y;
            p.z = tempP.z;

            const scale = focalLength / (focalLength + p.z);
            const projX = centerX + p.x * scale;
            const projY = centerY + p.y * scale;
            
            projected.push({ x: projX, y: projY, z: p.z, scale, color: p.color });
        }

        // Draw lines between nearby points in 3D space
        for (let i = 0; i < projected.length; i++) {
            for (let j = i + 1; j < projected.length; j++) {
                const dist3D = Math.hypot(
                    particles[i].x - particles[j].x,
                    particles[i].y - particles[j].y,
                    particles[i].z - particles[j].z
                );
                
                // If particles are close in 3D, draw connection line
                if (dist3D < sphereRadius * 0.42) {
                    const alpha = (1 - dist3D / (sphereRadius * 0.42)) * 0.15;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(projected[i].x, projected[i].y);
                    ctx.lineTo(projected[j].x, projected[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particle dots
        for (let i = 0; i < projected.length; i++) {
            const p = projected[i];
            const size = Math.max(0.5, p.scale * 2.2);
            
            // Front-back brightness mapping
            const depthAlpha = (focalLength - p.z) / (focalLength * 1.5);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, depthAlpha * 0.7)})`;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    
    animate();


    // -------------------------------------------------------------------------
    // 2. Scroll Reveal Text Effect (Blur & Opacity transition)
    // -------------------------------------------------------------------------
    const revealContainer = document.querySelector(".reveal-container");
    const revealSpans = document.querySelectorAll(".reveal-text span");

    function handleScrollReveal() {
        if (!revealContainer) return;
        
        const rect = revealContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate scroll progress percentage (0 at bottom entrance, 1 at top exit)
        const scrollStart = viewportHeight * 0.85;
        const scrollEnd = viewportHeight * 0.2;
        
        const progress = (scrollStart - rect.top) / (scrollStart - scrollEnd);
        const clampedProgress = Math.max(0, Math.min(1, progress));

        const spanCount = revealSpans.length;
        
        revealSpans.forEach((span, index) => {
            // Allocate progress range to each span sequentially
            const startThreshold = index / spanCount;
            const endThreshold = (index + 0.6) / spanCount;
            
            if (clampedProgress >= endThreshold) {
                span.classList.add("active");
            } else if (clampedProgress < startThreshold) {
                span.classList.remove("active");
            } else {
                // Inside transitional region
                const factor = (clampedProgress - startThreshold) / (endThreshold - startThreshold);
                if (factor > 0.5) {
                    span.classList.add("active");
                } else {
                    span.classList.remove("active");
                }
            }
        });
    }

    window.addEventListener("scroll", handleScrollReveal);
    handleScrollReveal(); // Trigger once on load


    // -------------------------------------------------------------------------
    // 3. Waitlist Email Validation & Form Storage
    // -------------------------------------------------------------------------
    const waitlistForm = document.getElementById("waitlist-form");
    const waitlistEmail = document.getElementById("waitlist-email");
    const waitlistError = document.getElementById("waitlist-error");
    const successContainer = document.getElementById("waitlist-success-msg");

    // Check if user is already signed up in local storage
    if (localStorage.getItem("agena_waitlist_registered") === "true") {
        waitlistForm.style.display = "none";
        successContainer.style.display = "flex";
    }

    waitlistForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const emailValue = waitlistEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Reset styles
        waitlistForm.classList.remove("invalid");
        waitlistError.classList.remove("visible");

        if (!emailValue || !emailRegex.test(emailValue)) {
            waitlistForm.classList.add("invalid");
            waitlistError.classList.add("visible");
            return;
        }

        // Show button loading state
        waitlistForm.classList.add("loading");
        
        // Simulate network API submission
        setTimeout(() => {
            waitlistForm.classList.remove("loading");
            
            // Save state in localStorage
            localStorage.setItem("agena_waitlist_registered", "true");
            localStorage.setItem("agena_waitlist_email", emailValue);

            // Animate transition to success block
            waitlistForm.style.opacity = "0";
            waitlistForm.style.transform = "translateY(-10px)";
            
            setTimeout(() => {
                waitlistForm.style.display = "none";
                successContainer.style.display = "flex";
                successContainer.style.opacity = "0";
                successContainer.style.transform = "translateY(10px)";
                
                // Reflow transition
                setTimeout(() => {
                    successContainer.style.opacity = "1";
                    successContainer.style.transform = "translateY(0)";
                }, 50);
            }, 300);

        }, 1200);
    });

    // Reset error warning as user types
    waitlistEmail.addEventListener("input", () => {
        if (waitlistForm.classList.contains("invalid")) {
            waitlistForm.classList.remove("invalid");
            waitlistError.classList.remove("visible");
        }
    });


    // -------------------------------------------------------------------------
    // 4. Smartphone Voice Agent Simulator (Interactive State Machine)
    // -------------------------------------------------------------------------
    const scenarioBtns = document.querySelectorAll(".scenario-btn");
    const statusText = document.getElementById("simulator-status-text");
    const dialogScroll = document.getElementById("dialog-scroll");
    const confirmationOverlay = document.getElementById("confirmation-overlay");
    const confirmationDesc = document.getElementById("confirmation-desc");
    const appUiLayer = document.getElementById("app-ui-layer");
    const voiceAgentIndicator = document.getElementById("voice-agent-indicator");
    const voiceWaveContainer = document.querySelector(".voice-wave-container");

    const btnApprove = document.getElementById("btn-approve-action");
    const btnDecline = document.getElementById("btn-decline-action");

    let currentScenarioId = "ride";
    let activeTimer = null;
    let stepIndex = 0;
    let resolveConfirmation = null;

    // Defined Simulator Script Datasets
    const SCENARIOS = {
        ride: {
            title: "Simulating Ride Booking Scenario",
            screens: {
                init: `<div class="app-screen app-uber active">
                        <div class="uber-map">
                            <div class="map-route"></div>
                            <div class="map-marker pickup"></div>
                            <div class="map-marker destination"></div>
                        </div>
                        <div class="uber-details">
                            <div class="uber-header">Uber Options</div>
                            <div class="uber-option selected" id="uber-option-x">
                                <span class="option-name">UberX (5 min away)</span>
                                <span class="option-price">$14.50</span>
                            </div>
                            <div class="uber-option" id="uber-option-premier">
                                <span class="option-name">Premier (10 min away)</span>
                                <span class="option-price">$28.00</span>
                            </div>
                        </div>
                       </div>`,
                success: `<div class="app-screen app-uber active">
                            <div class="uber-map">
                                <div class="map-route" style="border-top-style: solid; border-right-style: solid; opacity: 0.8;"></div>
                                <div class="map-marker pickup" style="box-shadow: 0 0 12px var(--accent-cyan);"></div>
                                <div class="map-marker destination"></div>
                            </div>
                            <div class="uber-details" style="background: rgba(0, 230, 118, 0.08); border-top: 1px solid rgba(0, 230, 118, 0.2);">
                                <div class="uber-header" style="color: var(--accent-success);">Driver Dispatched</div>
                                <div style="font-size: 13px; font-weight: 700; color: white;">UberX Confirmed</div>
                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Driver arrives in 5 mins • Lic: 7XYZ42</div>
                            </div>
                          </div>`
            },
            steps: [
                { type: "user", text: "Hey AGENA, I need to get to the City General Hospital. Please book a ride.", wait: 2500 },
                { type: "agent", text: "Opening Uber to check options. One moment...", wait: 2000, pulse: true },
                { type: "app", state: "init", wait: 1200 },
                { type: "agent", text: "I see UberX is 5 mins away for $14.50, and Premier is 10 mins away for $28.00. Should I proceed with UberX?", wait: 3500, pulse: true },
                { type: "confirm", text: "Should I book the UberX for $14.50?" },
                { type: "agent-success", text: "UberX confirmed. Booking ride now... Success! Your driver is arriving in 5 minutes.", wait: 4000, pulse: true, state: "success" }
            ]
        },
        coffee: {
            title: "Simulating Starbucks Order Scenario",
            screens: {
                init: `<div class="app-screen app-starbucks active">
                        <div style="font-size: 15px; font-weight: 700; color: #036642; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Starbucks Express</div>
                        <div class="coffee-card">
                            <span class="coffee-cup">☕</span>
                            <span class="coffee-name">Caramel Macchiato</span>
                            <span class="coffee-price">$5.20</span>
                            <span class="coffee-meta">Grande size • Whole milk</span>
                        </div>
                       </div>`,
                success: `<div class="app-screen app-starbucks active">
                            <div style="font-size: 15px; font-weight: 700; color: #036642; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Starbucks Express</div>
                            <div class="coffee-card" style="background: rgba(0, 230, 118, 0.05); border-color: rgba(0, 230, 118, 0.3);">
                                <span class="coffee-cup" style="animation: none;">✅</span>
                                <span class="coffee-name" style="color: var(--accent-success);">Order Placed</span>
                                <span class="coffee-price">$5.20</span>
                                <span class="coffee-meta" style="color: white; font-weight: 600; margin-top: 8px;">Ready for pickup in 10 minutes</span>
                            </div>
                          </div>`
            },
            steps: [
                { type: "user", text: "Hey AGENA, order my usual coffee from Starbucks.", wait: 2500 },
                { type: "agent", text: "Opening Starbucks and loading your order history...", wait: 2000, pulse: true },
                { type: "app", state: "init", wait: 1200 },
                { type: "agent", text: "I've loaded your usual Grande Caramel Macchiato. The total cost is $5.20. Place order?", wait: 3500, pulse: true },
                { type: "confirm", text: "Confirm Starbucks order for $5.20?" },
                { type: "agent-success", text: "Order placed. Your Caramel Macchiato will be ready for pickup in 10 minutes!", wait: 4000, pulse: true, state: "success" }
            ]
        },
        email: {
            title: "Simulating Inbox Cleanup Scenario",
            screens: {
                init: `<div class="app-screen app-email active">
                        <div class="email-header">Mailbox: Inbox</div>
                        <div class="email-item" id="spam-mail-1">
                            <span class="email-sender">Discount Deals</span>
                            <span class="email-subject">Summer Blowout! 50% Off Everything</span>
                            <span class="email-snippet">Act fast before the prices double up on midnight...</span>
                        </div>
                        <div class="email-item" id="spam-mail-2">
                            <span class="email-sender">Weekly Recap</span>
                            <span class="email-subject">Your digest for newsletter tech news</span>
                            <span class="email-snippet">Here are the trending updates from the internet community...</span>
                        </div>
                        <div class="email-item" id="normal-mail-1">
                            <span class="email-sender" style="color: var(--accent-cyan);">Sarah Jenkins</span>
                            <span class="email-subject" style="color: white;">Urgent: Project Pitch Slide review</span>
                            <span class="email-snippet">Can you look at slide 14 before the team meeting at...</span>
                        </div>
                       </div>`,
                success: `<div class="app-screen app-email active">
                            <div class="email-header">Mailbox: Inbox</div>
                            <div class="email-item" style="background: rgba(0, 230, 118, 0.05); border-color: rgba(0, 230, 118, 0.2); justify-content: center; align-items: center; padding: 24px 12px;">
                                <span style="font-weight: 700; color: var(--accent-success); font-size: 13px;">Archived 2 Newsletters</span>
                            </div>
                            <div class="email-item" id="normal-mail-1">
                                <span class="email-sender" style="color: var(--accent-cyan);">Sarah Jenkins</span>
                                <span class="email-subject" style="color: white;">Urgent: Project Pitch Slide review</span>
                                <span class="email-snippet">Can you look at slide 14 before the team meeting at...</span>
                            </div>
                          </div>`
            },
            steps: [
                { type: "user", text: "Hey AGENA, archive all unread newsletter spam in my inbox.", wait: 2500 },
                { type: "agent", text: "Scanning your active inbox. Identified 2 promotional newsletters from 'Discount Deals' and 'Weekly Recap'.", wait: 3000, pulse: true },
                { type: "app", state: "init", wait: 1200 },
                { type: "agent", text: "Should I proceed with archiving these two newsletter threads?", wait: 3000, pulse: true },
                { type: "confirm", text: "Archive 2 newsletter emails?" },
                { type: "agent-success", text: "Emails archived. Your inbox is now cleaned.", wait: 4000, pulse: true, state: "success" }
            ]
        }
    };

    function setStatus(text, active = true) {
        statusText.textContent = text;
        const indicator = document.getElementById("simulator-status-indicator");
        if (active) {
            indicator.classList.add("active");
        } else {
            indicator.classList.remove("active");
        }
    }

    function addBubble(type, text) {
        const bubble = document.createElement("div");
        bubble.className = `dialog-bubble ${type === "user" ? "user" : "agent"}`;
        bubble.textContent = text;
        dialogScroll.appendChild(bubble);
        
        // Auto-scroll chat box
        dialogScroll.scrollTop = dialogScroll.scrollHeight;
    }

    function showConfirmation(text, callback) {
        confirmationDesc.textContent = text;
        confirmationOverlay.classList.add("active");
        resolveConfirmation = callback;
    }

    function hideConfirmation() {
        confirmationOverlay.classList.remove("active");
        resolveConfirmation = null;
    }

    function updateVoiceState(state) {
        // state: 'idle', 'pulse', 'success', 'decline'
        voiceAgentIndicator.className = "voice-agent-glow";
        voiceWaveContainer.classList.remove("active");

        if (state === "pulse") {
            voiceAgentIndicator.classList.add("pulse");
            voiceWaveContainer.classList.add("active");
        } else if (state === "success") {
            voiceAgentIndicator.classList.add("success");
        } else if (state === "decline") {
            voiceAgentIndicator.classList.add("decline");
        }
    }

    // Run Simulator Cycle
    async function runScenarioStep() {
        const scenario = SCENARIOS[currentScenarioId];
        if (!scenario || stepIndex >= scenario.steps.length) {
            // End of script, wait 4 seconds and restart
            setStatus("Standing by");
            updateVoiceState("idle");
            activeTimer = setTimeout(() => {
                startScenario(currentScenarioId);
            }, 4000);
            return;
        }

        const step = scenario.steps[stepIndex];
        
        if (step.type === "user") {
            updateVoiceState("idle");
            addBubble("user", step.text);
            
            stepIndex++;
            activeTimer = setTimeout(runScenarioStep, step.wait);
            
        } else if (step.type === "agent") {
            updateVoiceState(step.pulse ? "pulse" : "idle");
            addBubble("agent", step.text);
            
            stepIndex++;
            activeTimer = setTimeout(runScenarioStep, step.wait);
            
        } else if (step.type === "app") {
            // Switch app mock viewport markup
            appUiLayer.innerHTML = scenario.screens[step.state];
            
            stepIndex++;
            activeTimer = setTimeout(runScenarioStep, step.wait);
            
        } else if (step.type === "confirm") {
            updateVoiceState("idle");
            setStatus("Awaiting confirmation");
            
            // Pause simulation and show confirmation overlay
            showConfirmation(step.text, (approved) => {
                hideConfirmation();
                if (approved) {
                    setStatus("Action approved by user");
                    updateVoiceState("success");
                    // Advance to success step
                    stepIndex++;
                    runScenarioStep();
                } else {
                    // Action declined, cancel sequence
                    setStatus("Action declined by user", false);
                    updateVoiceState("decline");
                    addBubble("agent", "Action cancelled. Standing by.");
                    
                    // Clear rest of steps and transition to idle
                    stepIndex = scenario.steps.length; 
                    activeTimer = setTimeout(runScenarioStep, 3000);
                }
            });
            
        } else if (step.type === "agent-success") {
            updateVoiceState("pulse");
            addBubble("agent", step.text);
            
            // Switch to successful application finish screen
            if (step.state) {
                appUiLayer.innerHTML = scenario.screens[step.state];
            }
            
            stepIndex++;
            activeTimer = setTimeout(() => {
                updateVoiceState("success");
                runScenarioStep();
            }, step.wait);
        }
    }

    function startScenario(scenarioId) {
        // Clear existing states
        clearTimeout(activeTimer);
        hideConfirmation();
        
        currentScenarioId = scenarioId;
        stepIndex = 0;
        dialogScroll.innerHTML = "";
        appUiLayer.innerHTML = "";
        
        const scenario = SCENARIOS[scenarioId];
        setStatus(scenario.title);
        updateVoiceState("idle");
        
        runScenarioStep();
    }

    // Handle scenario navigation button clicks
    scenarioBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const scenario = btn.getAttribute("data-scenario");
            if (scenario === currentScenarioId && stepIndex > 0) return; // Ignore if already running
            
            scenarioBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            
            startScenario(scenario);
        });
    });

    // Handle Approve/Decline Button triggers in Smartphone Simulator
    btnApprove.addEventListener("click", () => {
        if (resolveConfirmation) resolveConfirmation(true);
    });

    btnDecline.addEventListener("click", () => {
        if (resolveConfirmation) resolveConfirmation(false);
    });

    // Clock display in status bar
    function updateClock() {
        const clock = document.getElementById("phone-clock");
        if (!clock) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        clock.textContent = `${hours}:${minutes} ${ampm}`;
    }
    
    setInterval(updateClock, 60000);
    updateClock();

    // Start default scenario
    startScenario("ride");
});
