/* ===== PODACI: mišići i vežbe =====
   primary = glavni mišić, secondary = pomoćni. equip: 'bez' ili 'teg'.
   a/b = početna i završna poza (uglovi u stepenima, 0 = desno, 90 = dole, -90 = gore). */
const MUSCLES = {
  'prednje-rame': { label: 'Prednje rame' },
  'srednje-rame': { label: 'Srednje rame' },
  'zadnje-rame': { label: 'Zadnje rame' },
  'grudi': { label: 'Grudi' },
  'leda': { label: 'Leđa' },
  'biceps': { label: 'Biceps' },
  'triceps': { label: 'Triceps' },
  'podlaktice': { label: 'Podlaktice' },
  'core': { label: 'Stomak i core' },
  'noge': { label: 'Noge' },
  'listovi': { label: 'Listovi' },
  'zadnjica': { label: 'Zadnjica' }
};

const EQUIP = { bez: 'Bez tegova', teg: 'Bučice' };

const EXERCISES = [
  {
    id: 'prednje', name: 'Prednje podizanje bučica',
    primary: ['prednje-rame'], secondary: ['grudi'], equip: 'teg', level: 'Početnik',
    sets: 3, reps: 12, unit: 'pon',
    cue: 'Ruke vode pokret, trup miruje.',
    view: 'side', hl: ['upper'], blob: ['shoulder'],
    a: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 84, fore: 86 },
    b: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: -4, fore: -14 },
    steps: [
      'Stani uspravno, stopala u širini kukova. Bučice drži ispred butina, dlanovi gledaju ka telu.',
      'Zategni stomak i blago savij laktove.',
      'Podigni ruke ispred sebe do visine ramena, bez zanošenja trupa.',
      'Zadrži trenutak na vrhu, pa spuštaj polako oko 2 do 3 sekunde.'
    ],
    mistakes: [
      'Zamah trupom. Bučice su pretežke, uzmi lakše.',
      'Dizanje iznad visine ramena, što samo opterećuje vrat.',
      'Ramena podignuta ka ušima.'
    ]
  },
  {
    id: 'potisak', name: 'Potisak bučicama iznad glave',
    primary: ['prednje-rame', 'srednje-rame'], secondary: ['triceps'], equip: 'teg', level: 'Srednji',
    sets: 3, reps: 10, unit: 'pon',
    cue: 'Rebra dole, zadnjica stegnuta.',
    view: 'side', hl: ['upper'], blob: ['shoulder'],
    a: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 78, fore: -86 },
    b: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: -88, fore: -90 },
    steps: [
      'Podigni bučice na visinu ramena, laktovi ispod šaka, dlanovi gledaju napred.',
      'Stegni zadnjicu i stomak, rebra drži spuštena.',
      'Potisni bučice pravo uvis dok ruke nisu skoro ispružene.',
      'Spusti kontrolisano nazad do visine ramena.'
    ],
    mistakes: [
      'Preterano izvijanje u donjim leđima.',
      'Potpuno zaključavanje laktova na vrhu.',
      'Laktovi previše razmaknuti ili previše napred.'
    ]
  },
  {
    id: 'bocno', name: 'Bočno podizanje bučica',
    primary: ['srednje-rame'], secondary: ['prednje-rame'], equip: 'teg', level: 'Početnik',
    sets: 3, reps: 12, unit: 'pon',
    cue: 'Laktovi vode, šake prate.',
    view: 'front', hl: ['upper'], blob: ['delts'],
    a: { abd: 9, abdF: 6, stance: 14 },
    b: { abd: 84, abdF: 72, stance: 14 },
    steps: [
      'Stani uspravno, bučice uz telo, laktovi blago savijeni.',
      'Podigni ruke u stranu do visine ramena, laktovi vode pokret.',
      'Šake ne idu više od laktova.',
      'Spuštaj polako, bez ispuštanja bučica uz telo.'
    ],
    mistakes: [
      'Ramena se podižu ka ušima.',
      'Zamah celim telom umesto kontrole.',
      'Šake više od laktova, pa rame radi pogrešno.'
    ]
  },
  {
    id: 'sklekovi', name: 'Sklekovi (standardni)',
    primary: ['grudi'], secondary: ['triceps', 'prednje-rame', 'core'], equip: 'bez', level: 'Početnik',
    sets: 3, reps: 10, unit: 'pon', toe: true,
    cue: 'Telo ravno kao daska.',
    view: 'side', hl: ['upper'], blob: ['chest'],
    a: { ax: 34, shin: -21, thigh: -21, torso: -21, hand: [166, 182], bend: -1, tilt: -12 },
    b: { ax: 34, shin: -3, thigh: -3, torso: -3, hand: [166, 182], bend: -1, tilt: -12 },
    steps: [
      'Dlanovi na podu, malo šire od ramena. Telo u pravoj liniji od glave do peta.',
      'Zategni stomak i zadnjicu.',
      'Spusti grudi ka podu, laktovi pod uglom od oko 45° u odnosu na telo.',
      'Potisni se nazad do ispruženih ruku.'
    ],
    mistakes: [
      'Spuštena karlica ili podignuta zadnjica.',
      'Laktovi razmaknuti pod 90°, što opterećuje ramena.',
      'Nepotpun opseg pokreta.'
    ]
  },
  {
    id: 'pike', name: 'Pike sklekovi',
    primary: ['prednje-rame'], secondary: ['srednje-rame', 'triceps'], equip: 'bez', level: 'Srednji',
    sets: 3, reps: 8, unit: 'pon', toe: true,
    cue: 'Teme ide ka podu između šaka.',
    view: 'side', hl: ['upper'], blob: ['shoulder'],
    a: { ax: 56, shin: -74, thigh: -66, torso: 60, hand: [142, 182], bend: -1, tilt: 10 },
    b: { ax: 56, shin: -52, thigh: -50, torso: 66, hand: [142, 182], bend: -1, tilt: 10 },
    steps: [
      'Postavi se u obrnuto V: kukovi visoko, ruke i noge skoro ispružene.',
      'Glavu drži između ruku, pogled ka stopalima.',
      'Savij laktove i spusti teme ka podu.',
      'Potisni se nazad do ispruženih ruku, kukovi ostaju visoko.'
    ],
    mistakes: [
      'Kukovi se spuste i pokret postane običan sklek.',
      'Laktovi se razmaknu u stranu.',
      'Stopala preblizu rukama, pa nema dovoljno ugla.'
    ]
  },
  {
    id: 'veslanje', name: 'Veslanje bučicama pognuto',
    primary: ['leda'], secondary: ['biceps', 'zadnje-rame'], equip: 'teg', level: 'Srednji',
    sets: 4, reps: 15, unit: 'pon',
    cue: 'Vuci laktove ka kukovima.',
    view: 'side', hl: ['upper'], blob: ['back'],
    a: { ax: 112, shin: -78, thigh: -125, torso: -40, tilt: 25, upper: 90, fore: 90 },
    b: { ax: 112, shin: -78, thigh: -125, torso: -40, tilt: 25, upper: 150, fore: 95 },
    steps: [
      'Blago savij kolena i nagni trup napred, leđa ravna. Bučice vise ispod ramena.',
      'Povuci laktove unazad ka kukovima i stisni lopatice.',
      'Zadrži trenutak na vrhu.',
      'Polako spusti bučice do ispruženih ruku.'
    ],
    mistakes: [
      'Zaobljena leđa.',
      'Vuče se rukama umesto laktovima.',
      'Trup se podiže sa svakim ponavljanjem.'
    ]
  },
  {
    id: 'pregib', name: 'Pregib bučicama (supinacija)',
    primary: ['biceps'], secondary: ['podlaktice'], equip: 'teg', level: 'Početnik',
    sets: 4, reps: 12, unit: 'pon',
    cue: 'Laktovi se ne pomeraju.',
    view: 'side', hl: ['fore'], blob: ['biceps'],
    a: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 90, fore: 88 },
    b: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 96, fore: -68 },
    steps: [
      'Stani uspravno, laktovi uz telo, dlanovi gledaju napred.',
      'Savij laktove i podigni bučice ka ramenima.',
      'Stegni biceps na vrhu.',
      'Spusti kontrolisano do potpuno ispruženih ruku.'
    ],
    mistakes: [
      'Zamah trupom pri dizanju.',
      'Laktovi odlaze napred.',
      'Prebrzo spuštanje, gubi se pola efekta.'
    ]
  },
  {
    id: 'cucanj', name: 'Čučanj',
    primary: ['noge', 'zadnjica'], secondary: ['core'], equip: 'bez', level: 'Početnik',
    sets: 4, reps: 15, unit: 'pon',
    cue: 'Sedi nazad, grudi gore.',
    view: 'side', hl: ['thigh'], blob: ['quad', 'glute'],
    a: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: -4, fore: -4 },
    b: { ax: 112, shin: -64, thigh: 184, torso: -52, upper: -4, fore: -4 },
    steps: [
      'Stopala malo šira od ramena, prsti blago okrenuti napolje.',
      'Kukove povuci nazad i dole, kao da sedaš na stolicu. Grudi gore.',
      'Spusti se dok butine nisu paralelne sa podom.',
      'Odgurni se petama nazad u uspravan stav.'
    ],
    mistakes: [
      'Kolena upadaju ka unutra.',
      'Pete se odižu od poda.',
      'Zaobljena leđa na dnu pokreta.'
    ]
  },
  {
    id: 'iskorak', name: 'Iskorak',
    primary: ['noge', 'zadnjica'], secondary: ['core'], equip: 'bez', level: 'Početnik',
    sets: 3, reps: 10, unit: 'pon', per: 'po nozi', farToe: true,
    cue: 'Zadnje koleno ide ka podu.',
    view: 'side', hl: ['thigh'], blob: ['quad', 'glute'],
    a: { ax: 150, shin: -119, thigh: -119, torso: -90, upper: 84, fore: 86, farAnkle: 56, farBend: 1 },
    b: { ax: 150, shin: -88, thigh: 182, torso: -90, upper: 84, fore: 86, farAnkle: 56, farBend: 1 },
    steps: [
      'Iskorači napred, zadnja noga ostaje na prstima. Trup uspravan.',
      'Spusti zadnje koleno ka podu dok oba kolena nisu oko 90°.',
      'Prednje koleno drži iznad članka.',
      'Odgurni se prednjom petom nazad u početni položaj.'
    ],
    mistakes: [
      'Prekratak korak, pa koleno ide daleko preko prstiju.',
      'Trup se naginje napred.',
      'Prednje koleno upada ka unutra.'
    ]
  },
  {
    id: 'plank', name: 'Plank na podlakticama',
    primary: ['core'], secondary: ['prednje-rame', 'zadnjica'], equip: 'bez', level: 'Početnik',
    sets: 3, reps: 40, unit: 'sek', toe: true,
    cue: 'Diši mirno, kukovi ne padaju.',
    view: 'side', hl: [], blob: ['core'],
    a: { ax: 30, shin: -9, thigh: -9, torso: -9, hand: [199, 182], bend: -1, tilt: -8 },
    b: { ax: 30, shin: -9.5, thigh: -10.5, torso: -8, hand: [199, 182], bend: -1, tilt: -8 },
    steps: [
      'Podlaktice na podu, laktovi tačno ispod ramena.',
      'Telo u pravoj liniji od glave do peta, stomak i zadnjica zategnuti.',
      'Diši ravnomerno i ne spuštaj kukove.',
      'Drži zadati broj sekundi.'
    ],
    mistakes: [
      'Spuštena karlica, što opterećuje donja leđa.',
      'Podignuta zadnjica.',
      'Zadržavanje daha i pognuta glava.'
    ]
  },
  /* ===== vežbe iz tvog plana ===== */
  {
    id: 'kosi-sklekovi', name: 'Kosi sklekovi (noge na klupi)',
    primary: ['grudi'], secondary: ['prednje-rame', 'triceps'], equip: 'bez', level: 'Srednji',
    sets: 5, reps: 10, unit: 'pon', toe: true,
    cue: 'Noge više od ruku, naglasak na gornje grudi.',
    view: 'side', hl: ['upper'], blob: ['chest'],
    props: [{ x: 0, y: 146, w: 54, h: 7, legs: true }],
    a: { ax: 25, lift: 40, shin: -4.4, thigh: -4.4, torso: -4.4, hand: [166, 182], bend: -1, tilt: -12 },
    b: { ax: 25, lift: 40, shin: 11.4, thigh: 11.4, torso: 11.4, hand: [166, 182], bend: -1, tilt: -12 },
    steps: [
      'Stavi stopala na klupu ili stabilnu stolicu, dlanovi na podu malo šire od ramena.',
      'Telo drži u pravoj liniji, stomak i zadnjica zategnuti.',
      'Spusti grudi ka podu, laktovi pod uglom od oko 45° u odnosu na telo.',
      'Potisni se nazad do ispruženih ruku.'
    ],
    mistakes: [
      'Savijena leđa i spuštena karlica.',
      'Laktovi široko u stranu, što opterećuje ramena.',
      'Previsoka klupa, pa rame preuzme previše posla.'
    ]
  },
  {
    id: 'siroki-sklekovi', name: 'Široki sklekovi',
    primary: ['grudi'], secondary: ['prednje-rame', 'triceps'], equip: 'bez', level: 'Srednji',
    sets: 4, reps: 20, unit: 'pon', toe: true,
    cue: 'Dlanovi znatno šire od ramena.',
    view: 'side', hl: ['upper'], blob: ['chest'],
    a: { ax: 34, shin: -21, thigh: -21, torso: -21, hand: [166, 182], bend: -1, tilt: -12 },
    b: { ax: 34, shin: -3, thigh: -3, torso: -3, hand: [166, 182], bend: -1, tilt: -12 },
    steps: [
      'Postavi dlanove na pod, oko dve širine ramena razmaka, prsti blago napolje.',
      'Telo u pravoj liniji od glave do peta, stomak zategnut.',
      'Spuštaj grudi ka podu dok laktovi ne prođu oko 90°.',
      'Potisni se nazad i na vrhu blago stegni grudi.'
    ],
    mistakes: [
      'Preširok hvat opterećuje ramena i skraćuje pokret.',
      'Glava pada napred umesto da prati liniju tela.',
      'Pokret nije potpun, grudi ne idu dovoljno nisko.'
    ]
  },
  {
    id: 'dijamant', name: 'Dijamant sklekovi',
    primary: ['triceps'], secondary: ['grudi', 'prednje-rame'], equip: 'bez', level: 'Srednji',
    sets: 5, reps: 10, unit: 'pon', toe: true,
    cue: 'Šake spojene ispod grudi, laktovi uz telo.',
    view: 'side', hl: ['upper'], blob: ['triceps'],
    a: { ax: 30, shin: -21, thigh: -21, torso: -21, hand: [162, 182], bend: -1, tilt: -12 },
    b: { ax: 30, shin: -3, thigh: -3, torso: -3, hand: [162, 182], bend: -1, tilt: -12 },
    steps: [
      'Spoji palčeve i kažiprste u oblik romba, šake ispod grudne kosti.',
      'Telo ravno kao daska, stomak zategnut.',
      'Spusti grudi ka šakama, laktovi ostaju blizu rebara.',
      'Potisni se do ispruženih ruku i stegni triceps.'
    ],
    mistakes: [
      'Laktovi se razmiču u stranu, pa triceps radi manje.',
      'Karlica propada, što opterećuje donja leđa.',
      'Šake predaleko napred, pa zglobovi trpe.'
    ]
  },
  {
    id: 'skok-cucanj', name: 'Čučanj sa skokom',
    primary: ['noge', 'zadnjica'], secondary: ['listovi', 'core'], equip: 'bez', level: 'Srednji',
    sets: 5, reps: 10, unit: 'pon', toe: true,
    cue: 'Eksplozivno gore, meko dole.',
    view: 'side', hl: ['thigh'], blob: ['quad', 'glute'],
    a: { ax: 112, lift: 0, shin: -64, thigh: -176, torso: -52, upper: 125, fore: 110 },
    b: { ax: 112, lift: 22, shin: -90, thigh: -90, torso: -90, upper: -75, fore: -80 },
    steps: [
      'Stopala u širini ramena, spusti se u čučanj, ruke zamahnu unazad.',
      'Eksplozivno se odgurni i skoči uvis, ruke idu gore.',
      'Doskoči na prednji deo stopala, kolena savijena.',
      'Odmah pređi u sledeći čučanj, dok kontrola dozvoljava.'
    ],
    mistakes: [
      'Tvrd doskok sa ispruženim nogama opterećuje kolena.',
      'Kolena upadaju ka unutra pri doskoku.',
      'Plitak čučanj, pa se gubi snaga skoka.'
    ]
  },
  {
    id: 'sumo', name: 'Sumo čučanj',
    primary: ['noge', 'zadnjica'], secondary: ['core'], equip: 'bez', level: 'Početnik',
    sets: 4, reps: 20, unit: 'pon',
    cue: 'Kolena prate pravac prstiju.',
    view: 'front', hl: ['thigh'], blob: ['quad'],
    a: { drop: 0, stance: 30, abd: -15, abdF: -162 },
    b: { drop: 34, stance: 30, abd: -15, abdF: -162 },
    steps: [
      'Stopala znatno šira od ramena, prsti okrenuti napolje oko 45°. Šake sastavi ispred grudi.',
      'Spusti se uspravnog trupa, kolena idu u pravcu prstiju.',
      'Dole zadrži trenutak, butine blizu paralelne sa podom.',
      'Odgurni se petama i na vrhu stegni zadnjicu.'
    ],
    mistakes: [
      'Kolena upadaju ka unutra.',
      'Trup se naginje napred i zaobljuju se leđa.',
      'Plitak pokret, kukovi ne idu dovoljno nisko.'
    ]
  },
  {
    id: 'iskorak-nazad', name: 'Iskorak unazad',
    primary: ['noge', 'zadnjica'], secondary: ['core'], equip: 'bez', level: 'Početnik',
    sets: 3, reps: 20, unit: 'pon', per: 'po nozi',
    cue: 'Korak nazad, trup uspravan.',
    view: 'side', hl: ['thigh'], blob: ['quad', 'glute'],
    a: { ax: 150, shin: -90, thigh: -90, torso: -90, upper: 84, fore: 86, farAnkle: 146, farUp: 0 },
    b: { ax: 150, shin: -88, thigh: -178, torso: -90, upper: 84, fore: 86, farAnkle: 56, farUp: 8, farBend: 1 },
    steps: [
      'Stani uspravno, stopala u širini kukova.',
      'Zakorači jednom nogom unazad i spusti zadnje koleno ka podu.',
      'Prednja butina ostaje otprilike paralelna sa podom, trup uspravan.',
      'Odgurni se prednjom petom i vrati nogu uz drugu.'
    ],
    mistakes: [
      'Prekratak korak unazad, pa koleno ide preko prstiju.',
      'Trup se naginje napred.',
      'Zadnje koleno udara u pod.'
    ]
  },
  {
    id: 'most', name: 'Podizanje karlice (glute bridge)',
    primary: ['zadnjica'], secondary: ['noge', 'core'], equip: 'bez', level: 'Početnik',
    sets: 3, reps: 10, unit: 'pon',
    cue: 'Podigni karlicu stezanjem zadnjice.',
    view: 'side', hl: ['thigh'], blob: ['glute'],
    a: { ax: 190, shin: -131, thigh: 131, torso: 180, tilt: 12, upper: 0, fore: 0 },
    b: { ax: 190, shin: -112, thigh: 153.6, torso: 153.6, tilt: 26, upper: 0, fore: 0 },
    steps: [
      'Lezi na leđa, kolena savijena, stopala ravno na podu blizu zadnjice.',
      'Ruke položi pored tela, dlanovima na pod.',
      'Gurni pete u pod i podigni karlicu dok telo od ramena do kolena ne bude u liniji.',
      'Na vrhu stegni zadnjicu, pa polako spusti.'
    ],
    mistakes: [
      'Preterano izvijanje u donjim leđima umesto rada zadnjice.',
      'Kolena se razmiču ili upadaju ka unutra.',
      'Guranje prstima umesto petama.'
    ]
  },
  {
    id: 'listovi', name: 'Podizanje na prste (listovi)',
    primary: ['listovi'], secondary: [], equip: 'bez', level: 'Početnik',
    sets: 1, reps: 30, unit: 'pon',
    cue: 'Do kraja gore, sporo dole.',
    view: 'side', hl: ['shin'], blob: ['calf'],
    a: { ax: 112, lift: 0, shin: -90, thigh: -90, torso: -90, upper: 84, fore: 86 },
    b: { ax: 112, lift: 13, shin: -90, thigh: -90, torso: -90, upper: 84, fore: 86 },
    steps: [
      'Stani uspravno, stopala u širini kukova. Možeš da se pridržiš za zid.',
      'Podigni pete što više možeš, oslonjen na prednji deo stopala.',
      'Zadrži trenutak na vrhu i stegni listove.',
      'Spuštaj pete polako, 2 do 3 sekunde.'
    ],
    mistakes: [
      'Brzo spuštanje, gubi se pola efekta.',
      'Gležnjevi se uvijaju ka unutra ili napolje.',
      'Nepotpun pokret, pete ne idu dovoljno visoko.'
    ]
  },
  {
    id: 'noge-lezeci', name: 'Podizanje nogu u ležanju',
    primary: ['core'], secondary: ['noge'], equip: 'bez', level: 'Srednji',
    sets: 3, reps: 15, unit: 'pon',
    cue: 'Donja leđa ostaju pritisnuta uz pod.',
    view: 'side', lying: true, hl: ['thigh'], blob: ['core'],
    a: { hx: 135, torso: 180, tilt: 12, upper: 0, fore: 0, hk: -6, ka: -6 },
    b: { hx: 135, torso: 180, tilt: 12, upper: 0, fore: 0, hk: -90, ka: -90 },
    steps: [
      'Lezi na leđa, ruke pored tela ili ispod kukova, noge ispružene.',
      'Zategni stomak i podigni noge do uspravnog položaja.',
      'Spuštaj ih polako dok ne budu tik iznad poda, bez odmaranja.',
      'Donja leđa cele vežbe ostaju na podu.'
    ],
    mistakes: [
      'Izvijanje donjih leđa kad se noge spuste.',
      'Zamah nogama umesto kontrole stomakom.',
      'Savijena kolena, što skraćuje polugu i olakšava vežbu.'
    ]
  },
  {
    id: 'makazice', name: 'Makazice (flutter kicks)',
    primary: ['core'], secondary: ['noge'], equip: 'bez', level: 'Srednji',
    sets: 3, reps: 15, unit: 'pon',
    cue: 'Male, brze izmene, stomak stalno napet.',
    view: 'side', lying: true, hl: ['thigh'], blob: ['core'],
    a: { hx: 135, torso: 184, tilt: 14, upper: 0, fore: 0, hk: -38, ka: -38, fhk: -20, fka: -20 },
    b: { hx: 135, torso: 184, tilt: 14, upper: 0, fore: 0, hk: -20, ka: -20, fhk: -38, fka: -38 },
    steps: [
      'Lezi na leđa, ruke ispod kukova, noge ispružene i podignute nekoliko centimetara od poda.',
      'Naizmenično podižeš i spuštaš noge malim, brzim pokretima.',
      'Donja leđa drži na podu, glava blago podignuta.',
      'Diši ravnomerno i ne spuštaj noge do poda.'
    ],
    mistakes: [
      'Izvijanje donjih leđa.',
      'Preveliki raspon pokreta, pa se gubi napetost stomaka.',
      'Zadržavanje daha.'
    ]
  },
  {
    id: 'bicikl', name: 'Bicikl trbušnjaci',
    primary: ['core'], secondary: [], equip: 'bez', level: 'Srednji',
    sets: 3, reps: 20, unit: 'pon',
    cue: 'Lakat ide ka suprotnom kolenu.',
    view: 'side', lying: true, hl: ['thigh'], blob: ['core'],
    a: { hx: 135, torso: 205, tilt: -15, hand: [74, 152], bend: -1, hk: -118, ka: -25, fhk: -14, fka: -14 },
    b: { hx: 135, torso: 205, tilt: -15, hand: [74, 152], bend: -1, hk: -14, ka: -14, fhk: -118, fka: -25 },
    steps: [
      'Lezi na leđa, šake iza glave, laktovi široko. Ramena podigni od poda.',
      'Privuci jedno koleno ka grudima, a drugu nogu ispruži iznad poda.',
      'Zarotiraj trup tako da suprotni lakat ide ka kolenu.',
      'Menjaj strane u kontrolisanom ritmu, bez povlačenja vrata.'
    ],
    mistakes: [
      'Vučenje glave rukama.',
      'Prebrzo okretanje, bez stvarne rotacije trupa.',
      'Ispružena noga je previše blizu poda ili previsoko.'
    ]
  },
  {
    id: 'toe-touch', name: 'Dodirivanje prstiju (toe touches)',
    primary: ['core'], secondary: [], equip: 'bez', level: 'Početnik',
    sets: 3, reps: 15, unit: 'pon',
    cue: 'Podigni ramena i posegni ka prstima.',
    view: 'side', lying: true, hl: [], blob: ['core'],
    a: { hx: 120, torso: 190, tilt: 0, hand: [72, 104], bend: -1, hk: -90, ka: -90 },
    b: { hx: 120, torso: 232, tilt: -20, hand: [116, 92], bend: -1, hk: -90, ka: -90 },
    steps: [
      'Lezi na leđa, noge ispružene uvis pod 90°, ruke ispružene ka plafonu.',
      'Zategni stomak i podigni ramena od poda, ruke idu ka stopalima.',
      'Zadrži trenutak na vrhu.',
      'Polako spusti ramena nazad na pod.'
    ],
    mistakes: [
      'Zamah rukama umesto rada stomaka.',
      'Podizanje glave vukući se za vrat.',
      'Noge se klate napred i nazad.'
    ]
  },
  {
    id: 'ruski', name: 'Ruski obrtaji (russian twist)',
    primary: ['core'], secondary: [], equip: 'bez', level: 'Srednji',
    sets: 3, reps: 20, unit: 'pon',
    cue: 'Okreće se ceo trup, ne samo ruke.',
    view: 'side', lying: true, hl: [], blob: ['core'],
    a: { hx: 120, torso: -118, tilt: 20, hand: [127, 142], bend: -1, hk: -48, ka: 8 },
    b: { hx: 120, torso: -118, tilt: 20, hand: [101, 150], bend: -1, hk: -48, ka: 8 },
    steps: [
      'Sedi na pod, kolena savijena, nagni se unazad oko 45° sa ravnim leđima. Noge mogu biti u vazduhu.',
      'Šake sastavi ispred grudi.',
      'Zarotiraj trup na jednu stranu pa na drugu, ramena vode pokret.',
      'Brojiš svaku stranu, držeći stomak napet.'
    ],
    mistakes: [
      'Pomeraju se samo ruke, a trup ostaje miran.',
      'Zaobljena leđa.',
      'Prebrzo mahanje bez kontrole.'
    ]
  },
  {
    id: 'veslanje1', name: 'Veslanje jednom rukom',
    primary: ['leda'], secondary: ['biceps', 'zadnje-rame'], equip: 'teg', level: 'Početnik',
    sets: 4, reps: 15, unit: 'pon', per: 'po ruci',
    cue: 'Vuci lakat ka kuku, trup miran.',
    view: 'side', hl: ['upper'], blob: ['back'],
    props: [{ x: 128, y: 130, w: 66, h: 7, legs: true }],
    a: { ax: 112, shin: -78, thigh: -125, torso: -40, tilt: 25, upper: 90, fore: 90, fhand: [148, 127] },
    b: { ax: 112, shin: -78, thigh: -125, torso: -40, tilt: 25, upper: 150, fore: 95, fhand: [148, 127] },
    steps: [
      'Jednu šaku i koleno osloni na klupu, drugom rukom drži bučicu, leđa ravna.',
      'Povuci lakat unazad ka kuku i stisni lopaticu.',
      'Zadrži trenutak na vrhu.',
      'Polako spusti bučicu do potpuno ispružene ruke.'
    ],
    mistakes: [
      'Rotacija trupa za dodatni zamah.',
      'Vuče se rukom umesto laktom.',
      'Zaobljena leđa ili spuštena glava.'
    ]
  },
  {
    id: 'zadnje-fly', name: 'Razmah za zadnje rame (rear delt fly)',
    primary: ['zadnje-rame'], secondary: ['leda'], equip: 'teg', level: 'Srednji',
    sets: 4, reps: 20, unit: 'pon',
    cue: 'Laktovi vode, lopatice se približavaju.',
    view: 'front', hl: ['upper'], blob: ['delts'],
    a: { lean: 65, stance: 14, abd: 4, abdF: 2 },
    b: { lean: 65, stance: 14, abd: 84, abdF: 80 },
    steps: [
      'Nagni trup napred sa ravnim leđima, kolena blago savijena. Bučice vise ispod ramena.',
      'Podigni ruke u stranu, laktovi blago savijeni, vodiš laktovima.',
      'Na vrhu stegni lopatice i zadnje rame.',
      'Spusti polako, bez zamaha.'
    ],
    mistakes: [
      'Zamah trupom da se podignu teške bučice.',
      'Ruke se podižu iznad visine leđa.',
      'Previše teške bučice, pa rade leđa umesto ramena.'
    ]
  },
  {
    id: 'pullover', name: 'Pullover bučicom',
    primary: ['leda', 'grudi'], secondary: ['triceps'], equip: 'teg', level: 'Srednji',
    sets: 4, reps: 15, unit: 'pon',
    cue: 'Ruke skoro ispružene, luk iznad glave.',
    view: 'side', lying: true, flatFeet: true, hl: ['upper'], blob: ['chest', 'back'],
    a: { hx: 125, torso: 180, tilt: 12, hk: -55, ka: 55.7, upper: 190, fore: 192 },
    b: { hx: 125, torso: 180, tilt: 12, hk: -55, ka: 55.7, upper: -90, fore: -90 },
    steps: [
      'Lezi na leđa, kolena savijena, stopala na podu. Bučicu drži obema rukama iznad grudi.',
      'Ruke blago savijene u laktovima, spuštaj bučicu u luku iza glave.',
      'Spusti dok ne osetiš istezanje u leđima i grudima.',
      'Vrati bučicu istim lukom iznad grudi.'
    ],
    mistakes: [
      'Savijanje laktova pa se pretvara u triceps vežbu.',
      'Izvijanje donjih leđa pri spuštanju.',
      'Preteška bučica koja povlači ramena.'
    ]
  },
  {
    id: 'hammer', name: 'Čekić pregib (hammer curl)',
    primary: ['biceps', 'podlaktice'], secondary: [], equip: 'teg', level: 'Početnik',
    sets: 4, reps: 15, unit: 'pon',
    cue: 'Dlanovi se gledaju, palac gore.',
    view: 'side', hl: ['fore'], blob: ['biceps'],
    a: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 90, fore: 88 },
    b: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 96, fore: -68 },
    steps: [
      'Stani uspravno, bučice drži neutralnim hvatom, dlanovi okrenuti jedan ka drugom.',
      'Laktovi uz telo, savij ruke i podigni bučice ka ramenima.',
      'Zadrži kratko na vrhu.',
      'Spusti polako do ispruženih ruku.'
    ],
    mistakes: [
      'Zamah trupom.',
      'Laktovi odlaze napred.',
      'Brzo spuštanje bez kontrole.'
    ]
  },
  {
    id: 'reverse-curl', name: 'Obrnuti pregib (reverse curl)',
    primary: ['podlaktice'], secondary: ['biceps'], equip: 'teg', level: 'Početnik',
    sets: 3, reps: 15, unit: 'pon',
    cue: 'Nadhvat, zglobovi ravni.',
    view: 'side', hl: ['fore'], blob: ['fore'],
    a: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 90, fore: 88 },
    b: { ax: 112, shin: -90, thigh: -90, torso: -90, upper: 96, fore: -68 },
    steps: [
      'Stani uspravno, bučice drži nadhvatom, dlanovi gledaju ka nogama.',
      'Laktovi uz telo, savij ruke i podigni bučice ka ramenima.',
      'Zglobovi ostaju ravni, ne savijaju se.',
      'Spusti polako do ispruženih ruku.'
    ],
    mistakes: [
      'Zglobovi popuštaju pa se bučice naginju.',
      'Preteška težina, pa se koristi zamah.',
      'Laktovi se pomeraju napred.'
    ]
  },
  {
    id: 'zglob', name: 'Pregib zgloba (wrist curl)',
    primary: ['podlaktice'], secondary: [], equip: 'teg', level: 'Početnik',
    sets: 3, reps: 20, unit: 'pon',
    cue: 'Radi samo zglob, podlaktica miruje.',
    view: 'side', hl: ['fore'], blob: ['fore'],
    props: [{ x: 48, y: 141, w: 60, h: 7, legs: true }],
    a: { ax: 120, shin: -90, thigh: -180, torso: -55, tilt: 10, hand: [142, 126], bend: -1, wrist: 70 },
    b: { ax: 120, shin: -90, thigh: -180, torso: -55, tilt: 10, hand: [142, 126], bend: -1, wrist: -45 },
    steps: [
      'Sedi na klupu, podlaktice osloni na butine, dlanovi okrenuti nagore. Šake vise preko kolena.',
      'Spusti bučice rastvarajući prste, zatim ih vrati u šaku.',
      'Savij zglob i podigni bučice što više možeš.',
      'Spusti polako, bez pomeranja podlaktica.'
    ],
    mistakes: [
      'Podlaktice se podižu sa butina.',
      'Preteška težina pa se pokret skraćuje.',
      'Prebrzi pokret bez pauze na vrhu.'
    ]
  },
  {
    id: 'zglob-rev', name: 'Obrnuti pregib zgloba (reverse wrist curl)',
    primary: ['podlaktice'], secondary: [], equip: 'teg', level: 'Početnik',
    sets: 3, reps: 20, unit: 'pon',
    cue: 'Dlanovi dole, zglob ide gore.',
    view: 'side', hl: ['fore'], blob: ['fore'],
    props: [{ x: 48, y: 141, w: 60, h: 7, legs: true }],
    a: { ax: 120, shin: -90, thigh: -180, torso: -55, tilt: 10, hand: [142, 126], bend: -1, wrist: 70 },
    b: { ax: 120, shin: -90, thigh: -180, torso: -55, tilt: 10, hand: [142, 126], bend: -1, wrist: -45 },
    steps: [
      'Sedi na klupu, podlaktice osloni na butine, dlanovi okrenuti nadole. Šake vise preko kolena.',
      'Spusti zglob, pa podigni bučice savijajući zglob nagore.',
      'Zadrži trenutak na vrhu.',
      'Spusti polako, podlaktice ostaju nepomične.'
    ],
    mistakes: [
      'Preteška težina, pa se pokret gubi.',
      'Podizanje podlaktica sa butina.',
      'Zamah umesto kontrole.'
    ]
  }
];
