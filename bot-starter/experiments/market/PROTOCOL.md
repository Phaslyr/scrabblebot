# Direct market-price test with all three agents

This is one offline follow-up experiment. Live Wags, TaylorMason, VictorMateo, their profiles, and launchers are not edited or started.

Forecasts: simple letter/phase/liquidity market table; frozen previous player-specific predictor; a new direct market-price learner. Fit the new learner and simple table on the first 80% of the previous 1,800-game archive and select/calibrate on its final 20%. That archive has already been studied and is no longer a final test. Final historical evaluation uses only newly fetched completed matches beyond that archive's maximum match ID. No fresh-test results select models or response settings.

Choose one target perspective per auction by a deterministic rotation independent of bids and outcomes, require six known real participants, and reconstruct only opening public state. The target is the highest other bid: exact archived top when the target loses, runner-up payment when it wins, or [0,1] when the reserve is ambiguous. Audit final scores, balances and nonnegative rack sizes.

The direct learner adds a bounded boosted-stump correction to the simple table. Compare context-only and identity-augmented features; select complexity on calibration games. No private initial letters, hidden losing bids or future leaderboard outcomes are features. Evaluate game-averaged price error and calibrated interval coverage on the fresh public holdout.

Test unchanged, simple forecast, frozen player-specific forecast, direct forecast, and blind extra-aggression variants for all three bots. Keep the existing four-coin extension and cash/value ceiling; use median price estimates as in the previous exploratory follow-up. Preserve VictorMateo's actual mode-dependent settings and per-match resets. The learned forecast never sees the sampled empirical bid row.

Main replacement arena: 120 new independent bags per bot, each variant facing the same five empirical rivals. Sensitivities: 24 bags per bot in each low/high hidden-bid assumption and the cached-model arena. Mixed arena: all three bots plus three empirical rivals, 60 new bags, three seat rotations each; compare unchanged versus direct-forecast variants. Average rotations per bag for uncertainty.

Use fresh simulator seeds, keep bags/seats/tie randomness/replay draws matched, and report prediction/response effects separately. Forecast usefulness requires advantage over the simple baseline; gameplay usefulness requires evidence beyond unchanged and blind controls. This study can identify a promising candidate, not establish actual server win rates. No automatic adoption.
