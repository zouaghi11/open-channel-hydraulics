// ==========================================================================
// HydroFlow - Main JavaScript File
// ==========================================================================

// Global variables
let energyChart = null;
let theoryChart = null;
let channelDiagram = null;
const g = 9.81; // Gravity constant
let calculationHistory = [];
let currentChartType = 'energy';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('HydroFlow initialized');
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Initialize charts
    initializeCharts();
    
    // Setup input listeners for real-time updates
    setupInputListeners();
    
    // Setup theory page navigation if on theory page
    if (document.querySelector('.theory-nav')) {
        setupTheoryNavigation();
        initializeTheoryChart();
    }
    
    // Run initial calculation
    setTimeout(() => {
        if (document.getElementById('Q')) {
            computeResults();
        }
    }, 500);
    
    // Add CSS for cursor animation
    addCursorAnimation();
});

// ==========================================================================
// THEME MANAGEMENT
// ==========================================================================

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('hydroflow-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('hydroflow-theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
    
    // Update charts for new theme
    updateChartsForTheme();
}

function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function updateChartsForTheme() {
    if (energyChart) {
        energyChart.update();
    }
    if (theoryChart) {
        theoryChart.update();
    }
    if (channelDiagram) {
        updateChannelDiagram();
    }
}

// ==========================================================================
// CHART INITIALIZATION
// ==========================================================================

function initializeCharts() {
    // Initialize energy chart
    const energyCtx = document.getElementById('energyChart');
    if (energyCtx) {
        const ctx = energyCtx.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        
        energyChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Specific Energy',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(),
                            font: {
                                size: 14,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-card').trim(),
                        titleColor: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(),
                        bodyColor: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
                        borderColor: getComputedStyle(document.body).getPropertyValue('--border-color').trim(),
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Depth y (m)',
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(),
                            font: {
                                size: 14,
                                family: 'Inter',
                                weight: '500'
                            }
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Energy E (m)',
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(),
                            font: {
                                size: 14,
                                family: 'Inter',
                                weight: '500'
                            }
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    // Initialize channel diagram
    const channelCtx = document.getElementById('channelDiagram');
    if (channelCtx) {
        channelDiagram = new Chart(channelCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Upstream', 'Jump', 'Downstream'],
                datasets: [{
                    label: 'Depth (m)',
                    data: [0.2, 0, 0],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(239, 68, 68)',
                        'rgb(16, 185, 129)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Hydraulic Jump Depth Comparison',
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(),
                        font: {
                            size: 14,
                            family: 'Inter'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Depth (m)',
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim()
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                        }
                    },
                    x: {
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color').trim()
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                        }
                    }
                }
            }
        });
    }
}

function initializeTheoryChart() {
    const theoryCtx = document.getElementById('theoryChart');
    if (!theoryCtx) return;
    
    const ctx = theoryCtx.getContext('2d');
    
    // Generate example data for theory chart
    const yValues = [];
    const EValues = [];
    const Q = 2.0;
    const b = 1.5;
    
    for (let y = 0.01; y <= 2; y += 0.02) {
        yValues.push(y);
        const A = b * y;
        const E = y + Math.pow(Q, 2) / (2 * g * Math.pow(A, 2));
        EValues.push(E);
    }
    
    // Find critical depth for this Q
    const yc = Math.cbrt(Math.pow(Q, 2) / (g * Math.pow(b, 2)));
    const Ac = b * yc;
    const Ec = yc + Math.pow(Q, 2) / (2 * g * Math.pow(Ac, 2));
    
    theoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: yValues,
            datasets: [{
                label: 'Specific Energy Curve',
                data: EValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }, {
                label: 'Critical Point',
                data: Array(yValues.length).fill(null),
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 8,
                pointStyle: 'circle',
                showLine: false,
                data: [{
                    x: yc,
                    y: Ec
                }]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                annotation: {
                    annotations: {
                        criticalLine: {
                            type: 'line',
                            xMin: yc,
                            xMax: yc,
                            borderColor: '#f59e0b',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: `Critical Depth (y_c = ${yc.toFixed(3)} m)`,
                                position: 'end',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Depth y (m)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Specific Energy E (m)'
                    }
                }
            }
        }
    });
}

// ==========================================================================
// INPUT MANAGEMENT
// ==========================================================================

