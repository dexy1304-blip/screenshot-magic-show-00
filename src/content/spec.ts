// All copy here is taken from ReFoodX_Project_Specification.pdf v1.0.
// Section numbers in comments trace back to the PDF (see content-inventory.md).

export const team = {
  members: [
    { name: "Krishna Pandey", roll: "B-67" },
    { name: "Bhoomi Bhojane", roll: "A-14" },
    { name: "Pawar Sahil Sachin", roll: "B-75" },
  ],
  guide: "Prof. Deveshree Wankhede",
  college: "Shivajirao S Jondhale College of Engineering",
  dept: "Department of Computer Engineering",
  year: "2026-27",
};

// 1.1
export const actions = [
  {
    key: "DONATE",
    meaning: "Fit for human consumption and can reach a recipient in time. Direct donor-to-NGO handover.",
    situation: "Fresh or safely stored food, moderate quantity, an NGO is reachable well within the safe window.",
    destination: "NGO, charity or community kitchen",
  },
  {
    key: "REDISTRIBUTE",
    meaning:
      "Fit for human consumption but needs routing beyond a single nearby NGO: splitting across several NGOs, sending to a food bank or hub, or a longer route.",
    situation: "Large quantity, little capacity at nearby NGOs, or moderate time pressure.",
    destination: "Multiple NGOs, food bank, community fridge, logistics hub",
  },
  {
    key: "UPCYCLE",
    meaning:
      "Not suitable for human consumption (or the safe window is too short to reach anyone) but still has value as animal feed, compost, biogas or similar.",
    situation: "Past safe window, spoilage risk high, plate leftovers, peels and scraps.",
    destination: "Compost unit, farm or animal feed, biogas plant",
  },
] as const;

// 2.1
export const problem = [
  "Large quantities of surplus food from restaurants, hotels, events and households are wasted despite demand from NGOs and underprivileged communities.",
  "Existing platforms mostly use location-based or rule-based matching to connect donors with NGOs.",
  "ML-based systems usually depend on a single algorithm that may not give the best performance for different food conditions.",
  "An intelligent system is needed that compares multiple ML algorithms, identifies the most suitable one for deciding the action for surplus food, and selects NGOs using distance, quantity, expiry time and urgency.",
];

// A.2
export const existingSystems = [
  { name: "Food donation and redistribution platforms", tech: "Connect donors with NGOs; web or mobile app, GPS, notifications", limit: "Basic donor-NGO matching only" },
  { name: "Location-based food redistribution systems", tech: "Find nearby NGOs; GPS and location services", limit: "Location-based; does not choose the best food action" },
  { name: "FoodSavior", tech: "Decides NGO vs manure producers; IoT sensors, decision tree, mobile app", limit: "One specific ML approach, no multi-model comparison" },
  { name: "FoodShare Hub", tech: "AI freshness prediction, intelligent matching, route optimisation", limit: "Focus on freshness and routing, not comparative ML evaluation" },
  { name: "Food Linker", tech: "Deep learning image recognition, expiry prediction, donation tracking", limit: "Focus on freshness and spoilage detection, not best redistribution action" },
];

// A.3
export const limitations = [
  "Single ML algorithm; no model comparison or optimisation.",
  "Limited decision-making: donate or distribute only, not predicting donate vs redistribute vs upcycle.",
  "Basic NGO matching: mostly location, ignoring quantity, urgency and expiry.",
  "No comparative evaluation with Accuracy, Precision, Recall, F1 and ROC-AUC.",
  "Freshness and expiry not consistently included in decisions.",
  "Limited NGO personalisation; suitability for a specific donation not evaluated deeply.",
  "Scalability concerns for rule-based approaches as donors, NGOs and donations grow.",
];

// 2.3
export const positioning =
  "(1) a three-way action decision (donate / redistribute / upcycle) chosen through a transparent comparative evaluation of five classifiers rather than a fixed algorithm, combined with (2) a multi-factor, fairness-aware NGO matching engine that respects time-to-expiry and NGO capacity as hard constraints, and (3) a feedback loop in which NGO quality feedback produces real labels for retraining.";

