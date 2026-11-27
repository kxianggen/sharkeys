# p05-vague-beginner-run1

**Customer goal:** End up with one keyboard she feels okay buying.
**Satisfied when:** After at most one or two simple clarifying questions, a single compatible build is shown with a short plain-language reason. Not overwhelmed with jargon.
**What the catalogue can honestly offer:** exists. Anything beginner-friendly works. The test is whether the bot copes with vagueness.

Grade in grades.json: success (true/false), turnsToSuccess (turn number or null), confusion (1 clear … 5 unusable).

```
--- Turn 1 ---
CUSTOMER (search): nice keyboard, not too expensive, clean look
APP REPLY: (3 build cards shown; no other reply text)
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM492. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM578. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM507. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 2 ---
CUSTOMER (chat): huh whats difference 1 and 3? price close
APP REPLY: The main difference between 1 and 3 is likely about the components or features you're comparing, but from what you shared, I don't see specifics for those numbers. Could you clarify what parts or options '1' and '3' refer to? That way I can help you understand the differences clearly.
[Part chips under Meg's reply: GH60 CNC Aluminum Case · GH60 MX Hotswap PCB · GH60 Polycarbonate Plate · Akko Lavender Purple V3 Pro Tactile Switch]
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM492. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM578. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM507. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 3 ---
CUSTOMER (chat): the price difference? and the plate? what better? keep it simple pls
APP REPLY: The GH60 CNC Aluminum Case costs RM180 and gives a stiff, clacky sound with a solid aluminum feel, while the GH60 Polycarbonate Plate is RM40 and offers a flexible, cushioned typing experience that mutes higher frequencies for a thockier sound. The case affects the overall build feel and sound a lot more than the plate. For a simple choice, pick the case based on your preferred sound profile and budget, and the plate is fine as is if you want a softer typing feel.
[Part chips under Meg's reply: Leobog Hi75 75% CNC Aluminum Case · GMK67 65% Plastic Case · Weikav Star 80 CNC Aluminum TKL Case · Lucky65 V3 65% CNC Aluminum Case]
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM492. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM578. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM507. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 4 ---
CUSTOMER (chat): so build 1 softer typing and cheaper? i want nice to type and not loud.
APP REPLY: To make your build softer and quieter while saving money, focus on switches and stabilizers. Akko Lavender Purple V3 Pro switches have a neutral sound, but softer or silent switches generally cost less and reduce noise more. Also, tuning or lubing your stabilizers really cuts down rattle without extra cost. Your current polycarbonate plate already helps soften the typing feel, so keep that. For cheaper but quieter typing, try switching to a budget silent switch or lube your stabilizers well—those changes give the best soft and quiet typing without raising costs much.
[Part chips under Meg's reply: Akko Lavender Purple V3 Pro Tactile Switch · SP-Star Plate-Mounted Stabilizers · GH60 Polycarbonate Plate]
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM492. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM578. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM507. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 5 ---
CUSTOMER (chat): can u just show me cheaper and soft switch build? budget maybe 400?
APP REPLY: Current parts: case GH60 CNC Aluminum Case, PCB GH60 MX Hotswap PCB, plate GH60 Polycarbonate Plate, switch Akko Lavender Purple V3 Pro Tactile Switch, keycaps Pudding OEM PBT Keycaps, stabilizers SP-Star Plate-Mounted Stabilizers.  The current parts are fully compatible. Switches, keycaps, and standalone stabilizers are usually the easiest places to save. The safest route is a fresh search with a lower budget so every swap stays verified — I won't guess at cheaper parts I can't confirm from the catalog.
[Part chips under Meg's reply: GH60 Polycarbonate Plate · Akko Lavender Purple V3 Pro Tactile Switch · SP-Star Plate-Mounted Stabilizers]
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM492. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM578. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Lavender Purple V3 Pro Tactile Switch, total RM507. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Lavender Purple V3 Pro Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 6 ---
CUSTOMER (search): nice keyboard, budget 400, soft and quiet typing, clean look pls simple.
APP REPLY: (3 build cards shown; no other reply text)
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM551. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM637. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM566. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 7 ---
CUSTOMER (chat): all over 500, i said 400 max. why so expensive?
APP REPLY: Good news — every part in this build is compatible: GH60 CNC Aluminum Case, GH60 MX Hotswap PCB, GH60 Polycarbonate Plate, Akko Penguin Silent Tactile Switch, Pudding OEM PBT Keycaps, SP-Star Plate-Mounted Stabilizers.
[Part chips under Meg's reply: GH60 CNC Aluminum Case]
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM551. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM637. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM566. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- Turn 8 ---
CUSTOMER (give_up): (leaves)
APP REPLY: -
BUILDS ON SCREEN:
Build 1 (selected): GH60 CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM551. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Polycarbonate Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 2: Lucky65 V3 65% CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM637. Parts: case Lucky65 V3 65% CNC Aluminum Case; pcb Lucky65 V3 65% Tri-Mode Hotswap PCB; plate Lucky65 V3 65% Brass Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer C3 Equalz Screw-In Stabilizers V3. Card says: "This build passed deterministic compatibility validation before being recommended."
Build 3: GH60 CNC Aluminum Case with Akko Penguin Silent Tactile Switch, total RM566. Parts: case GH60 CNC Aluminum Case; pcb GH60 MX Hotswap PCB; plate GH60 Aluminum Plate; switch Akko Penguin Silent Tactile Switch; keycap Pudding OEM PBT Keycaps; stabilizer SP-Star Plate-Mounted Stabilizers. Card says: "This build passed deterministic compatibility validation before being recommended."

--- End: give_up ---
```