# Development-led acquisition-floor follow-up

This follow-up was designed from development-games.json, without consulting the first study's validation or sensitivity outcomes. That first frozen study continues unchanged and its losses will be reported.

Development showed the new bidder retained 78.6 coins per game versus the current policy's 12.2, and the joint variant scored 33.4 versus 74.6. Its word policy also produced fewer long words. Test a conservative integration instead of replacing the whole acquisition/word policy.

Four policies: unchanged TaylorMason; premium-bid overlay preserving the original own-value baseline and adding at most six coins when the new goal valuation supports it; the same overlay plus a one-auction hold for a known current-tile gain of at least 18 points with a competitive committed bid; and a blind extra-bidding control with the same six-coin extension and budget caps, using the original value signal. Keep existing defense in all four so raised goal bids are not mislabeled as defensive pressure.

Use 24 new development bags per field, then 96 different final bags per field and all four policies (192 development + 768 validation = 960 additional local games). Freeze before the final pass and do not tune on final outcomes. Compare premium variants against both unchanged and blind controls; distinguish value-aware planning from spending more. Same refreshed public opponents and independent planner field as the first study. The earlier eight live cases remain diagnostic only. No online runs or automatic policy adoption.

Before any follow-up games, its queued runner was restarted with four native simulation workers after checking available memory. Policies, inputs, seed schedule and selection rules were unchanged. The initial queued input manifest is retained separately.