// 6.2
export const workflow = [
  { step: "Donor adds food details", body: "Donor submits listing (FR-04). Validation (FR-05). Urgency derived from time-to-expiry unless overridden.", mode: "Online" },
  { step: "ML predicts action", body: "The deployed model returns action, probabilities and reasons (FR-06). Low confidence uses the fallback (FR-10).", mode: "Online" },
  { step: "Evaluate ML models", body: "Naive Bayes, Decision Tree, Random Forest, Logistic Regression and XGBoost train on the same split (Section 9).", mode: "Offline" },
  { step: "Assess model metrics", body: "Accuracy, Precision, Recall, F1 and ROC-AUC are computed and stored; a report is generated (FR-08).", mode: "Offline" },
  { step: "Find nearby NGOs", body: "The matching engine filters and ranks partners, offers to rank 1, and cascades on reject or timeout (FR-11 to FR-13).", mode: "Online" },
  { step: "Deploy top algorithm", body: "The selection rule picks the winner; the registry stores it as the active version; the API loads it (FR-09).", mode: "Offline" },
];

// 6.3
export const lifecycle = ["CREATED", "PREDICTED", "MATCHING", "OFFERED", "ACCEPTED", "PICKED_UP", "DELIVERED"];

// 4
export const roles = [
  { role: "Donor", who: "Restaurant, hotel, caterer, event organiser, household", goals: "List surplus quickly, know what to do with it, get it picked up, see impact" },
  { role: "NGO / Partner", who: "NGO, shelter, community kitchen, food bank; also upcycle partners (compost, animal feed, biogas)", goals: "Receive relevant, timely offers within capacity; accept or reject fast; confirm pickup; give feedback" },
  { role: "Admin", who: "Platform operator (the team or guide in the demo)", goals: "Verify NGOs, monitor system health and models, retrain, view analytics, resolve disputes" },
];

export const stories = [
  ["US1", "As a donor I enter food type, quantity, preparation time, expiry and pickup location so that the system tells me whether to donate, redistribute or upcycle."],
  ["US2", "As a donor I see which NGO was matched, why, and the ETA, so that I trust the decision."],
  ["US3", "As an NGO I set my location, capacity, accepted food types and hours so that I only receive suitable offers."],
  ["US4", "As an NGO I get an offer with food details, distance and time left, and accept or reject with one tap."],
  ["US5", "If an NGO rejects or does not respond in time, the system automatically tries the next best NGO."],
  ["US6", "As a donor or NGO I confirm handover so that the donation is recorded as delivered."],
  ["US7", "As an NGO I rate food quality after pickup so that the system gets real labels for retraining."],
  ["US8", "As an admin I verify NGOs, view model comparison and metrics, trigger retraining and promote or roll back a model version."],
  ["US9", "As any user I see an impact dashboard (kg saved, meals, estimated emissions avoided, action split)."],
] as const;

