const DEFAULT_PREDICTIONS = { delhi: 350, hyd: 85, chen: 110 };

let currentCity = 'delhi';
let currentView = 'general';
let predictions = null;

const cityNames = { delhi: "DELHI", hyd: "HYDERABAD", chen: "CHENNAI" };

document.addEventListener("DOMContentLoaded", () => {
    predictions = JSON.parse(localStorage.getItem("ai_predictions")) || DEFAULT_PREDICTIONS;

    // View/City Toggles
    const cityBtns = document.querySelectorAll(".city-btn");
    cityBtns.forEach(btn => btn.addEventListener("click", e => switchTab(cityBtns, e, 'city')));

    const viewBtns = document.querySelectorAll(".view-btn");
    viewBtns.forEach(btn => btn.addEventListener("click", e => switchTab(viewBtns, e, 'view')));

    setupAdmin();
    render();
});

function switchTab(btns, e, type) {
    btns.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    if (type === 'city') currentCity = e.target.dataset.city;
    if (type === 'view') currentView = e.target.dataset.view;
    render();
}

function render() {
    const pm = predictions[currentCity];
    
    // 1. Core Visuals Update
    document.getElementById("city-title").textContent = cityNames[currentCity];
    const pmMassive = document.getElementById("pm-massive");
    const fog = document.getElementById("fog-overlay");
    
    pmMassive.textContent = pm;
    
    // Severity Visual Logic
    pmMassive.className = 'pm-massive';
    fog.className = 'fog-overlay';

    if (pm > 200) {
        pmMassive.classList.add('critical');
        fog.classList.add('level-critical');
    } else if (pm > 100) {
        pmMassive.classList.add('elevated');
        fog.classList.add('level-high');
    }

    // 2. Context-Aware Rules Engine (PUBLIC vs EXEC)
    let alertsToRender = [];
    let studentStatus = "NOMINAL";
    let lungPatientStatus = "NOMINAL";
    let generalStatus = "NOMINAL";

    if (currentView === "general") {
        document.getElementById("alerts-title").textContent = "PUBLIC HEALTH ADVISORY";
        
        // Personas for Public
        if (pm >= 450) lungPatientStatus = "Medical emergency. Absolute isolation required.";
        else if (pm >= 350) lungPatientStatus = "Stay strictly indoors. Do not go out.";
        else if (pm >= 250) lungPatientStatus = "Avoid outdoor movement. Use purifiers.";
        else if (pm >= 120) lungPatientStatus = "Avoid prolonged exposure. Wear N95 mask.";
        else lungPatientStatus = "Clear for activity.";

        if (pm >= 350) studentStatus = "Schools closed. Keep children indoors.";
        else if (pm >= 200) studentStatus = "Restrict outdoor play. Go out only if important.";
        else studentStatus = "Operations normal.";

        // General Directives for Public
        if (pm >= 400) {
            generalStatus = "Severe Risk Active.";
            alertsToRender.push("SHOULD I GO OUT? No. Skip going out entirely.");
            alertsToRender.push("WEAR A MASK? Yes. N95 is mandatory.");
        } else if (pm >= 250) {
            generalStatus = "High Risk Active.";
            alertsToRender.push("SHOULD I GO OUT? Only if extremely important.");
            alertsToRender.push("WEAR A MASK? Yes. High quality mask required.");
        } else if (pm >= 120) {
            generalStatus = "Moderate Risk Active.";
            alertsToRender.push("SHOULD I GO OUT? Yes, but limit duration.");
            alertsToRender.push("WEAR A MASK? Recommended for sensitive groups.");
        } else {
            generalStatus = "Low Risk Active.";
            alertsToRender.push("SHOULD I GO OUT? Yes, conditions are safe.");
            alertsToRender.push("WEAR A MASK? Not required.");
        }
    } else {
        document.getElementById("alerts-title").textContent = "EXECUTIVE GRAP DIRECTIVES";
        
        // Personas for Authorities
        if (pm >= 450) lungPatientStatus = "CRITICAL: Issue Medical Emergency Broadcast.";
        else if (pm >= 350) lungPatientStatus = "Advise strict indoor isolation.";
        else if (pm >= 250) lungPatientStatus = "Advise avoiding outdoor movement.";
        else if (pm >= 120) lungPatientStatus = "Issue prolonged exposure warning.";
        else lungPatientStatus = "CLEAR";

        if (pm >= 350) {
            studentStatus = "POLICY: MANDATE SCHOOL CLOSURES/ONLINE.";
            alertsToRender.push("CLOSE SCHOOLS (Sustained > 24H)");
        } else {
            studentStatus = "POLICY: Normal operations.";
        }

        if (pm >= 400) alertsToRender.push("ODD-EVEN MANDATORY (Sustained 48H)");

        // City Specific Policy Directives
        if (currentCity === 'delhi') {
            if (pm >= 201 && pm <= 300) alertsToRender.push("Stage 1 GRAP: Dust control & emission checks.");
            else if (pm > 300 && pm <= 400) {
                alertsToRender.push("Stage 2 GRAP: Regulate DG Sets. Boost transport.");
                generalStatus = "Implement behavioral restrictions.";
            } else if (pm > 400 && pm <= 450) {
                alertsToRender.push("Stage 3 GRAP: CONSTRUCTION BAN. Restrict polluting vehicles.");
                generalStatus = "PARTIAL SHUTDOWN INITIATED.";
            } else if (pm > 450) {
                alertsToRender.push("Stage 4 GRAP: TRUCK BAN. 50% WFH MANDATE.");
                generalStatus = "EMERGENCY LOCKDOWN MEASURES.";
            }
        } else if (currentCity === 'chen') {
            if (pm >= 61 && pm <= 120) alertsToRender.push("Moderate-Poor: Enforce anti-burning. Road sweeping.");
            else if (pm > 120 && pm <= 250) {
                alertsToRender.push("Very Poor: Stop DG sets. Limit industrial emissions.");
                generalStatus = "Advisories Active.";
            } else if (pm > 250) {
                alertsToRender.push("SEVERE: Reduce coal power. Scale renewable energy.");
                generalStatus = "Aggressive dust control active.";
            }
        } else if (currentCity === 'hyd') {
            if (pm >= 150 && pm <= 250) alertsToRender.push("Stage 1 GRAP: Dust control, emission checks.");
            else if (pm > 250 && pm <= 350) alertsToRender.push("Stage 2 GRAP: Regulate DG sets, increase transport capacity.");
            else if (pm > 350 && pm <= 450) {
                alertsToRender.push("Stage 3 GRAP: Selective construction bans.");
                generalStatus = "Advisories Active.";
            } else if (pm > 450) {
                alertsToRender.push("Stage 4 GRAP: EMERGENCY ACTIONS INITIATED.");
                generalStatus = "Strict emergency restrictions applied.";
            }
        }
    }

    // Helper to determine color level
    function getStatusLevel(text) {
        const textLower = text.toLowerCase();
        const redKeywords = ["no.", "skip", "mandatory", "required", "close", "mandate", "ban", "shutdown", "emergency", "stop", "strictly", "critical", "severe"];
        if (redKeywords.some(kw => textLower.includes(kw))) return 'not-allowed';
        const greenKeywords = ["safe", "not required", "clear", "normal", "nominal"];
        if (greenKeywords.some(kw => textLower.includes(kw))) return 'allowed';
        return 'advisable';
    }

    // Render Personas Panel
    const list = document.getElementById("personas-list");
    list.innerHTML = "";
    
    const personasToRender = [
        { title: "SCHOOL STUDENT", status: studentStatus },
        { title: "RESPIRATORY RISK", status: lungPatientStatus },
        { title: "GENERAL PUBLIC", status: generalStatus !== "NOMINAL" ? generalStatus : "Nominal" }
    ];

    personasToRender.forEach(p => {
        const level = getStatusLevel(p.status);
        let colorClass = '';
        if (level === 'not-allowed') colorClass = 'highlight-not-allowed';
        else if (level === 'allowed') colorClass = 'highlight-allowed';
        else colorClass = 'highlight-advisable';
        
        list.innerHTML += `
            <li class="editorial-item">
                <h4 class="${colorClass}">${p.title}</h4>
                <p>${p.status}</p>
            </li>
        `;
    });

    // Render Alerts Panel
    const alertsBox = document.getElementById("alerts-list");
    alertsBox.innerHTML = "";

    if (alertsToRender.length === 0) {
        alertsBox.innerHTML = '<li class="editorial-item"><p class="highlight-allowed-bg">NO IMMEDIATE CONCERNS.</p></li>';
    } else {
        alertsToRender.forEach(alert => {
            const level = getStatusLevel(alert);
            let highlight = '';
            if (level === 'not-allowed') highlight = 'highlight-not-allowed-bg';
            else if (level === 'allowed') highlight = 'highlight-allowed-bg';
            else highlight = 'highlight-advisable-bg';
            
            alertsBox.innerHTML += `
                <li class="editorial-item">
                    <p class="${highlight}">${alert}</p>
                </li>
            `;
        });
    }
}

function setupAdmin() {
    const modal = document.getElementById("admin-modal");
    
    document.getElementById("open-admin-btn").onclick = () => {
        document.getElementById("input-delhi").value = predictions.delhi;
        document.getElementById("input-hyd").value = predictions.hyd;
        document.getElementById("input-chen").value = predictions.chen;
        modal.classList.add("visible");
    };

    document.getElementById("close-admin-btn").onclick = () => modal.classList.remove("visible");

    document.getElementById("save-data-btn").onclick = () => {
        const d = parseInt(document.getElementById("input-delhi").value);
        const h = parseInt(document.getElementById("input-hyd").value);
        const c = parseInt(document.getElementById("input-chen").value);

        if (isNaN(d) || isNaN(h) || isNaN(c)) return alert("INVALID DATA");
        
        predictions = { delhi: d, hyd: h, chen: c };
        localStorage.setItem("ai_predictions", JSON.stringify(predictions));
        modal.classList.remove("visible");
        render();
    };
}