function setupInputListeners() {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('input', function() {
            validateInput(this);
            // Debounced calculation
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (document.getElementById('Q')) {
                    computeResults();
                }
            }, 500);
        });
        
        // Immediate calculation on change
        input.addEventListener('change', function() {
            if (document.getElementById('Q')) {
                computeResults();
            }
        });
    });
}

function validateInput(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;
    
    if (isNaN(value) || value < min || value > max) {
        input.classList.add('error');
        showNotification(`Invalid value for ${input.previousElementSibling?.textContent || 'input'}. Must be between ${min} and ${max}`, 'error');
        return false;
    }
    
    input.classList.remove('error');
    return true;
}

function resetInputs() {
    const defaultValues = {
        'Q': '2.0',
        'b': '1.5',
        'S0': '0.001',
        'n': '0.025',
        'y1': '0.2'
    };
    
    Object.keys(defaultValues).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = defaultValues[id];
            input.classList.remove('error');
        }
    });
    
    computeResults();
    showNotification('Inputs reset to default values', 'info');
}

// ==========================================================================
// HYDRAULIC CALCULATIONS
// ==========================================================================

// Geometry functions
function area(y, b) {
    return b * y;
}

function wettedPerimeter(y, b) {
    return b + 2 * y;
}

function hydraulicRadius(y, b) {
    const A = area(y, b);
    const P = wettedPerimeter(y, b);
    return A / P;
}

function manningDischarge(y, n, S, b) {
    const A = area(y, b);
    const R = hydraulicRadius(y, b);
    return (1 / n) * A * Math.pow(R, 2/3) * Math.sqrt(S);
}

// Normal depth calculation using bisection method
function normalDepth(Q, n, S, b) {
    let low = 0.001;
    let high = 100;
    const tolerance = 0.0001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
        const y = (low + high) / 2;
        const Qcalc = manningDischarge(y, n, S, b);
        
        if (Math.abs(Qcalc - Q) < tolerance) {
            return y;
        }
        
        if (Qcalc > Q) {
            high = y;
        } else {
            low = y;
        }
    }
    
    return (low + high) / 2;
}

function criticalDepth(Q, b) {
    return Math.cbrt(Math.pow(Q, 2) / (g * Math.pow(b, 2)));
}

function velocity(Q, y, b) {
    return Q / area(y, b);
}

function froudeNumber(V, y) {
    return V / Math.sqrt(g * y);
}

function sequentDepth(y1, Fr1) {
    return 0.5 * y1 * (Math.sqrt(1 + 8 * Math.pow(Fr1, 2)) - 1);
}

function specificEnergy(y, Q, b) {
    const A = area(y, b);
    return y + Math.pow(Q, 2) / (2 * g * Math.pow(A, 2));
}

function energyLoss(y1, y2) {
    return Math.pow(y2 - y1, 3) / (4 * y1 * y2);
}

// ==========================================================================
// MAIN COMPUTATION FUNCTION
// ==========================================================================