// 5
export type Priority = "M" | "S" | "C";
export const frs: { id: string; text: string; p: Priority }[] = [
  { id: "FR-01", p: "M", text: "Register and log in with role (donor, ngo, admin). Passwords hashed. JWT access tokens. Role-based access control on every endpoint." },
  { id: "FR-02", p: "M", text: "NGO profile: name, partner_type (NGO, FOOD_BANK, COMPOSTER, ANIMAL_FEED, BIOGAS), latitude, longitude, address, daily capacity (kg), current free capacity, accepted food categories, veg-only flag, operating hours, has_vehicle flag, contact." },
  { id: "FR-03", p: "M", text: "Admin verifies or suspends NGOs. Unverified NGOs are never matched." },
  { id: "FR-04", p: "M", text: "Donor creates a donation: category, item name, veg/non-veg, quantity and unit, prepared_at, expiry or best-before, packaging, storage condition, pickup location (map pin or GPS), optional photo, urgency (auto-derived and overridable)." },
  { id: "FR-05", p: "M", text: "Input validation: quantity greater than 0, expiry after now, coordinates valid, category from controlled list. Clear error messages." },
  { id: "FR-06", p: "M", text: "Predict action (DONATE, REDISTRIBUTE, UPCYCLE) with class probabilities, confidence, model version and top contributing features." },
  { id: "FR-07", p: "M", text: "Training pipeline runnable by CLI (python -m ml.train) and by admin button. Deterministic with fixed seeds." },
  { id: "FR-08", p: "M", text: "Comparison report for all 5 models: Accuracy, Precision, Recall, F1 (macro and weighted), ROC-AUC (one-vs-rest macro), per-class metrics, confusion matrices, ROC curves, training time, inference latency, mean and std over repeated runs. Output as CSV, JSON and PNG, shown in admin UI." },
  { id: "FR-09", p: "M", text: "Automatic best-model selection by the rule in Section 9.6. Versioned model registry. Admin can promote or roll back." },
  { id: "FR-10", p: "S", text: "Safety net: if confidence below threshold (default 0.50) or model unavailable, use rule-based fallback and flag the listing as 'low confidence'." },
  { id: "FR-11", p: "M", text: "NGO matching: top-k (default 5) ranked partners with per-factor score breakdown for DONATE and REDISTRIBUTE; upcycle partners for UPCYCLE." },
  { id: "FR-12", p: "M", text: "Hard filters before scoring: verified, accepts category, veg rule, within max radius, open at ETA, free capacity above minimum, reachable before expiry." },
  { id: "FR-13", p: "M", text: "Send offer to rank-1 partner with response deadline (default 15 min, configurable). On reject or timeout, cascade to next. Split large quantities across partners." },
  { id: "FR-14", p: "M", text: "Donation status lifecycle (Section 6.3) with timestamps for every transition." },
  { id: "FR-15", p: "S", text: "In-app notifications for all parties; optional email or SMS via a pluggable adapter (console adapter by default)." },
  { id: "FR-16", p: "S", text: "Map view with donor, matched partner and route. ETA from Haversine plus average speed, or OSRM if configured." },
  { id: "FR-17", p: "C", text: "Handover confirmation with 4-digit pickup code shown to donor and entered by NGO." },
  { id: "FR-18", p: "S", text: "Impact dashboard: kg diverted, meals equivalent, estimated emissions avoided, action split, average time to match. Conversion constants are configurable and cited." },
  { id: "FR-19", p: "S", text: "Admin dashboard: users, donations, match success rate, model metrics, data drift indicators, retraining history." },
  { id: "FR-20", p: "S", text: "NGO quality feedback after pickup (rating, was-it-edible, comment). Stored as real labelled data for retraining." },
  { id: "FR-21", p: "C", text: "Audit log of key actions (create, predict, match, accept, reject, status change, model promotion)." },
  { id: "FR-22", p: "S", text: "Demo mode: one command seeds NGOs, donors and sample listings in a chosen city, and simulates a time-lapse." },
];

// 13
export const nfrs = [
  ["Performance", "Prediction plus matching for up to 500 partners returns in under 2 seconds on a laptop (target). Model inference under 50 ms."],
  ["Reproducibility", "Fixed seeds, pinned dependencies, dataset hash stored in the registry, one command reproduces the comparison report."],
  ["Security", "Hashed passwords, JWT expiry, role checks on every route, input validation, rate limiting on auth, no secrets in the repository, CORS configured."],
  ["Privacy", "Store only needed personal data (contact details are visible to the counterpart only after an offer is accepted). Provide delete-account."],
  ["Reliability", "Idempotent offer and accept endpoints, database transactions on capacity updates, scheduler recovers after restart."],
  ["Observability", "Structured logs with request id, audit log, health endpoint, model version in every prediction response."],
  ["Food safety", "The system is decision support. Show a disclaimer and a donor checklist (hygiene, labelling, temperature). Never route UPCYCLE-labelled food to human recipients. Safety-critical error rate is tracked (Section 9.5)."],
  ["Fairness", "Fairness penalty prevents a few partners from absorbing everything; report allocation Gini in the admin dashboard."],
  ["Ethics and honesty", "Label synthetic data as synthetic everywhere. Document limitations of the model and the data in the README."],
] as const;

