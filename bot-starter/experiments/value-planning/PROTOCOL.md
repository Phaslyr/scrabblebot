# Value-oriented planning study — local only

Keep the online bot stopped. Do not start an online runner, use bot credentials, join a lobby, or change the current production policies. Anonymous SELECT queries may refresh the opponent benchmark. Preserve older experiments and the eight clean live-game logs.

Implement: own-rack/goal/alternatives/reason traces; payout-, cost-, availability- and time-aware goals; purchases tied to goal value; refreshed opponents including all seven observed winners; and defense statistics based on actual counterfactual auction ownership, not pressure labels.

Reconstruct our initial rack in each of the eight full live games from prefix letter deficits. A five-letter requirement uniquely identifies our initial rack. Verify all recorded word plays, scores and purchases. Replay decisions against the observed trajectory with no propagation of hypothetical choices. These are hindsight diagnostic cases, never validation matches or estimates of counterfactual wins. Reconstructed private information is restricted to our own rack; opponents retain public lower-bound racks.

Refresh the latest 1,000 completed public games. Exclude the eight diagnostic games from fitting price summaries and opponent behavior. Model SookraBot, LUCENT, Lionel, Menice, LetterSharkUltra, swanbot and Nijello, with small-history labels where needed. Fit public winning/payment summaries and losing-bid intervals, retaining weak bounds. Report reconstruction audit and any missing coverage. Public-data models do not recover the original private strategies.

Fields: (1) candidate versus five rotating public-data models; (2) candidate versus the unchanged Wags and TaylorMason functions plus three independently ranked premium-goal planning rivals. Supply public metadata consistently. Match letter bags, seats, rival draws and tie randomness between variants. The target's aliases are identical across variants. No opponent's current bid, private letters or future tiles enter a policy.

Development: 32 bags per field, comparing unchanged TaylorMason, new word-goal policy only, new goal-directed bidding only, and the joint policy. Choose the best refinement by mean score minus highest rival score, averaged equally over the two fields; break ties on own score. Report the original control even if it beats every refinement.

Defense follow-up: 24 other bags per field, comparing the best scoring refinement with existing, disabled, and selective credible defense. Select by the same development-only criterion. Do not describe pressure purchases as denied words. The simulator may inspect true rival bids only after settlement to classify changed ownership, ties and unchanged winners.

Freeze policies, settings and opponent inputs before final testing. Validate on 128 new bags per field with unchanged TaylorMason, the selected scoring refinement under existing defense, and the final defense-selected candidate. Deduplicate identical configurations rather than rerunning the same policy. Sensitivities: 24 other bags per field in low/high hidden-bid assumptions, comparing control and final candidate. Expected total is 1,104 games if the two candidate configurations coincide, or 1,360 otherwise, plus eight diagnostic decision replays.

Record full traces for representative games from each field, policy and stage; aggregate scoring, spend, word value, goal changes and defense outcomes for every game. Use the same traces for controls, and verify tracing does not change outcomes. Run legality, affordability, per-game reset and live/local counter parity checks. Show paired uncertainty by letter bag, keep fields separate, and do not tune after final validation. Report gains and regressions even if no candidate wins. No automatic adoption or online rerun.
