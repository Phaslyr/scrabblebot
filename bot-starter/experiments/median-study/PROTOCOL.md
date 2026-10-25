# Median-tendency study: local only

Keep all live policy, identity, launcher and transport files unchanged. Do not start a bot, register for a tournament, read credentials or create monitoring. The user requests median-like tendencies with marginal variations, tested locally for statistical differences. Do not force a significant result or tune on final outcomes.

## Public evidence

Collect the latest 2,000 ended public games with anonymous SELECTs. Exclude the eight older live diagnostics and every completed/partial match in the stopped continuous campaign. Use the earliest 80% for fitting and the latest 20% as public holdout. Select eight leading current-version bots with at least 50 current-version games and 30 covered fit-period games. Define the center from the median of their per-bot medians of long-word reward and pre-word cash. Bid prices are medians of observed winning bids and actual payments, by letter/phase where coverage permits. These are winning outcomes, not recovered private valuations, all-bid medians, or exact cash-out thresholds.

Keep public losing bids as censored intervals; never invent observed sealed losing bids. Fit one opponent bid multiplier from training-only historical price predictions. Report its price calibration on the held-out public games without tuning on those outcomes.

## Policies and development

The unchanged offense-only TaylorMason v4 is the control. Experimental policies retain legal whole-rack packing and opening-cash affordability. Add broader premium-word opportunities, observed-letter availability, price-aware acquisition, and median-like payout/cash-out preferences, with no defense or opponent-dependent targeting. Compare bid-only and word-only ablations, the combined median center, and one-factor neighbors: bid scale +/-10%, payout +/-3 points, cash-out +/-3 coins, and value ceiling +/-0.15. Twelve configurations, 32 bags per field: 768 development games.

Choose the best non-control development policy by mean own score minus highest rival across equally weighted fields, tie own score. On 32 different bags per field, test that parent and +/-0.05 bid-scale neighbors (or +/-1 payout if it has no new bidding), plus +/-1 cash-out neighbors (or +/-0.05 value ceiling if it has no new word timing). Five configurations, 320 additional development games. Choose with the same rule. Freeze before final validation.

## Final tests

Two six-player fields: refreshed public-data bid/word models; and current TaylorMason v4, Wags and three independent premium planners. Rotate seats and lineups; pair letter bags, opponent random draws and ties. No current rival bid, private rack or future tile is available to a policy.

Validate current v4, the original median center, the selected candidate and its +/-0.05 active bid-scale neighbors (or +/-1 payout if bidding is unchanged). Deduplicate equal settings. Use **384 new bags per field**, at most 3,840 games. Do not retune afterward. The comparison family contains selected-current, center-current, selected-center and each final neighbor-selected, deduplicated, for own score and winning margin in both fields. Use paired t tests, Holm-adjusted p-values across that whole family, and Bonferroni simultaneous t intervals. Wins are descriptive secondary outcomes; do not mistake score significance for proven win-rate improvement. Report practical effect sizes and inconclusive or negative results.

Separately test the same frozen policies in **256 held-out public price paths**, with one seeded synthetic starting rack per historical match and the other five archived bids fixed. Reconstruct only the aggregate initial-letter pool from the standard bag minus revealed auctions; draw our five letters from it. Ties conservatively lose. This is a price-taking sensitivity, not a multiplayer counterfactual: report own scores, cash and purchases, never hypothetical live wins or denied points. Correct its score comparisons separately using Holm. No held-out price path is used for development.

Finally compare selected-current on 96 other bags per six-player field with a shared 15% opening-bid loss mask. This is a stylized transport robustness check, not a real network model or a transport fix; treat it as secondary exploratory evidence.

Development seeds: 39,000,000 and 40,000,000; final: 41,000,000; transport stress: 42,000,000; field offset 10,000. Replay racks use 43,000,000 plus case index. All stages are disjoint. Expected total: about 5,568-6,592 local simulations depending on deduplication.

Save immutable inputs/hashes, selection records, all game rows, representative traces and calibration diagnostics. Verify source hashes, control parity, affordability, legal words, cash/tile conservation, observed-information boundaries, per-game reset, forecast behavior, deadline performance and statistical routines. Leave any promising candidate experimental; no automatic live-policy replacement is authorized by this local study.
