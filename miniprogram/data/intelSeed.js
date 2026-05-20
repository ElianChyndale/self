"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUNDLED_INTEL_CONTENT = exports.BUNDLED_INTEL_ARTICLES = void 0;
exports.getBundledIntelArticleContent = getBundledIntelArticleContent;
exports.BUNDLED_INTEL_ARTICLES = [
    {
        title: 'Trade convoys rerouted as Pacific manufacturing slows',
        link: 'bundled://intel/trade-convoys-rerouted',
        pubDate: '2026-05-20T08:30:00.000Z',
        description: 'A macro briefing on shipping pressure, factory softening, and how resilient operators are reshaping procurement timelines.',
        category: 'finance',
    },
    {
        title: 'Labs harden frontier model deployments after prompt-injection incidents',
        link: 'bundled://intel/lab-hardening',
        pubDate: '2026-05-20T07:45:00.000Z',
        description: 'Security teams are shifting from optimistic tool routing toward stricter isolation, logging, and approval workflows.',
        category: 'ai',
    },
    {
        title: 'Legislators prepare new digital infrastructure oversight package',
        link: 'bundled://intel/infrastructure-oversight',
        pubDate: '2026-05-19T22:15:00.000Z',
        description: 'Regional policy leaders are framing compute, connectivity, and platform resilience as strategic public infrastructure.',
        category: 'politics',
    },
    {
        title: 'Compiler teams push smaller bundles with more aggressive dead-code pruning',
        link: 'bundled://intel/compiler-bundles',
        pubDate: '2026-05-19T20:20:00.000Z',
        description: 'Tooling engineers are squeezing startup cost through graph-aware pruning, cache discipline, and clearer boundary ownership.',
        category: 'computer-science',
    },
    {
        title: 'Energy-market operators price in hotter summer demand scenarios',
        link: 'bundled://intel/energy-demand-scenarios',
        pubDate: '2026-05-18T18:10:00.000Z',
        description: 'Grid planners and commodity desks are widening contingency models as weather volatility drives reserve sensitivity.',
        category: 'finance',
    },
    {
        title: 'Inference teams standardize evaluation gates before broader agent rollouts',
        link: 'bundled://intel/eval-gates',
        pubDate: '2026-05-18T12:00:00.000Z',
        description: 'More product teams are treating eval harnesses, failure taxonomies, and rollback triggers as launch prerequisites.',
        category: 'ai',
    },
];
exports.BUNDLED_INTEL_CONTENT = {
    'bundled://intel/trade-convoys-rerouted': `SIGINT DOSSIER // MERCHANT FLEET WATCH\n\nLogistics officers report that procurement timelines are stretching as Pacific production softens and carriers rebalance routes toward more reliable demand corridors.\n\nKey observations:\n- inventory buffers are rising again in electronics-adjacent sectors\n- firms with dual-source contracts are preserving delivery cadence better than spot-market buyers\n- capital equipment orders remain slower than consumer staples\n\nCommand implication:\nOperators should expect staggered supply arrivals, longer quoting windows, and greater value from disciplined mission prioritization.`,
    'bundled://intel/lab-hardening': `ORDO CYBERNETICA // MODEL HARDENING BRIEF\n\nAfter repeated prompt-injection and tool-misuse incidents, deployment teams are closing trust boundaries that had previously been treated as convenience features.\n\nObserved countermeasures:\n- tighter separation between reasoning and tool execution\n- high-risk tools routed through explicit approval steps\n- broader transcript logging for forensic review\n- red-team prompt suites embedded in release gates\n\nCommand implication:\nTreat agent autonomy as earned capability, not a default entitlement.`,
    'bundled://intel/infrastructure-oversight': `SENATORUM DATA-TACTICA // CIVIC OVERSIGHT BRIEF\n\nPolicy teams are reframing digital platforms, datacenters, and connectivity as strategic infrastructure rather than ordinary consumer services.\n\nPriority themes:\n- resilience expectations during disruption events\n- supply-chain disclosure for critical platform dependencies\n- stronger accountability for systemic outages\n\nCommand implication:\nExpect governance changes to land first on reporting, continuity planning, and operator accountability.`,
    'bundled://intel/compiler-bundles': `MECHANICUS ARCHIVE // COMPILER EFFICIENCY NOTE\n\nCompiler and bundler teams are reducing shipped weight by attacking dependency ambiguity, pruning dead branches, and making ownership boundaries more explicit.\n\nThe most effective patterns combine:\n- narrower module contracts\n- disciplined lazy loading\n- stable asset graphs\n- less magical cross-layer coupling\n\nCommand implication:\nSmaller artifacts are usually a sign of clearer architecture, not just better compression.`,
    'bundled://intel/energy-demand-scenarios': `ADEPTUS MUNERATORUM // ENERGY MARKET MEMO\n\nGrid operators and traders are increasing reserve assumptions as hotter weather scenarios threaten localized stress events.\n\nImplications include:\n- more cautious hedging posture\n- wider volatility bands for peak demand windows\n- increased scrutiny on backup generation and storage readiness\n\nCommand implication:\nTeams exposed to energy-intensive compute or manufacturing should price in higher operating variance.`,
    'bundled://intel/eval-gates': `TACTICAL COGITATION // AGENT DEPLOYMENT CHECKLIST\n\nTeams widening agent access are increasingly formalizing evaluation gates before rollout.\n\nCommon release gates now include:\n- task-family success thresholds\n- timeout and retry budget review\n- degradation behavior checks\n- human override and rollback drills\n\nCommand implication:\nAgent launches that lack structured evaluation usually fail in reliability, not capability.`,
};
function getBundledIntelArticleContent(link) {
    return exports.BUNDLED_INTEL_CONTENT[link] || null;
}