export const safetyRules = [
  "UPCYCLE-labelled food must never be offered to human-consumption partners. Add a test for it.",
  "Never hard-code or invent metrics, dataset sizes, accuracy numbers or citations. Every reported number must come from code you ran.",
  "Synthetic data is allowed and expected, but must be labelled synthetic in files, UI and reports.",
  "Never hard-depend on paid or external services. Everything must run offline except optional map tiles and optional OSRM.",
  "Explainability everywhere. Every prediction and every ranking must be explainable in the UI.",
  "The platform gives decision support, not a food-safety guarantee.",
];

// 11
export const api: [string, string, string][] = [
  ["POST /auth/register, POST /auth/login, POST /auth/refresh", "public", "Account creation and tokens"],
  ["GET /me", "any", "Current user and profile"],
  ["POST /partners, PUT /partners/{id}, GET /partners/{id}", "ngo, admin", "Create, update, view partner profile and capacity"],
  ["GET /partners (filters: type, verified, near=lat,lon&radius)", "admin, donor (limited)", "List and search partners"],
  ["POST /admin/partners/{id}/verify, /suspend", "admin", "Verification workflow"],
  ["POST /donations", "donor", "Create listing; triggers prediction and matching asynchronously"],
  ["GET /donations, GET /donations/{id}", "donor, admin", "List and detail with prediction, offers, status timeline"],
  ["POST /donations/{id}/cancel", "donor", "Cancel before pickup"],
  ["POST /predict", "donor, admin", "Dry-run prediction without saving (for the form preview)"],
  ["GET /offers (mine), POST /offers/{id}/accept, /reject", "ngo", "Offer inbox and response"],
  ["POST /pickups/{id}/picked-up, /deliver (code)", "ngo", "Status updates with handover code"],
  ["POST /feedback", "ngo", "Quality feedback"],
  ["GET /impact, GET /impact/timeseries", "any", "Impact numbers and charts"],
  ["GET /notifications, POST /notifications/{id}/read", "any", "In-app notifications"],
  ["POST /admin/ml/train, GET /admin/ml/runs, GET /admin/ml/report/{version}", "admin", "Trigger training, view comparison report"],
  ["POST /admin/ml/promote/{version}, /rollback", "admin", "Model registry control"],
  ["GET /admin/stats", "admin", "Operational analytics and drift indicators"],
  ["GET /health", "public", "Liveness and active model version"],
];

// 9.3 / 9.5 / 9.6
export const models = [
  { name: "Naive Bayes", impl: "GaussianNB on scaled plus one-hot features", family: "Probabilistic" },
  { name: "Logistic Regression", impl: "LogisticRegression (multinomial, lbfgs or saga)", family: "Linear" },
  { name: "Decision Tree", impl: "DecisionTreeClassifier", family: "Single tree" },
  { name: "Random Forest", impl: "RandomForestClassifier", family: "Bagging" },
  { name: "XGBoost", impl: "XGBClassifier (objective multi:softprob)", family: "Boosting" },
];

export const metricsWhy = [
  ["Accuracy", "Overall correctness; misleading under imbalance, so never reported alone."],
  ["Precision, Recall, F1 (macro)", "Macro treats rare UPCYCLE and REDISTRIBUTE classes fairly. Weighted and per-class are reported too."],
  ["ROC-AUC (one-vs-rest, macro)", "Threshold-independent ranking quality; one-vs-rest extends ROC to three classes."],
  ["Confusion matrix", "Row-normalised, per model. Shows which actions get confused, for example DONATE vs REDISTRIBUTE."],
  ["Log loss and calibration", "Probabilities are shown to users, so they should be calibrated."],
  ["Safety-critical error rate", "Share of true UPCYCLE items predicted as DONATE. Sending unsafe food to people is the worst error."],
] as const;

export const protocol = [
  "Stratified 80 / 20 train and test split. Tuning with stratified 5-fold CV on the 80 percent only.",
  "Final metrics on the untouched 20 percent and on the L2 expert set.",
  "Repeat the full procedure for 5 random seeds (42, 7, 13, 21, 99). Report mean and standard deviation.",
  "Same split, same features, same seeds for all five models. No model gets special treatment.",
];