function computeResults() {
    try {
        // Get input values
        const Q = parseFloat(document.getElementById('Q').value);
        const b = parseFloat(document.getElementById('b').value);
        const S0 = parseFloat(document.getElementById('S0').value);
        const n = parseFloat(document.getElementById('n').value);
        const y1 = parseFloat(document.getElementById('y1').value);
        
        // Validate all inputs
        const inputs = [
            {id: 'Q', value: Q, name: 'Discharge'},
            {id: 'b', value: b, name: 'Channel width'},
            {id: 'S0', value: S0, name: 'Slope'},
            {id: 'n', value: n, name: "Manning's n"},
            {id: 'y1', value: y1, name: 'Upstream depth'}
        ];
        
        for (const input of inputs) {
            if (isNaN(input.value) || input.value <= 0) {
                throw new Error(`${input.name} must be a positive number`);
            }
        }
        
        // Perform calculations
        const yn = normalDepth(Q, n, S0, b);
        const yc = criticalDepth(Q, b);
        const Vn = velocity(Q, yn, b);
        const Frn = froudeNumber(Vn, yn);
        const V1 = velocity(Q, y1, b);
        const Fr1 = froudeNumber(V1, y1);
        const y2 = sequentDepth(y1, Fr1);
        const dE = energyLoss(y1, y2);
        const En = specificEnergy(yn, Q, b);
        const Ec = specificEnergy(yc, Q, b);
        const E1 = specificEnergy(y1, Q, b);
        const E2 = specificEnergy(y2, Q, b);
        
        // Determine flow regime
        let regime, statusClass, statusText;
        if (Frn < 0.9) {
            regime = 'Subcritical';
            statusClass = 'success';
            statusText = 'Tranquil Flow';
        } else if (Frn > 1.1) {
            regime = 'Supercritical';
            statusClass = 'warning';
            statusText = 'Rapid Flow';
        } else {
            regime = 'Critical';
            statusClass = 'error';
            statusText = 'Critical Flow';
        }
        
        // Update quick results
        updateQuickResults(yc, yn, Frn);
        
        // Update detailed results
        updateDetailedResults({
            Q, b, S0, n, y1,
            yn, yc, Vn, Frn, regime,
            V1, Fr1, y2, dE,
            En, Ec, E1, E2
        });
        
        // Update status badge
        const statusBadge = document.getElementById('flowStatus');
        if (statusBadge) {
            statusBadge.textContent = statusText;
            statusBadge.className = `status-badge ${statusClass}`;
        }
        
        // Update energy chart
        updateEnergyChartData(Q, b, yn, yc, y1, y2);
        
        // Update channel diagram
        updateChannelDiagram(y1, y2);
        
        // Update step-by-step calculations
        updateStepByStep({
            yn, yc, Vn, Frn, regime,
            Fr1, y2, dE
        });
        
        // Add to history
        addToHistory({
            Q, b, S0, n, y1,
            yn, yc, Frn, regime,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Show success notification
        showNotification('Calculation completed successfully', 'success');
        
    } catch (error) {
        console.error('Calculation error:', error);
        showNotification(error.message, 'error');
        
        // Update output with error
        const outputEl = document.getElementById('output');
        if (outputEl) {
            outputEl.textContent = `Error: ${error.message}\n\nPlease check your input values and try again.`;
            outputEl.classList.add('error');
        }
    }
}

function updateQuickResults(yc, yn, Fr) {
    const quickYc = document.getElementById('quickYc');
    const quickYn = document.getElementById('quickYn');
    const quickFr = document.getElementById('quickFr');
    
    if (quickYc) quickYc.textContent = `${yc.toFixed(3)} m`;
    if (quickYn) quickYn.textContent = `${yn.toFixed(3)} m`;
    if (quickFr) quickFr.textContent = Fr.toFixed(3);
}

function updateDetailedResults(results) {
    const outputEl = document.getElementById('output');
    if (!outputEl) return;
    
    const text = `═══════════════════════════════════════════
      OPEN CHANNEL HYDRAULICS ANALYSIS
═══════════════════════════════════════════

INPUT PARAMETERS:
• Discharge (Q)      = ${results.Q} m³/s
• Channel width (b)  = ${results.b} m
• Bed slope (S₀)     = ${results.S0}
• Manning's n        = ${results.n}
• Upstream depth (y₁)= ${results.y1} m

NORMAL FLOW ANALYSIS:
• Normal depth (yₙ)  = ${results.yn.toFixed(4)} m
• Critical depth (y_c)= ${results.yc.toFixed(4)} m
• Velocity (Vₙ)      = ${results.Vn.toFixed(3)} m/s
• Froude number (Frₙ)= ${results.Frn.toFixed(3)}
• Flow regime        = ${results.regime}

HYDRAULIC JUMP ANALYSIS:
• Upstream Fr₁       = ${results.Fr1.toFixed(3)}
• Sequent depth (y₂) = ${results.y2.toFixed(4)} m
• Energy loss (ΔE)   = ${results.dE.toFixed(4)} m
• Jump efficiency    = ${((results.dE / results.E1) * 100).toFixed(1)}%

SPECIFIC ENERGY:
• E(yₙ)              = ${results.En.toFixed(4)} m
• E(y_c)             = ${results.Ec.toFixed(4)} m
• E(y₁)              = ${results.E1.toFixed(4)} m
• E(y₂)              = ${results.E2.toFixed(4)} m

═══════════════════════════════════════════
     ANALYSIS COMPLETED SUCCESSFULLY
═══════════════════════════════════════════`;
    
    // Typewriter effect
    typewriterEffect(outputEl, text);
    
    // Update detailed results container
    const detailedEl = document.getElementById('detailedResults');
    if (detailedEl) {
        detailedEl.innerHTML = `
            <div class="result-card">
                <h4>Normal Depth</h4>
                <div class="result-value">${results.yn.toFixed(3)} m</div>
                <p>Depth for uniform flow</p>
            </div>
            <div class="result-card">
                <h4>Critical Depth</h4>
                <div class="result-value">${results.yc.toFixed(3)} m</div>
                <p>Depth at minimum energy</p>
            </div>
            <div class="result-card">
                <h4>Froude Number</h4>
                <div class="result-value">${results.Frn.toFixed(3)}</div>
                <p>${results.regime} flow</p>
            </div>
            <div class="result-card">
                <h4>Sequent Depth</h4>
                <div class="result-value">${results.y2.toFixed(3)} m</div>
                <p>Depth after jump</p>
            </div>
        `;
    }
}

function updateEnergyChartData(Q, b, yn, yc, y1, y2) {
    if (!energyChart) return;
    
    // Generate data for specific energy curve
    const yValues = [];
    const EValues = [];
    const maxY = Math.max(yc * 3, yn * 2, y1 * 2, y2 * 2, 1);
    
    for (let y = 0.01; y <= maxY; y += maxY / 100) {
        yValues.push(y.toFixed(3));
        EValues.push(specificEnergy(y, Q, b));
    }
    
    // Update chart data
    energyChart.data.labels = yValues;
    energyChart.data.datasets[0].data = EValues;
    
    // Add annotations for special points
    energyChart.options.plugins.annotation = {
        annotations: {
            normalDepth: {
                type: 'point',
                xValue: yn,
                yValue: specificEnergy(yn, Q, b),
                backgroundColor: '#10b981',
                borderColor: '#ffffff',
                borderWidth: 2,
                radius: 6,
                label: {
                    display: true,
                    content: `y_n = ${yn.toFixed(3)} m`,
                    position: 'end',
                    backgroundColor: '#10b981',
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            criticalDepth: {
                type: 'point',
                xValue: yc,
                yValue: specificEnergy(yc, Q, b),
                backgroundColor: '#ef4444',
                borderColor: '#ffffff',
                borderWidth: 2,
                radius: 6,
                label: {
                    display: true,
                    content: `y_c = ${yc.toFixed(3)} m`,
                    position: 'end',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            upstreamDepth: {
                type: 'point',
                xValue: y1,
                yValue: specificEnergy(y1, Q, b),
                backgroundColor: '#3b82f6',
                borderColor: '#ffffff',
                borderWidth: 2,
                radius: 6,
                label: {
                    display: true,
                    content: `y₁ = ${y1.toFixed(3)} m`,
                    position: 'start',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            sequentDepth: {
                type: 'point',
                xValue: y2,
                yValue: specificEnergy(y2, Q, b),
                backgroundColor: '#8b5cf6',
                borderColor: '#ffffff',
                borderWidth: 2,
                radius: 6,
                label: {
                    display: true,
                    content: `y₂ = ${y2.toFixed(3)} m`,
                    position: 'start',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            }
        }
    };
    
    energyChart.update();
}

function updateChannelDiagram(y1 = 0.2, y2 = 0) {
    if (!channelDiagram) return;
    
    if (y2 === 0) {
        y2 = y1 * 3; // Default visualization
    }
    
    const jumpHeight = (y1 + y2) / 2;
    
    channelDiagram.data.datasets[0].data = [y1, jumpHeight, y2];
    channelDiagram.update();
}

function updateStepByStep(results) {
    const stepEl = document.getElementById('stepResults');
    if (!stepEl) return;
    
    stepEl.innerHTML = `
        <li><strong>Step 1:</strong> Calculated normal depth using Manning's equation: yₙ = ${results.yn.toFixed(3)} m</li>
        <li><strong>Step 2:</strong> Found critical depth: y_c = ${results.yc.toFixed(3)} m</li>
        <li><strong>Step 3:</strong> Determined flow regime: Fr = ${results.Frn.toFixed(3)} (${results.regime})</li>
        <li><strong>Step 4:</strong> Analyzed hydraulic jump using Belanger's equation</li>
        <li><strong>Step 5:</strong> Calculated sequent depth: y₂ = ${results.y2.toFixed(3)} m</li>
        <li><strong>Step 6:</strong> Computed energy loss: ΔE = ${results.dE.toFixed(4)} m</li>
        <li><strong>Step 7:</strong> ${results.Fr1 > 1 ? 'Hydraulic jump WILL occur (Fr₁ > 1)' : 'Hydraulic jump will NOT occur (Fr₁ ≤ 1)'}</li>
    `;
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

function typewriterEffect(element, text) {
    element.textContent = '';
    element.classList.remove('error');
    
    let i = 0;
    const speed = 10; // milliseconds per character
    
    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            
            // Add cursor effect
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '█';
            element.appendChild(cursor);
            
            // Remove cursor before adding next character
            setTimeout(() => {
                if (cursor.parentNode === element) {
                    element.removeChild(cursor);
                }
            }, speed - 5);
            
            setTimeout(typeWriter, speed);
        }
    }
    
    typeWriter();
}

function addCursorAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        .cursor {
            animation: blink 1s infinite;
            color: var(--primary-color);
            font-weight: bold;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                max-width: 350px;
                box-shadow: var(--shadow-lg);
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }
            .notification.success { background: var(--success-color); }
            .notification.error { background: var(--danger-color); }
            .notification.info { background: var(--info-color); }
            .notification.warning { background: var(--warning-color); }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function addToHistory(calculation) {
    calculationHistory.unshift(calculation);
    
    // Keep only last 20 calculations
    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }
    
    // Update history display if exists
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyEl = document.getElementById('historyList');
    if (!historyEl) return;
    
    let html = '';
    calculationHistory.forEach((calc, index) => {
        html += `
            <div class="history-item" onclick="loadFromHistory(${index})">
                <div class="history-time">${calc.timestamp}</div>
                <div class="history-data">
                    <div>Q = ${calc.Q} m³/s</div>
                    <div>yₙ = ${calc.yn.toFixed(3)} m | Fr = ${calc.Frn.toFixed(3)}</div>
                </div>
            </div>
        `;
    });
    
    historyEl.innerHTML = html;
}

function loadFromHistory(index) {
    const calc = calculationHistory[index];
    if (!calc) return;
    
    document.getElementById('Q').value = calc.Q;
    document.getElementById('b').value = calc.b;
    document.getElementById('S0').value = calc.S0;
    document.getElementById('n').value = calc.n;
    document.getElementById('y1').value = calc.y1;
    
    computeResults();
    showNotification('Loaded from history', 'info');
}

function exportResults() {
    const inputs = {
        Q: document.getElementById('Q').value,
        b: document.getElementById('b').value,
        S0: document.getElementById('S0').value,
        n: document.getElementById('n').value,
        y1: document.getElementById('y1').value
    };
    
    const data = {
        title: 'HydroFlow Analysis Results',
        timestamp: new Date().toISOString(),
        version: '2.0',
        inputs: inputs,
        history: calculationHistory
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydroflow-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Results exported successfully', 'success');
}

function toggleChartType() {
    if (!energyChart) return;
    
    currentChartType = currentChartType === 'energy' ? 'rating' : 'energy';
    
    if (currentChartType === 'rating') {
        // Switch to rating curve
        const Q = parseFloat(document.getElementById('Q').value);
        const b = parseFloat(document.getElementById('b').value);
        const S0 = parseFloat(document.getElementById('S0').value);
        const n = parseFloat(document.getElementById('n').value);
        
        // Generate rating curve data
        const yValues = [];
        const QValues = [];
        
        for (let y = 0.01; y <= 2; y += 0.02) {
            yValues.push(y.toFixed(3));
            const A = b * y;
            const R = hydraulicRadius(y, b);
            const Qcalc = (1 / n) * A * Math.pow(R, 2/3) * Math.sqrt(S0);
            QValues.push(Qcalc);
        }
        
        energyChart.data.labels = yValues;
        energyChart.data.datasets[0].data = QValues;
        energyChart.data.datasets[0].label = 'Rating Curve Q(y)';
        energyChart.options.scales.x.title.text = 'Depth y (m)';
        energyChart.options.scales.y.title.text = 'Discharge Q (m³/s)';
        
        showNotification('Switched to Rating Curve view', 'info');
    } else {
        // Switch back to energy diagram
        computeResults();
        showNotification('Switched to Energy Diagram view', 'info');
    }
    
    energyChart.update();
}

function downloadChart() {
    if (!energyChart) return;
    
    const link = document.createElement('a');
    link.download = `hydroflow-chart-${new Date().getTime()}.png`;
    link.href = energyChart.toBase64Image();
    link.click();
    
    showNotification('Chart downloaded successfully', 'success');
}

function showHelp() {
    const helpText = `
HydroFlow - Open Channel Hydraulics Calculator

INSTRUCTIONS:
1. Enter all input parameters in the left panel
2. Click "Calculate" or press Enter to run analysis
3. View results in the main panel
4. Check the energy diagram for visualization
5. Use "Export" to save your results

PARAMETER RANGES:
• Discharge (Q): 0.1 - 100 m³/s
• Channel width (b): 0.1 - 50 m
• Slope (S₀): 0.0001 - 0.1
• Manning's n: 0.01 - 0.1
• Upstream depth (y₁): 0.01 - 10 m

TIPS:
• For natural streams, use n = 0.03-0.05
• Critical depth marks minimum energy
• Hydraulic jump occurs when Fr₁ > 1
• Subcritical flow: Fr < 1
• Supercritical flow: Fr > 1

Press F1 for more help or visit the Theory page.
    `;
    
    alert(helpText);
}

function showAbout() {
    const aboutText = `
HydroFlow v2.0
Open Channel Hydraulics Calculator

FEATURES:
• Normal depth calculation (Manning's equation)
• Critical depth analysis
• Hydraulic jump calculations
• Specific energy diagrams
• Real-time visualization
• Export functionality

DEVELOPED FOR:
• Civil engineering students
• Hydraulic engineers
• Water resources professionals
• Educational purposes

EQUATIONS IMPLEMENTED:
• Manning's uniform flow equation
• Critical flow condition
• Belanger's hydraulic jump equation
• Specific energy concept

This tool is for educational and preliminary design purposes.
Always verify results with professional engineering software.

© 2024 HydroFlow Team
    `;
    
    alert(aboutText);
}

// ==========================================================================
// THEORY PAGE FUNCTIONS
// ==========================================================================

function setupTheoryNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.theory-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section ID
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    });
    
    // Handle URL hash on page load
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetSection = document.getElementById(hash);
        const targetNav = document.querySelector(`.nav-item[href="#${hash}"]`);
        
        if (targetSection && targetNav) {
            sections.forEach(s => s.classList.remove('active'));
            navItems.forEach(n => n.classList.remove('active'));
            
            targetSection.classList.add('active');
            targetNav.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function toggleAllSections() {
    const sections = document.querySelectorAll('.theory-section');
    const isExpanding = !sections[0].classList.contains('active');
    
    sections.forEach(section => {
        if (isExpanding) {
            section.classList.add('active');
        }
    });
    
    // Update all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (isExpanding) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    showNotification(isExpanding ? 'All sections expanded' : 'Sections collapsed', 'info');
}

function calculateExample() {
    // This function would handle the example calculation in theory page
    // For now, show a notification
    showNotification('Example calculation would run here', 'info');
}

function checkAnswer(problemNumber) {
    const answers = {
        1: "y_n ≈ 1.45 m",
        2: "y_2 ≈ 1.53 m",
        3: "y_c ≈ 0.94 m"
    };
    
    const answerDiv = document.getElementById(`answer${problemNumber}`);
    if (answerDiv) {
        answerDiv.textContent = `Answer: ${answers[problemNumber]}`;
        answerDiv.classList.add('show');
    }
}

function downloadTheory() {
    showNotification('PDF export feature would generate a downloadable theory document', 'info');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// KEYBOARD SHORTCUTS
// ==========================================================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (document.getElementById('Q')) {
            computeResults();
        }
    }
    
    // F1 for help
    if (e.key === 'F1') {
        e.preventDefault();
        showHelp();
    }
    
    // Esc to clear notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notif => notif.remove());
    }
});

// ==========================================================================
// WINDOW RESIZE HANDLING
// ==========================================================================

window.addEventListener('resize', function() {
    // Debounce resize events
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        if (energyChart) {
            energyChart.resize();
        }
        if (theoryChart) {
            theoryChart.resize();
        }
        if (channelDiagram) {
            channelDiagram.resize();
        }
    }, 250);
});

// ==========================================================================
// SERVICE WORKER FOR OFFLINE SUPPORT (Optional)
// ==========================================================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').catch(function(error) {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// ==========================================================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ==========================================================================

// Make functions available globally
window.computeResults = computeResults;
window.resetInputs = resetInputs;
window.exportResults = exportResults;
window.toggleChartType = toggleChartType;
window.downloadChart = downloadChart;
window.showHelp = showHelp;
window.showAbout = showAbout;
window.toggleTheme = toggleTheme;
window.calculateExample = calculateExample;
window.checkAnswer = checkAnswer;
window.downloadTheory = downloadTheory;
window.scrollToTop = scrollToTop;
window.toggleAllSections = toggleAllSections;
