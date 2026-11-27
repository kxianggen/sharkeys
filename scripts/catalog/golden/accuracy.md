# Importer accuracy on the golden set (golden-20.csv)

Accuracy (values it gave that were right): **90.1%** · coverage (golden values it found): 97.0% · cells you corrected: 17

| field | correct | wrong | missed (said unknown) | unknown & page silent | accuracy |
|---|---|---|---|---|---|
| actuationForceG | 4 | 0 | 0 | 2 | 100.0% |
| beginnerFriendly | 15 | 3 | 0 | 2 | 83.3% |
| brand | 18 | 2 | 0 | 0 | 90.0% |
| connection | 4 | 0 | 1 | 0 | 100.0% |
| hotswap | 4 | 0 | 0 | 1 | 100.0% |
| keycapProfile | 6 | 0 | 0 | 0 | 100.0% |
| layouts | 9 | 0 | 1 | 4 | 100.0% |
| mountSupport | 3 | 0 | 2 | 0 | 100.0% |
| pinCount | 6 | 0 | 0 | 0 | 100.0% |
| plateMaterial | 2 | 2 | 0 | 1 | 50.0% |
| price | 18 | 0 | 0 | 2 | 100.0% |
| soundProfile | 4 | 2 | 0 | 5 | 66.7% |
| stabilizerSizes | 3 | 1 | 0 | 4 | 75.0% |
| stabilizerType | 4 | 2 | 0 | 2 | 66.7% |
| stabilizerTypeSupport | 2 | 1 | 0 | 2 | 66.7% |
| switchTechnology | 6 | 0 | 0 | 0 | 100.0% |
| switchTechnologySupport | 10 | 0 | 0 | 1 | 100.0% |
| **all** | 118 | 13 | 4 | 26 | **90.1%** |

## Wrong values (the dangerous ones)
- `mecha:akko-mod006-diy-barebones-kit` stabilizerType: importer "screw_in", correct ""
- `mecha:akko-mod006-diy-barebones-kit` plateMaterial: importer "polycarbonate", correct ""
- `mecha:weikav-max-102-98-barebones-keyboard-kit` beginnerFriendly: importer "true", correct ""
- `mecha:everglide-v3-transparent-gold-plated-screw-in-stabilizers` brand: importer "Everglide", correct "durock"
- `mecha:durock-shrimp-silent-tactile-switches` brand: importer "JWK", correct "durock"
- `mecha:weikav-stars80-tkl-barebones-keyboard-kit` beginnerFriendly: importer "true", correct ""
- `mecha:weikav-stars80-tkl-barebones-keyboard-kit` stabilizerTypeSupport: importer "plate_mount", correct ""
- `mecha:weikav-stars80-tkl-barebones-keyboard-kit` stabilizerType: importer "plate_mount", correct ""
- `mecha:weikav-stars80-tkl-barebones-keyboard-kit` soundProfile: importer "thocky", correct ""
- `mecha:sw-x-haimu-mp-tactile-switches` soundProfile: importer "clacky", correct ""
- `mecha:qk65-mk3-65-custom-keyboard-kit` beginnerFriendly: importer "true", correct ""
- `mecha:qk65-mk3-65-custom-keyboard-kit` stabilizerSizes: importer "2u;6.25u;7u", correct ""
- `mecha:pre-order-extras-neo75-wireless-75-keyboard-kit` plateMaterial: importer "aluminum", correct ""