export const selectionRule = [
  "Primary score = mean macro-F1 on the test set across seeds.",
  "Safety gate: safety-critical error rate must not exceed the configured limit (default 2%). Models that fail are disqualified.",
  "Candidates = models within 1 percentage point of the best primary score.",
  "Tie-break: higher macro ROC-AUC (OVR), then lower log loss, then lower inference latency, then the simpler model (NB < LR < DT < RF < XGB).",
  "Store the winner, all scores and this rationale text in metrics.json and the registry entry.",
];

// 8.1
export const dataLayers = [
  { id: "L1", name: "Synthetic", source: "Generator script driven by a documented policy plus noise (Section 8.4)", use: "Bulk training and cross-validation", honesty: "Always labelled synthetic. Never present as real-world accuracy." },
  { id: "L2", name: "Expert-labelled hold-out", source: "200-300 listings labelled manually and independently by at least 2 team members using a written guideline", use: "Independent test set that the generator policy never saw", honesty: "Report inter-annotator agreement (Cohen's kappa). Resolve disagreements by discussion." },
  { id: "L3", name: "Real or pilot", source: "Optional: surveys or a pilot with local restaurants, caterers and NGOs; NGO feedback after pickup", use: "Calibration of distributions; final validation if available", honesty: "State sample size and collection method." },
];

// 14.2
export const phases = [
  ["P0", "Repo skeleton, config, Makefile, CI, pinned requirements, README stub", "make setup and make test run on a clean machine"],
  ["P1", "Dataset: generator, schema, dataset card, expert-label template and guideline", "10k+ rows generated reproducibly; L2 template and guideline ready for humans to label"],
  ["P2", "ML pipeline: features, 5 models, tuning, evaluation, plots, selection rule, registry", "make train produces comparison report and registers a winner"],
  ["P3", "Backend core: auth, partners, donations, predict endpoint, DB migrations", "API tests pass; /docs works"],
  ["P4", "Matching engine, offers, cascade, scheduler, notifications, pickups, feedback", "Scenario tests from Section 15 pass"],
  ["P5", "Frontend: donor, NGO, admin flows, maps, ML console, impact dashboard", "Full demo path works in the browser"],
  ["P6", "Simulator and matching evaluation vs nearest-NGO baseline; evaluation report", "docs/evaluation_report.md generated from real runs"],
  ["P7", "Hardening: security review, docs, Docker, demo seed and script, viva notes", "Fresh clone to running demo in under 15 minutes"],
] as const;

export const deliverables = [
  ["D1", "Working system", "Backend, ML pipeline, matching engine, frontend, demo seed, Docker and non-Docker run"],
  ["D2", "Comparison report", "Five-model evaluation on L1 and L2, with plots and selection rationale"],
  ["D3", "Matching evaluation", "Simulator results versus nearest-NGO baseline"],
  ["D4", "Project report", "Thesis-style report assembled from docs/"],
  ["D5", "Presentations", "Stage 2 slides adding the missing sections; demo video"],
  ["D6", "Repository", "Clean README, tests, CI, dataset card, licence"],
] as const;

export const futureWork = [
  "Learned matching weights (learning-to-rank)", "Route optimisation for multi-pickup trips", "Freshness estimation from images",
  "IoT temperature logging", "Demand forecasting for NGOs", "Volunteer allocation", "Blockchain traceability",
  "Native mobile apps", "Multilingual interface",
];

// 15.2
export const acceptance = [
  ["A1", "Fresh hot meal, 25 kg, 3 hours of safe window, three verified NGOs within 8 km, one with enough capacity", "DONATE; rank-1 is capacity-fit NGO; ETA less than time left; donor sees reasons"],
  ["A2", "Fresh buffet leftovers, 150 kg, nearest NGOs have 30 kg free each", "REDISTRIBUTE; allocation split across several partners or a food bank"],
  ["A3", "Cooked food past its safe window", "UPCYCLE; only upcycle partners are offered; never an NGO feeding people"],
  ["A4", "Rank-1 NGO rejects", "Rank-2 receives the offer automatically; audit log shows both attempts"],
  ["A5", "No response within deadline", "Offer marked TIMED_OUT; next partner offered"],
  ["A6", "No partner within 40 km", "NO_MATCH or fallback channel; donor and admin notified"],
  ["A7", "Model file missing or confidence below threshold", "Rule-based fallback used; listing flagged low confidence; no crash"],
  ["A8", "Admin trains, compares, promotes a new version, then rolls back", "Active model switches both ways; predictions report the right version"],
  ["A9", "Unverified NGO exists nearest to donor", "It is never offered the donation"],
  ["A10", "Run make train twice", "Identical comparison tables"],
] as const;

