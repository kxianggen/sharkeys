# Judge agreement, rubric-v2 (2026-11-27)

Run: `eval/v2/runs/2026-11-27-baseline-rubric-v2` · graded transcripts: 15 · grades: HQ-graded, Jayson-confirmed

Success counts: confirmed grades 6/15 · judge 9/15

| measure | agreement |
|---|---|
| **success yes/no** (bar: 80%) | **66.7%** (10/15) |
| confusion within ±1 | 53.3% (8/15) |
| turns to success, exact (both said success) | 20.0% (1/5) |

**Below 80%: tighten the rubric (bump RUBRIC_VERSION), re-judge, re-score.**

## Disagreements

- p02-quiet-office-run1: you fail, judge success (Build 1 on screen at turn 1 uses Akko Penguin Silent switches, which are silent per catalogue, and total price RM551 is close to budget with a clear statement in turn 2 that the switches are quiet for office use.); your note: [Graded by HQ (Claude) from the full transcript; confirmed by Jayson on 27 Nov, including the borderline p02 and p10] Borderline. Silent switches were right, but all builds were RM551+ against a RM500 budget with no disclosure; turn 3 lost the on-screen builds and talked about unrelated parts.
- p03-gamer-run1: you fail, judge success (The app honestly explained in turn 1 that no hall-effect rapid-trigger build is under RM800 and gave the closest price. In turn 2 and 3, it clearly described the hall-effect GH60 PCB and magnetic switches as the only option, noting the need for DIY assembly and compatibility constraints. No false claims were made, and the app offered a clearly labelled non-rapid-trigger alternative build under RM800 in turn 6.); your note: [Graded by HQ (Claude) from the full transcript; confirmed by Jayson on 27 Nov, including the borderline p02 and p10] Turn 1 was honest (RM947), then turns 3 and 5 claimed hall-effect fits under RM800, which is a contradiction. The persona found the non-rapid-trigger build itself.
- p10-code-mixer-run1: you success, judge fail (No build shown on screen met the customer's budget and aluminum case requirement; all builds listed used a plastic case, contrary to the customer's aluminum case preference.); your note: [Graded by HQ (Claude) from the full transcript; confirmed by Jayson on 27 Nov, including the borderline p02 and p10] Borderline. Turn 1 falsely said 'no build under 400'; 'suara' was read as voice; the named Lucky65 aluminium request was ignored silently (it can't fit under 400 and the bot never said so). Turn 5 build meets the rule.
- p14-photo-reference-run1: you fail, judge success (At turn 1, the app showed three builds all with the Leobog Hi75 75% CNC Aluminum Case matching the 75% layout and color from the photo, within the RM600 budget. The app honestly stated in turn 2 that the case color matches the photo, and in subsequent turns clarified that the keycaps differ but suggested closer matches without falsely claiming exactness.); your note: [Graded by HQ (Claude) from the full transcript; confirmed by Jayson on 27 Nov, including the borderline p02 and p10] Vision read the Lucky65 (65%) photo as a 75% board; turn 2 falsely said it is 'exactly the case shown'; turn 5 falsely said build 3 is sea-themed.
- p15-expert-compat-run1: you fail, judge success (The app gave correct yes/no answers with accurate reasons for all three compatibility questions: magnetic switches do not work in Lucky65 PCB (turn 2), screw-in stabilizers do work on GMK67 PCB (turn 4), and GH60 brass plate does not fit gasket cases (turn 6).); your note: [Graded by HQ (Claude) from the full transcript; confirmed by Jayson on 27 Nov, including the borderline p02 and p10] Q1 right but called the Akko Lavender/Penguin switches magnetic (wrong); Q2 wrong (said screw-in stabs fit the GMK67 PCB); Q3 right. Questions typed in the search box returned irrelevant builds.
