// Curated builder expertise — distilled from the shop owner's real experience
// building and selling keyboards (150+ five-star sales, Malaysia market). This
// is grounded advice Meg may draw on, NOT raw data or invented facts. It
// supplements the catalog + rule-engine grounding; it never loosens the
// "never fabricate parts/prices/specs/compatibility" rules. Keep every entry
// truthful and defensible — paraphrased opinion, framed as the builder's
// genuine recommendation.

export type BuilderKnowledgeEntry = {
  // Short stable key so entries can be referenced/tested individually.
  topic: string;
  guidance: string;
};

export const builderKnowledge: readonly BuilderKnowledgeEntry[] = [
  {
    topic: "layout_and_use_case",
    guidance:
      "Match the layout to how it will actually be used. 65% is popular and compact, but it has no function row — people who need F-keys a lot often end up wanting a TKL later. 60% drops the arrow keys too, which some people regret. Gaming rarely needs a function row, so a smaller layout is usually fine there.",
  },
  {
    topic: "sound_is_subjective",
    guidance:
      "Sound is personal — I can describe the general character (thocky/deeper, creamy/smooth, clacky/brighter), but I can't play audio for you. Before committing, it's worth hearing a sound test of the switch and kit so you know you actually like it.",
  },
  {
    topic: "switch_advice",
    guidance:
      "For a first build I usually point people to a creamy or thocky switch — it's satisfying and feels nothing like a typical pre-built. For an office, silent switches are underrated and keep the peace. For gaming almost anything sounds fine, though silent switches feel a bit less crisp.",
  },
  {
    topic: "budget_wisdom",
    guidance:
      "Spend on the switch first — it's the biggest driver of how a build feels and sounds. Keycaps are mostly looks, so don't overspend there. Around RM300 is a sweet spot for a solid first build, and you can get an aluminium case under RM300. You don't need a RM1–2k board to start; spec-for-spec it's often similar to a ~RM300 build unless you specifically care about the brand.",
  },
  {
    topic: "dont_over_mod",
    guidance:
      "Modern kits already include foam and often ship with pre-lubed switches, so heavy tape mods or hand-lubing every switch usually aren't worth the effort or cost anymore. Start with a good kit and switch and you're most of the way there. The one mod I do still recommend is tuning the stabilizers — that's six or seven keys rather than seventy, and it's the exception worth the twenty minutes.",
  },
  {
    topic: "stabilizer_tuning",
    guidance:
      "Stabilizer tuning is the single change that makes a cheap board sound expensive, and it's a different job from lubing switches. Krytox 205g0 goes on the stabilizer stems — it's thick enough to damp the housing rattle. XHT-BDZ goes on the wires, where it stays put and kills the metallic ping that thin lube doesn't. Using one lube for both jobs is the usual mistake: the wire needs the heavier treatment, the stem needs the smoother one. Do just the big keys — spacebar, shift, enter, backspace — and the rattle that makes a board sound hollow disappears.",
  },
  {
    topic: "budget_value_picks",
    guidance:
      "If you want the most sound for the least money, the two I keep coming back to are the MZ Z1 for budget thock and the KTT Cabbage Tofu for a creamy profile. Both punch well above their price, and for most builds I'd take either over a switch costing several times more. On the case side the Lucky65 is the standout aluminium pick — dense and thocky for what it costs.",
  },
  {
    topic: "hotswap_vs_soldered",
    guidance:
      "For beginners I recommend a hot-swap PCB — you just push switches in, no soldering. Soldered boards need skill and a wrong move can damage the PCB, so I'd leave that until you're comfortable.",
  },
  {
    topic: "wired_vs_wireless",
    guidance:
      "If the board mostly stays on your desk, wired is cheaper and works great. Go wireless if you travel with it or really want a cable-free look — otherwise it doesn't matter much.",
  },
  {
    topic: "premium_feel",
    guidance:
      "The case material is what makes a board feel premium — aluminium has a hefty, dense feel that plastic doesn't. If it's within budget, that's the upgrade I'd spend on for the 'expensive' feel.",
  },
  {
    topic: "overrated",
    guidance:
      "Two things people overrate: RGB (fun at first, most people tire of it) and very expensive switches (a cheaper switch often gets you a very similar sound). Don't feel you need either for a great board.",
  },
  {
    topic: "first_timer_tip",
    guidance:
      "If it's your first build, watch a beginner assembly tutorial first. It saves you from the common mistakes — like inserting a switch slightly off and bending the PCB pins.",
  },
  {
    topic: "multi_os",
    guidance:
      "Most boards work on both Mac and Windows, usually via a physical switch on the board. Mac users can also swap in Mac-legend keycaps if they want the labels to match.",
  },
];

// Honesty framing rules for how Meg may use the expertise above. These are
// appended to Meg's base system rules on BOTH surfaces (configurator + community
// comments). They add opinionated advice WITHOUT loosening grounding: the base
// "never invent" rules still bind.
export const builderExpertiseGuidanceRules: readonly string[] = [
  "You may draw on the builder expertise notes (provided as builderExpertise) to give practical, opinionated advice. Frame them as the builder's genuine experience and recommendations — never as statistics, ratings, or 'most popular' data.",
  "Some catalog parts are flagged as the builder's personal picks (metadata.builderPick). You may mention these as the builder's honest recommendation from experience (e.g. \"the Lucky65 is a standout budget 65% I'd personally recommend\") — never as popularity or sales data.",
  "This expertise supplements the catalog and compatibility facts; it does not override them. You still must never invent parts, prices, specs, vendors, stock, or compatibility claims.",
  "You cannot play audio. When sound matters, describe the general character and suggest hearing a sound test before deciding.",
];

// Compact structured form handed to the model in the grounded prompt payload.
export function getBuilderExpertisePayload(): readonly BuilderKnowledgeEntry[] {
  return builderKnowledge;
}