// A.4
export const literature = [
  ["Estimating Surplus Food Supply for Food Rescue and Delivery Operations", "2017", "Nair et al.", "Linear regression, SEM, neural networks", "ML prediction helps plan collection and delivery"],
  ["Food Sharing, Redistribution and Waste Reduction via Mobile Applications", "2020", "Harvey et al.", "Mobile app, location services, social network analysis", "Mobile platforms facilitate sharing"],
  ["Bandit Data-Driven Optimization for Crowdsourcing Food Rescue Platforms", "2022", "Shi et al.", "Multi-armed bandit, data-driven optimisation", "Improves volunteer engagement and efficiency"],
  ["Using AI to Tackle Food Waste and Enhance the Circular Economy", "2023", "Onyeaka et al.", "AI / ML survey", "AI has potential across prediction, detection, management, redistribution"],
  ["ECOFEAST: Food Redistribution Platform", "2024", "Amrutkar et al.", "Geolocation, Firebase, mobile app", "Location matching and notifications improve efficiency"],
  ["Predicting and Optimizing Fair Allocation of Donations in Hunger Relief Supply Chains", "2024", "Sharmile et al.", "Forecasting and optimisation", "Predictive models support fairer allocation"],
  ["Unlocking the Potential of Surplus Food: A Blockchain Approach", "2024", "Yu et al.", "Regression, random forest, blockchain", "Improves transparency; analyses redistribution factors"],
  ["Leftover Food Management System", "2025", "Patil et al.", "Web app, geolocation, rule-based matching", "Supports collection, redistribution, diversion by shelf life"],
  ["Designing a Location-Based Mobile Platform to Redirect Surplus Food", "2025", "Author not listed", "GPS matching, mobile app", "Improves donor-NGO connection"],
  ["From Waste to Worth: Enhancing Access to Edible Surplus Food", "2025", "Kusumawati et al.", "Geolocation, pickup scheduling, mobile platform", "Real-time listings and scheduling improve recovery"],
  ["A Web-Based Food Donation and Redistribution System", "2026", "Shivani S. S. et al.", "Web app, location tracking, notifications", "Real-time registration and coordination help"],
  ["FoodShare Hub: AI-Enabled Excess Food Redistribution App", "2026", "Author not listed", "AI, freshness prediction, route optimisation", "AI freshness plus matching and routing improves redistribution"],
] as const;

// 18
export const openDecisions = [
  ["A1", "Definitions of DONATE, REDISTRIBUTE, UPCYCLE acceptable to the guide?", "Use Section 1.1 definitions"],
  ["A2", "Tech stack preference?", "FastAPI + React + SQLite/PostgreSQL"],
  ["A3", "Pilot city and region for demo coordinates?", "Mumbai / Thane region, India"],
  ["A4", "Is any real data source available?", "Synthetic L1 plus team-labelled L2"],
  ["A5", "Who labels the L2 expert set, and what guideline do they follow?", "Two team members independently, guideline in docs/labeling_guideline.md"],
  ["A6", "Which food-safety source defines shelf-life windows?", "Placeholders flagged until team picks FSSAI or equivalent source"],
  ["A7", "Deployment target for the demo?", "Local laptop plus optional free-tier cloud"],
  ["A8", "Languages in UI?", "English, structure ready for Hindi and Marathi"],
  ["A9", "Meals-per-kg and emissions factors for impact dashboard?", "Configurable constants, with source cited in config before display"],
  ["A10", "Should upcycle partners be in the same partners table?", "Yes, using partner_type"],
] as const;
