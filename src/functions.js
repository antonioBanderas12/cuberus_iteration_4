export function manNavigation(view) {


  let isDragging = false;
  let prevMousePosition = { x: 0, y: 0 };
  
  const canvas = document.querySelector('canvas'); 
  
  canvas.addEventListener('wheel', (event) => {
    if (view === 1) {
      camera.position.y += event.deltaY * 0.1; 
    }

    if (view === 2) {
      camera.position.x += event.deltaY * 0.1; 
    }
  });
  
  canvas.addEventListener('mousedown', (event) => {
    if (view === 1) {
      isDragging = true;
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }

    if (view === 2) {
      isDragging = true;
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }
  });
  
  canvas.addEventListener('mousemove', (event) => {
    if (view === 1 && isDragging) {
      console.log(view)
      const deltaX = (event.clientX - prevMousePosition.x) * 0.1; // Adjust drag sensitivity
      const deltaY = (event.clientY - prevMousePosition.y) * 0.1;
  
      // Modify camera's x and z positions based on drag
      camera.position.x -= deltaX;
      camera.position.z -= deltaY;
  
      // Update previous mouse position
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }


    if (view === 2 && isDragging) {
      const deltaX = (event.clientX - prevMousePosition.x) * 0.1; // Adjust drag sensitivity
      const deltaY = (event.clientY - prevMousePosition.y) * 0.1;
  
      // Since the plane is rotated, modify the camera's z and y positions
      camera.position.z += deltaX;
      camera.position.y += deltaY;
  
      // Update previous mouse position
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    if (view === 1) isDragging = false;

    if (view === 2) isDragging = false;
  });
  
  canvas.addEventListener('mouseleave', () => {
    if (view === 1) isDragging = false;

    if (view === 2) isDragging = false;
  });
}










// const chaos = createBox(
//   "Chaos",
//   "The primeval void from which everything in existence sprang. Represents the initial state of emptiness before creation.",
//   "Immortal",
//   ""
// );

// const gaia = createBox(
//   "Gaia",
//   "Personification of the Earth and the mother of all life. She gave birth to the Titans, giants, and other primordial beings.",
//   "Immortal",
//   ""
// );

// const uranus = createBox(
//   "Uranus",
//   "Personification of the sky and the heavens. Known for fathering the Titans with Gaia.",
//   "Immortal",
//   ""
// );

// const cronus = createBox(
//   "Cronus",
//   "The youngest of the Titans who overthrew his father Uranus. Known as the god of time and the harvest.",
//   "Immortal",
//   ""
// );

// const rhea = createBox(
//   "Rhea",
//   "Titaness of fertility, motherhood, and generation. Known as the mother of the Olympian gods.",
//   "Immortal",
//   ""
// );

// const nyx = createBox(
//   "Nyx",
//   "Primordial goddess of the night. Known for her power and mysterious nature.",
//   "Immortal",
//   ""
// );

// const erebus = createBox(
//   "Erebus",
//   "Primordial deity representing darkness and shadow. One of the first entities to emerge from Chaos.",
//   "Immortal",
//   ""
// );

// const tartarus = createBox(
//   "Tartarus",
//   "Primordial deity and the deep abyss used as a dungeon for the Titans and a place of punishment.",
//   "Immortal",
//   ""
// );

// const pontus = createBox(
//   "Pontus",
//   "Primordial god of the sea. Represents the seas before Poseidon.",
//   "Immortal",
//   ""
// );

// const zeus = createBox(
//   "Zeus", 
//   "King of the gods, ruler of Mount Olympus, and god of the sky, weather, law, and order. Known for his thunderbolt and numerous affairs with mortals and goddesses.", 
//   "Immortal", 
//   ""
// );

// const hera = createBox(
//   "Hera", 
//   "Queen of the gods and goddess of marriage, women, childbirth, and family. Known for her jealousy and protection of married women.", 
//   "Immortal", 
//   ""
// );

// const poseidon = createBox(
//   "Poseidon", 
//   "God of the sea, earthquakes, storms, and horses. Known for his volatile temperament and rivalry with other gods.", 
//   "Immortal", 
//   ""
// );

// const hades = createBox(
//   "Hades", 
//   "God of the underworld and the dead. Rules over the souls of the departed and guards the treasures of the earth.", 
//   "Immortal", 
//   ""
// );

// const athena = createBox(
//   "Athena", 
//   "Goddess of wisdom, war, strategy, and crafts. Known for her intelligence, fairness, and role as a protector of cities.", 
//   "Immortal", 
//   ""
// );

// const aphrodite = createBox(
//   "Aphrodite", 
//   "Goddess of love, beauty, pleasure, and desire. Born from the sea foam and known for her irresistible charm.", 
//   "Immortal", 
//   ""
// );

// const heracles = createBox(
//   "Heracles", 
//   "Demigod hero known for his extraordinary strength and courage. Famous for completing the Twelve Labors.", 
//   "Demigod", 
//   ""
// );

// const achilles = createBox(
//   "Achilles", 
//   "Greek hero of the Trojan War, renowned for his strength, bravery, and near invincibility, except for his heel.", 
//   "Mortal", 
//   ""
// );

// const odysseus = createBox(
//   "Odysseus", 
//   "King of Ithaca, famed for his cunning intellect and resourcefulness. Hero of the Odyssey and the Trojan War.", 
//   "Mortal", 
//   ""
// );

// const nereus = createBox(
//   "Nereus",
//   "Primordial sea god known as the 'Old Man of the Sea.' Renowned for his truthfulness and gift of prophecy.",
//   "Immortal",
//   ""
// );

// const circe = createBox(
//   "Circe",
//   "Enchantress and sorceress, known for her ability to transform men into animals. Encountered by Odysseus during his travels.",
//   "Mortal",
//   ""
// );

// const apollo = createBox(
//   "Apollo",
//   "God of the sun, music, poetry, prophecy, and healing. Known for his beauty and wisdom.",
//   "Immortal",
//   ""
// );

// const ares = createBox(
//   "Ares",
//   "God of war and violence. Known for his bloodlust and quick temper.",
//   "Immortal",
//   ""
// );


// // helpers
// const alcmene = createBox(
//   "alcmene",
//   "",
//   "helperElement",
//   "extraElement",
// );

// const peleus = createBox(
//   "peleus",
//   "",
//   "helperElement",
//   "extraElement",
// );

// const thetis = createBox(
//   "thetis",
//   "",
//   "helperElement",
//   "extraElement",
// );

// const laertes = createBox(
//   "laertes",
//   "",
//   "helperElement",
//   "extraElement",
// );

// const anticleia = createBox(
//   "anticleia",
//   "",
//   "helperElement",
//   "extraElement",
// );

// const helios = createBox(
//   "helios",
//   "",
//   "helperElement",
//   "extraElement",
// );

// const leto = createBox(
//   "leto",
//   "",
//   "helperElement",
//   "extraElement",
// );







// enhanceBox(chaos, [cA], [
//   [gaia, "Brought forth Gaia, who personifies the Earth and gives structure to the cosmos."],
//   [nyx, "Generated Nyx, the goddess of night, who embodies the darkness of the void."]
// ]);

// enhanceBox(gaia, [chaos], [
//   [uranus, "Worked with Uranus to create the first generations of Titans and orchestrated his downfall when he imprisoned their children."],
//   [tartarus, "Conspired with Tartarus to imprison the giants and other rebellious beings."]
// ]);

// enhanceBox(uranus, [gaia], [
//   [cronus, "Was overthrown and castrated by his son Cronus, fulfilling a prophecy foretold by Gaia."]
// ]);

// enhanceBox(cronus, [uranus, gaia], [
//   [zeus, "Was defeated by Zeus in the Titanomachy, the great war between the Titans and the Olympian gods."],
//   [rhea, "Tricked by Rhea into swallowing a stone instead of Zeus, which led to his eventual downfall."]
// ]);

// enhanceBox(rhea, [uranus, gaia], [
//   [zeus, "Saved Zeus from being swallowed by Cronus by hiding him on Crete and later helped him overthrow Cronus."]
// ]);

// enhanceBox(nyx, [chaos], [
//   [erebus, "Together with Erebus, she gave birth to many deities representing cosmic forces, such as Hypnos and Thanatos."],
//   [zeus, "Even Zeus, the king of the gods, feared her immense power and mystery."]
// ]);

// enhanceBox(erebus, [chaos], [
//   [nyx, "Partnered with Nyx to produce deities of sleep, death, and other abstract forces."]
// ]);

// enhanceBox(tartarus, [chaos], [
//   [zeus, "Provided a prison for Zeus to imprison the defeated Titans after the Titanomachy."]
// ]);

// enhanceBox(pontus, [gaia], [
//   [nereus, "Fathered Nereus, the wise 'Old Man of the Sea,' known for his truthfulness and prophetic abilities."]
// ]);

// enhanceBox(zeus, [cronus, rhea], [
//   [hera, "Married to Hera, but their relationship was marked by conflict due to his many affairs."],
//   [cronus, "Led the Olympians in the Titanomachy to overthrow Cronus and the Titans."],
//   [tartarus, "Imprisoned the Titans in Tartarus after his victory."]
// ]);

// enhanceBox(hera, [cronus, rhea], [
//   [zeus, "Wife of Zeus, frequently punishes his lovers and their offspring out of jealousy."],
//   [heracles, "Tormented Heracles throughout his life because he was a son of Zeus and a mortal woman."],
//   [paris, "Instigated the Trojan War by seeking revenge on Paris for not naming her the fairest goddess."]
// ]);

// enhanceBox(poseidon, [cronus, rhea], [
//   [athena, "Competed with Athena for the patronage of Athens, losing when she offered the olive tree."],
//   [odysseus, "Punished Odysseus by making his journey home arduous after the hero blinded his son, the Cyclops Polyphemus."],
//   [apollo, "Worked with Apollo to build the walls of Troy, later seeking revenge when they were not paid for their labor."]
// ]);

// enhanceBox(hades, [cronus, rhea], [
//   [persephone, "Abducted Persephone to be his queen, leading to the creation of the seasons."],
//   [heracles, "Allowed Heracles to borrow his watchdog Cerberus as part of the hero's Twelve Labors."],
//   [orpheus, "Made a rare concession by allowing Orpheus to try to rescue his wife Eurydice from the underworld."]
// ]);

// enhanceBox(athena, [zeus], [
//   [poseidon, "Defeated Poseidon in a contest to become the patron of Athens by offering the olive tree."],
//   [odysseus, "Guided and protected Odysseus during his long journey home from the Trojan War."],
//   [arachne, "Turned the mortal Arachne into a spider for her hubris in a weaving contest."]
// ]);

// enhanceBox(aphrodite, [cA], [
//   [ares, "Had a long-standing affair with Ares, the god of war, despite being married to Hephaestus."],
//   [paris, "Influenced Paris to choose her as the fairest goddess by promising him Helen, leading to the Trojan War."],
//   [pygmalion, "Brought the statue crafted by Pygmalion to life as the woman Galatea."]
// ]);

// enhanceBox(heracles, [zeus, alcmene], [
//   [hera, "Suffered relentless persecution from Hera, who sought to destroy him."],
//   [cerberus, "Captured Cerberus, the three-headed guard dog of the underworld, as one of his Twelve Labors."],
//   [eurystheus, "Served King Eurystheus, who assigned him the Twelve Labors as penance."]
// ]);

// enhanceBox(achilles, [peleus, thetis], [
//   [patroclus, "Fought alongside his close companion Patroclus, whose death spurred his rage."],
//   [hector, "Killed Hector in revenge for Patroclus's death and desecrated his body."],
//   [agamemnon, "Quarreled with Agamemnon over the prize Briseis, leading to his temporary withdrawal from battle."]
// ]);

// enhanceBox(odysseus, [laertes, anticleia], [
//   [poseidon, "Angered Poseidon by blinding his son Polyphemus, causing a long and arduous journey home."],
//   [athena, "Protected and guided by Athena, who admired his cleverness."],
//   [circe, "Spent a year with the enchantress Circe, who initially turned his men into swine."]
// ]);

// enhanceBox(nereus, [pontus, gaia], [
//   [heracles, "Assisted Heracles by revealing the location of the golden apples of the Hesperides."]
// ]);

// enhanceBox(circe, [helios], [
//   [odysseus, "Turned Odysseus's men into swine, though later helped them on their journey."]
// ]);

// enhanceBox(apollo, [zeus, leto], [
//   [daphne, "Chased after the nymph Daphne, who transformed into a laurel tree to escape him."],
//   [asclepius, "Fathered Asclepius, the god of medicine, who could even raise the dead."]
// ]);
// enhanceBox(ares, [zeus, hera], [
//   [aphrodite, "Had an affair with Aphrodite, despite her marriage to Hephaestus."]
// ]);


// // helpers
// enhanceBox(alcmene, [null],[[]]);
// enhanceBox(peleus, [null],[[]]);
// enhanceBox(thetis, [null],[[]]);
// enhanceBox(laertes, [null],[[]]);
// enhanceBox(anticleia, [null],[[]]);
// enhanceBox(helios, [null],[[]]);
// enhanceBox(leto, [null],[[]]);















// const chaos = createBox(
//   "Chaos",
//   "The primeval void from which everything in existence sprang. Represents the initial state of emptiness before creation.",
//   "Immortal",
//   [cA],
//   [
//     [gaia, "Brought forth Gaia, who personifies the Earth and gives structure to the cosmos."],
//     [nyx, "Generated Nyx, the goddess of night, who embodies the darkness of the void."]
//   ],
//   "The source of all creation in Greek mythology.",
//   ""
// );

// const gaia = createBox(
//   "Gaia",
//   "Personification of the Earth and the mother of all life. She gave birth to the Titans, giants, and other primordial beings.",
//   "Immortal",
//   [chaos],
//   [
//     [uranus, "Worked with Uranus to create the first generations of Titans and orchestrated his downfall when he imprisoned their children."],
//     [tartarus, "Conspired with Tartarus to imprison the giants and other rebellious beings."]
//   ],
//   "Mother of the Titans and many other primordial deities.",
//   "Uranus, Pontus"
// );

// const uranus = createBox(
//   "Uranus",
//   "Personification of the sky and the heavens. Known for fathering the Titans with Gaia.",
//   "Immortal",
//   [gaia],
//   [
//     [cronus, "Was overthrown and castrated by his son Cronus, fulfilling a prophecy foretold by Gaia."]
//   ],
//   "Locked his children away, leading to his downfall.",
//   "Oceanus, Coeus, Crius, Hyperion, Iapetus, Theia, Rhea, Themis, Mnemosyne, Phoebe, Tethys, Cronus"
// );

// const cronus = createBox(
//   "Cronus",
//   "The youngest of the Titans who overthrew his father Uranus. Known as the god of time and the harvest.",
//   "Immortal",
//   [uranus, gaia],
//   [
//     [zeus, "Was defeated by Zeus in the Titanomachy, the great war between the Titans and the Olympian gods."],
//     [rhea, "Tricked by Rhea into swallowing a stone instead of Zeus, which led to his eventual downfall."]
//   ],
//   "Swallowed his children to prevent them from overthrowing him.",
//   "Oceanus, Coeus, Crius, Hyperion, Iapetus, Theia, Rhea, Themis, Mnemosyne, Phoebe, Tethys"
// );

// const rhea = createBox(
//   "Rhea",
//   "Titaness of fertility, motherhood, and generation. Known as the mother of the Olympian gods.",
//   "Immortal",
//   [uranus, gaia],
//   [
//     [zeus, "Saved Zeus from being swallowed by Cronus by hiding him on Crete and later helped him overthrow Cronus."]
//   ],
//   "Protected her children from Cronus by hiding Zeus.",
//   "Oceanus, Coeus, Crius, Hyperion, Iapetus, Theia, Themis, Mnemosyne, Phoebe, Tethys, Cronus"
// );

// const nyx = createBox(
//   "Nyx",
//   "Primordial goddess of the night. Known for her power and mysterious nature.",
//   "Immortal",
//   [chaos],
//   [
//     [erebus, "Together with Erebus, she gave birth to many deities representing cosmic forces, such as Hypnos and Thanatos."],
//     [zeus, "Even Zeus, the king of the gods, feared her immense power and mystery."]
//   ],
//   "A powerful goddess who even Zeus feared.",
//   ""
// );

// const erebus = createBox(
//   "Erebus",
//   "Primordial deity representing darkness and shadow. One of the first entities to emerge from Chaos.",
//   "Immortal",
//   [chaos],
//   [
//     [nyx, "Partnered with Nyx to produce deities of sleep, death, and other abstract forces."]
//   ],
//   "Embodies the deep darkness of the underworld.",
//   ""
// );

// const tartarus = createBox(
//   "Tartarus",
//   "Primordial deity and the deep abyss used as a dungeon for the Titans and a place of punishment.",
//   "Immortal",
//   [chaos],
//   [
//     [zeus, "Provided a prison for Zeus to imprison the defeated Titans after the Titanomachy."]
//   ],
//   "Both a deity and a place of imprisonment beneath the underworld.",
//   ""
// );

// const pontus = createBox(
//   "Pontus",
//   "Primordial god of the sea. Represents the seas before Poseidon.",
//   "Immortal",
//   [gaia],
//   [
//     [nereus, "Fathered Nereus, the wise 'Old Man of the Sea,' known for his truthfulness and prophetic abilities."]
//   ],
//   "Father of sea deities and creatures.",
//   ""
// );

// const zeus = createBox(
//   "Zeus", 
//   "King of the gods, ruler of Mount Olympus, and god of the sky, weather, law, and order. Known for his thunderbolt and numerous affairs with mortals and goddesses.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [hera, "Married to Hera, but their relationship was marked by conflict due to his many affairs."],
//     [cronus, "Led the Olympians in the Titanomachy to overthrow Cronus and the Titans."],
//     [tartarus, "Imprisoned the Titans in Tartarus after his victory."]
//   ], 
//   "Father of many gods and heroes through various relationships.", 
//   "Hestia, Demeter, Poseidon, Hades, Hera"
// );


// const hera = createBox(
//   "Hera", 
//   "Queen of the gods and goddess of marriage, women, childbirth, and family. Known for her jealousy and protection of married women.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [zeus, "Wife of Zeus, frequently punishes his lovers and their offspring out of jealousy."],
//     [heracles, "Tormented Heracles throughout his life because he was a son of Zeus and a mortal woman."],
//     [paris, "Instigated the Trojan War by seeking revenge on Paris for not naming her the fairest goddess."]
//   ], 
//   "Known for her fierce loyalty and vengeance against Zeus's lovers and offspring.", 
//   "Zeus, Poseidon, Hades, Demeter, Hestia"
// );

// const poseidon = createBox(
//   "Poseidon", 
//   "God of the sea, earthquakes, storms, and horses. Known for his volatile temperament and rivalry with other gods.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [athena, "Competed with Athena for the patronage of Athens, losing when she offered the olive tree."],
//     [odysseus, "Punished Odysseus by making his journey home arduous after the hero blinded his son, the Cyclops Polyphemus."],
//     [apollo, "Worked with Apollo to build the walls of Troy, later seeking revenge when they were not paid for their labor."]
//   ], 
//   "Often depicted with a trident and associated with sea creatures.", 
//   "Zeus, Hades, Hera, Demeter, Hestia"
// );

// const hades = createBox(
//   "Hades", 
//   "God of the underworld and the dead. Rules over the souls of the departed and guards the treasures of the earth.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [persephone, "Abducted Persephone to be his queen, leading to the creation of the seasons."],
//     [heracles, "Allowed Heracles to borrow his watchdog Cerberus as part of the hero's Twelve Labors."],
//     [orpheus, "Made a rare concession by allowing Orpheus to try to rescue his wife Eurydice from the underworld."]
//   ], 
//   "Rarely leaves the underworld, known for his stern and just nature.", 
//   "Zeus, Poseidon, Hera, Demeter, Hestia"
// );

// const athena = createBox(
//   "Athena", 
//   "Goddess of wisdom, war, strategy, and crafts. Known for her intelligence, fairness, and role as a protector of cities.", 
//   "Immortal", 
//   [zeus], 
//   [
//     [poseidon, "Defeated Poseidon in a contest to become the patron of Athens by offering the olive tree."],
//     [odysseus, "Guided and protected Odysseus during his long journey home from the Trojan War."],
//     [arachne, "Turned the mortal Arachne into a spider for her hubris in a weaving contest."]
//   ], 
//   "Sprang fully formed and armored from Zeus's head.", 
//   ""
// );

// const aphrodite = createBox(
//   "Aphrodite", 
//   "Goddess of love, beauty, pleasure, and desire. Born from the sea foam and known for her irresistible charm.", 
//   "Immortal", 
//   [cA], 
//   [
//     [ares, "Had a long-standing affair with Ares, the god of war, despite being married to Hephaestus."],
//     [paris, "Influenced Paris to choose her as the fairest goddess by promising him Helen, leading to the Trojan War."],
//     [pygmalion, "Brought the statue crafted by Pygmalion to life as the woman Galatea."]
//   ], 
//   "Her beauty caused conflicts among gods and mortals alike.", 
//   ""
// );

// const heracles = createBox(
//   "Heracles", 
//   "Demigod hero known for his extraordinary strength and courage. Famous for completing the Twelve Labors.", 
//   "Demigod", 
//   [zeus, alcmene], 
//   [
//     [hera, "Suffered relentless persecution from Hera, who sought to destroy him."],
//     [cerberus, "Captured Cerberus, the three-headed guard dog of the underworld, as one of his Twelve Labors."],
//     [eurystheus, "Served King Eurystheus, who assigned him the Twelve Labors as penance."]
//   ], 
//   "A symbol of perseverance and redemption through heroic feats.", 
//   ""
// );

// const achilles = createBox(
//   "Achilles", 
//   "Greek hero of the Trojan War, renowned for his strength, bravery, and near invincibility, except for his heel.", 
//   "Mortal", 
//   [peleus, thetis], 
//   [
//     [patroclus, "Fought alongside his close companion Patroclus, whose death spurred his rage."],
//     [hector, "Killed Hector in revenge for Patroclus's death and desecrated his body."],
//     [agamemnon, "Quarreled with Agamemnon over the prize Briseis, leading to his temporary withdrawal from battle."]
//   ], 
//   "Central figure of the Iliad, driven by rage and honor.", 
//   ""
// );

// const odysseus = createBox(
//   "Odysseus", 
//   "King of Ithaca, famed for his cunning intellect and resourcefulness. Hero of the Odyssey and the Trojan War.", 
//   "Mortal", 
//   [laertes, anticleia], 
//   [
//     [poseidon, "Angered Poseidon by blinding his son Polyphemus, causing a long and arduous journey home."],
//     [athena, "Protected and guided by Athena, who admired his cleverness."],
//     [circe, "Spent a year with the enchantress Circe, who initially turned his men into swine."]
//   ], 
//   "Endured a decade-long journey to return home after the Trojan War.", 
//   ""
// );

// const nereus = createBox(
//   "Nereus",
//   "Primordial sea god known as the 'Old Man of the Sea.' Renowned for his truthfulness and gift of prophecy.",
//   "Immortal",
//   [pontus, gaia],
//   [
//     [heracles, "Assisted Heracles by revealing the location of the golden apples during the hero's quest."],
//     [thetis, "Father of Thetis, a sea nymph and mother of Achilles."]
//   ],
//   "Shape-shifting sea god who aids heroes with his wisdom and knowledge.",
//   ""
// );









// const chaos = createBox(
//   "Chaos",
//   "The primeval void from which everything in existence sprang. Represents the initial state of emptiness before creation.",
//   "1",
//   "1"
// );

// const gaia = createBox(
//   "Gaia",
//   "Personification of the Earth and the mother of all life. She gave birth to the Titans, giants, and other primordial beings.",
//   "2",
//   "Uranus, Pontus"
// );



// const nyx = createBox(
//   "Nyx",
//   "",
//   "3",
//   "extraElement",
// );

// const uranus = createBox(
//   "uranus",
//   "",
//   "3",
//   "extraElement",
// );

// const tartarus = createBox(
//   "tartarus",
//   "",
//   "3",
//   "extraElement",
// );



// enhanceBox(cA, [null],[[]]);

// enhanceBox(chaos, [cA], [
//   [nyx, "Generated Nyx, the goddess of night, who embodies the darkness of the void."]
// ])

// enhanceBox(gaia, [chaos], [
//     [uranus, "Worked with Uranus to create the first generations of Titans and orchestrated his downfall when he imprisoned their children."]
//      ,[nyx, "Generated Nyx, the goddess of night, who embodies the darkness of the void."]
// ])

// enhanceBox(nyx, [null],[[]]);

// enhanceBox(uranus, [null],[[]]);

// enhanceBox(tartarus, [null],[[]]);













// const chaos = createBox(
//   "Chaos",
//   "The primeval void from which everything in existence sprang. Represents the initial state of emptiness before creation.",
//   "Immortal",
//   [cA],
//   [
//     [gaia, "Brought forth Gaia, who personifies the Earth and gives structure to the cosmos."],
//     [nyx, "Generated Nyx, the goddess of night, who embodies the darkness of the void."]
//   ],
//   "The source of all creation in Greek mythology.",
//   ""
// );

// const gaia = createBox(
//   "Gaia",
//   "Personification of the Earth and the mother of all life. She gave birth to the Titans, giants, and other primordial beings.",
//   "Immortal",
//   [chaos],
//   [
//     [uranus, "Worked with Uranus to create the first generations of Titans and orchestrated his downfall when he imprisoned their children."],
//     [tartarus, "Conspired with Tartarus to imprison the giants and other rebellious beings."]
//   ],
//   "Mother of the Titans and many other primordial deities.",
//   "Uranus, Pontus"
// );

// const uranus = createBox(
//   "Uranus",
//   "Personification of the sky and the heavens. Known for fathering the Titans with Gaia.",
//   "Immortal",
//   [gaia],
//   [
//     [cronus, "Was overthrown and castrated by his son Cronus, fulfilling a prophecy foretold by Gaia."]
//   ],
//   "Locked his children away, leading to his downfall.",
//   "Oceanus, Coeus, Crius, Hyperion, Iapetus, Theia, Rhea, Themis, Mnemosyne, Phoebe, Tethys, Cronus"
// );

// const cronus = createBox(
//   "Cronus",
//   "The youngest of the Titans who overthrew his father Uranus. Known as the god of time and the harvest.",
//   "Immortal",
//   [uranus, gaia],
//   [
//     [zeus, "Was defeated by Zeus in the Titanomachy, the great war between the Titans and the Olympian gods."],
//     [rhea, "Tricked by Rhea into swallowing a stone instead of Zeus, which led to his eventual downfall."]
//   ],
//   "Swallowed his children to prevent them from overthrowing him.",
//   "Oceanus, Coeus, Crius, Hyperion, Iapetus, Theia, Rhea, Themis, Mnemosyne, Phoebe, Tethys"
// );

// const rhea = createBox(
//   "Rhea",
//   "Titaness of fertility, motherhood, and generation. Known as the mother of the Olympian gods.",
//   "Immortal",
//   [uranus, gaia],
//   [
//     [zeus, "Saved Zeus from being swallowed by Cronus by hiding him on Crete and later helped him overthrow Cronus."]
//   ],
//   "Protected her children from Cronus by hiding Zeus.",
//   "Oceanus, Coeus, Crius, Hyperion, Iapetus, Theia, Themis, Mnemosyne, Phoebe, Tethys, Cronus"
// );

// const nyx = createBox(
//   "Nyx",
//   "Primordial goddess of the night. Known for her power and mysterious nature.",
//   "Immortal",
//   [chaos],
//   [
//     [erebus, "Together with Erebus, she gave birth to many deities representing cosmic forces, such as Hypnos and Thanatos."],
//     [zeus, "Even Zeus, the king of the gods, feared her immense power and mystery."]
//   ],
//   "A powerful goddess who even Zeus feared.",
//   ""
// );

// const erebus = createBox(
//   "Erebus",
//   "Primordial deity representing darkness and shadow. One of the first entities to emerge from Chaos.",
//   "Immortal",
//   [chaos],
//   [
//     [nyx, "Partnered with Nyx to produce deities of sleep, death, and other abstract forces."]
//   ],
//   "Embodies the deep darkness of the underworld.",
//   ""
// );

// const tartarus = createBox(
//   "Tartarus",
//   "Primordial deity and the deep abyss used as a dungeon for the Titans and a place of punishment.",
//   "Immortal",
//   [chaos],
//   [
//     [zeus, "Provided a prison for Zeus to imprison the defeated Titans after the Titanomachy."]
//   ],
//   "Both a deity and a place of imprisonment beneath the underworld.",
//   ""
// );

// const pontus = createBox(
//   "Pontus",
//   "Primordial god of the sea. Represents the seas before Poseidon.",
//   "Immortal",
//   [gaia],
//   [
//     [nereus, "Fathered Nereus, the wise 'Old Man of the Sea,' known for his truthfulness and prophetic abilities."]
//   ],
//   "Father of sea deities and creatures.",
//   ""
// );

// const zeus = createBox(
//   "Zeus", 
//   "King of the gods, ruler of Mount Olympus, and god of the sky, weather, law, and order. Known for his thunderbolt and numerous affairs with mortals and goddesses.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [hera, "Married to Hera, but their relationship was marked by conflict due to his many affairs."],
//     [cronus, "Led the Olympians in the Titanomachy to overthrow Cronus and the Titans."],
//     [tartarus, "Imprisoned the Titans in Tartarus after his victory."]
//   ], 
//   "Father of many gods and heroes through various relationships.", 
//   "Hestia, Demeter, Poseidon, Hades, Hera"
// );


// const hera = createBox(
//   "Hera", 
//   "Queen of the gods and goddess of marriage, women, childbirth, and family. Known for her jealousy and protection of married women.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [zeus, "Wife of Zeus, frequently punishes his lovers and their offspring out of jealousy."],
//     [heracles, "Tormented Heracles throughout his life because he was a son of Zeus and a mortal woman."],
//     [paris, "Instigated the Trojan War by seeking revenge on Paris for not naming her the fairest goddess."]
//   ], 
//   "Known for her fierce loyalty and vengeance against Zeus's lovers and offspring.", 
//   "Zeus, Poseidon, Hades, Demeter, Hestia"
// );

// const poseidon = createBox(
//   "Poseidon", 
//   "God of the sea, earthquakes, storms, and horses. Known for his volatile temperament and rivalry with other gods.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [athena, "Competed with Athena for the patronage of Athens, losing when she offered the olive tree."],
//     [odysseus, "Punished Odysseus by making his journey home arduous after the hero blinded his son, the Cyclops Polyphemus."],
//     [apollo, "Worked with Apollo to build the walls of Troy, later seeking revenge when they were not paid for their labor."]
//   ], 
//   "Often depicted with a trident and associated with sea creatures.", 
//   "Zeus, Hades, Hera, Demeter, Hestia"
// );

// const hades = createBox(
//   "Hades", 
//   "God of the underworld and the dead. Rules over the souls of the departed and guards the treasures of the earth.", 
//   "Immortal", 
//   [cronus, rhea], 
//   [
//     [persephone, "Abducted Persephone to be his queen, leading to the creation of the seasons."],
//     [heracles, "Allowed Heracles to borrow his watchdog Cerberus as part of the hero's Twelve Labors."],
//     [orpheus, "Made a rare concession by allowing Orpheus to try to rescue his wife Eurydice from the underworld."]
//   ], 
//   "Rarely leaves the underworld, known for his stern and just nature.", 
//   "Zeus, Poseidon, Hera, Demeter, Hestia"
// );

// const athena = createBox(
//   "Athena", 
//   "Goddess of wisdom, war, strategy, and crafts. Known for her intelligence, fairness, and role as a protector of cities.", 
//   "Immortal", 
//   [zeus], 
//   [
//     [poseidon, "Defeated Poseidon in a contest to become the patron of Athens by offering the olive tree."],
//     [odysseus, "Guided and protected Odysseus during his long journey home from the Trojan War."],
//     [arachne, "Turned the mortal Arachne into a spider for her hubris in a weaving contest."]
//   ], 
//   "Sprang fully formed and armored from Zeus's head.", 
//   ""
// );

// const aphrodite = createBox(
//   "Aphrodite", 
//   "Goddess of love, beauty, pleasure, and desire. Born from the sea foam and known for her irresistible charm.", 
//   "Immortal", 
//   [cA], 
//   [
//     [ares, "Had a long-standing affair with Ares, the god of war, despite being married to Hephaestus."],
//     [paris, "Influenced Paris to choose her as the fairest goddess by promising him Helen, leading to the Trojan War."],
//     [pygmalion, "Brought the statue crafted by Pygmalion to life as the woman Galatea."]
//   ], 
//   "Her beauty caused conflicts among gods and mortals alike.", 
//   ""
// );

// const heracles = createBox(
//   "Heracles", 
//   "Demigod hero known for his extraordinary strength and courage. Famous for completing the Twelve Labors.", 
//   "Demigod", 
//   [zeus, alcmene], 
//   [
//     [hera, "Suffered relentless persecution from Hera, who sought to destroy him."],
//     [cerberus, "Captured Cerberus, the three-headed guard dog of the underworld, as one of his Twelve Labors."],
//     [eurystheus, "Served King Eurystheus, who assigned him the Twelve Labors as penance."]
//   ], 
//   "A symbol of perseverance and redemption through heroic feats.", 
//   ""
// );

// const achilles = createBox(
//   "Achilles", 
//   "Greek hero of the Trojan War, renowned for his strength, bravery, and near invincibility, except for his heel.", 
//   "Mortal", 
//   [peleus, thetis], 
//   [
//     [patroclus, "Fought alongside his close companion Patroclus, whose death spurred his rage."],
//     [hector, "Killed Hector in revenge for Patroclus's death and desecrated his body."],
//     [agamemnon, "Quarreled with Agamemnon over the prize Briseis, leading to his temporary withdrawal from battle."]
//   ], 
//   "Central figure of the Iliad, driven by rage and honor.", 
//   ""
// );

// const odysseus = createBox(
//   "Odysseus", 
//   "King of Ithaca, famed for his cunning intellect and resourcefulness. Hero of the Odyssey and the Trojan War.", 
//   "Mortal", 
//   [laertes, anticleia], 
//   [
//     [poseidon, "Angered Poseidon by blinding his son Polyphemus, causing a long and arduous journey home."],
//     [athena, "Protected and guided by Athena, who admired his cleverness."],
//     [circe, "Spent a year with the enchantress Circe, who initially turned his men into swine."]
//   ], 
//   "Endured a decade-long journey to return home after the Trojan War.", 
//   ""
// );

// const nereus = createBox(
//   "Nereus",
//   "Primordial sea god known as the 'Old Man of the Sea.' Renowned for his truthfulness and gift of prophecy.",
//   "Immortal",
//   [pontus, gaia],
//   [
//     [heracles, "Assisted Heracles by revealing the location of the golden apples during the hero's quest."],
//     [thetis, "Father of Thetis, a sea nymph and mother of Achilles."]
//   ],
//   "Shape-shifting sea god who aids heroes with his wisdom and knowledge.",
//   ""
// );





















//  const Gaia = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [cA],[], 1);
//  const Gaia2 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [cA], [Gaia], 1);
//  const Gaia3 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia2], [Gaia2], 2);
//  const Gaia4 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia2], [Gaia2],2);
//  const Gaia5 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia2, Gaia], [Gaia2], 3);
//  const Gaia6 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia], [Gaia2],4);
//  const Gaia7 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia], [Gaia2],4);
//  const Gaia12 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [cA], [Gaia], 1);
//  const Gaia13 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia2], [Gaia2], 2);
//  const Gaia14 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia2], [Gaia2],2);
//  const Gaia51 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia2, Gaia], [Gaia2], 3);
//  const Gaia16 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia], [Gaia2],4);
//  const Gaia17 = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [Gaia], [Gaia2],4);


//  const Gaia = createBox("Gaia", "Primordial goddess of the Earth.", "Primordial Deity", [cA]);
//  const Khronos = createBox("Chronos", "The god of empirical time, sometimes equated with Aion. Not to be confused with the Titan Cronus (Kronos), the father of Zeus.", "Primordial Deity", [cA]);
// // const Erebus = createBox( "Erebus", "The god of darkness and shadow, as well as the void that existed between Earth and the Underworld.", "Primordial Deity", [cA]);
// const Eros = createBox( "Eros", "The god of love and attraction.", "Primordial Deity", [cA]);
// // const Hemera = createBox( "Hemera", "The personification of the day.", "Primordial Deity", [cA]);
// // const Nesoi = createBox( "The Nesoi", "The goddesses of islands.", "Primordial Deity", [cA]);
// // const Nyx = createBox( "Nyx", "The goddess and personification of the night.", "Primordial Deity", [cA]);
// // const Ourea = createBox( "The Ourea", "The gods of mountains.", "Primordial Deity", [cA]);
// // const Phanes = createBox( "Phanes", "The god of procreation in the Orphic tradition.", "Primordial Deity", [cA]);
// // const Pontus = createBox( "Pontus", "The god of the sea, father of the fish and other sea creatures.", "Primordial Deity", [cA]);
// // const Tartarus = createBox( "Tartarus", "The god of the deepest, darkest part of the underworld, the Tartarean pit (which is also referred to as Tartarus itself).", "Primordial Deity", [cA]);
// // const Thalassa = createBox( "Thalassa", "Personification of the sea and consort of Pontus.", "Primordial Deity", [cA]);



// const Achlys = createBox("Achlys", "Goddess of poisons and the personification of misery and sadness. Said to have existed before Chaos.", "Primordial Deity", [cA]);
// // const Aether = createBox("Aether", "God of light and the upper atmosphere.", "Primordial Deity", [cA]);
// // const Aion = createBox("Aion", "God of eternity, personifying unbounded time.", "Primordial Deity", [cA]);
// // const Ananke = createBox("Ananke", "Goddess of inevitability, compulsion, and necessity.", "Primordial Deity", [cA]);
// // const Chaos = createBox("Chaos", "The personification of nothingness from which all existence sprang.", "Primordial Deity", [cA]);

// const Uranus = createBox("Uranus", "Primordial god of the sky.", "Titan", [Gaia]);

// const Cronus = createBox("Cronus", "The leader of the Titans and the god of time. He overthrew his father Uranus and ruled during the Golden Age. Eventually overthrown by his son, Zeus.", "Titan", [Uranus, Gaia], "Uranus, Gaia");
// const Rhea = createBox("Rhea", "Titaness, daughter of Uranus and Gaia, wife of Cronus, and mother of many Olympian gods including Zeus, Hera, and Poseidon.", "Titaness", [Uranus, Gaia], "Uranus, Gaia");
// const Oceanus = createBox("Oceanus", "Titan god of the ocean, the great river that encircles the world.", "Titan", [Uranus, Gaia], "Uranus, Gaia");
// // const Hyperion = createBox("Hyperion", "Titan of light, father of Helios (the Sun), Selene (the Moon), and Eos (the Dawn).", "Titan", [Uranus, Gaia], "Uranus, Gaia");
// // const Theia = createBox("Theia", "Titaness of sight and the shining sky, mother of Helios, Selene, and Eos.", "Titaness", [Uranus, Gaia], "Uranus, Gaia");
// const Iapetus = createBox("Iapetus", "Titan of mortality and craftsmanship, father of Prometheus, Epimetheus, and Atlas.", "Titan", [Uranus, Gaia], "Uranus, Gaia");
// // const Mnemosyne = createBox("Mnemosyne", "Titaness of memory and mother of the nine Muses by Zeus.", "Titaness", [Uranus, Gaia], "Uranus, Gaia");
// // const Coeus = createBox("Coeus", "Titan of intelligence and the axis of heaven, father of Leto and Asteria.", "Titan", [Uranus, Gaia], "Uranus, Gaia");
// // const Phoebe = createBox("Phoebe", "Titaness of prophecy and intellect, grandmother of Apollo and Artemis.", "Titaness", [Uranus, Gaia], "Uranus, Gaia");
// // const Crius = createBox("Crius", "Titan associated with the constellations and the south wind.", "Titan", [Uranus, Gaia], "Uranus, Gaia");
// // const Themis = createBox("Themis", "Titaness of divine law and order, mother of the Horae and the Moirai (Fates).", "Titaness", [Uranus, Gaia], "Uranus, Gaia");

// const Atlas = createBox("Atlas", "A Titan condemned to hold up the sky for eternity as punishment after the Titanomachy.", "Titan", [Iapetus], "Iapetus, Clymene");
// const Prometheus = createBox("Prometheus", "Titan who created humanity and gave them fire, punished by Zeus for his defiance.", "Titan", [Iapetus], "Iapetus, Clymene");
// const Epimetheus = createBox("Epimetheus", "Titan of afterthought, brother of Prometheus, known for creating animals.", "Titan", [Iapetus], "Iapetus, Clymene");

// // const Zeus = createBox("Zeus", "King of the gods, ruler of Mount Olympus, and god of the sky and thunder. Son of Cronus and Rhea.", "Deity", [Cronus, Rhea], "Cronus, Rhea");
// // const Hera = createBox("Hera", "Queen of the gods, goddess of women and marriage. Daughter of Cronus and Rhea, wife of Zeus.", "Deity", [Cronus, Rhea], "Cronus, Rhea");
// // const Aphrodite = createBox("Aphrodite", "Goddess of beauty, love, desire, and pleasure. Born from sea-foam and Uranus' severed genitals or daughter of Zeus and Dione.", "Deity", [Zeus], "Zeus, Dione");
// // const Apollo = createBox("Apollo", "God of music, arts, healing, prophecy, and archery. Son of Zeus and Leto, twin brother of Artemis.", "Deity", [Zeus], "Zeus, Leto");
// // const Ares = createBox("Ares", "God of war, bloodshed, and violence. Son of Zeus and Hera.", "Deity", [Zeus, Hera], "Zeus, Hera");
// // // const Artemis = createBox("Artemis", "Goddess of the hunt, wilderness, and the Moon. Daughter of Zeus and Leto, twin sister of Apollo.", "Deity", [Zeus], "Zeus, Leto");
// // // const Athena = createBox("Athena", "Goddess of wisdom, skill, and warfare. Born from Zeus' forehead.", "Deity", [Zeus], "Zeus");
// // // const Demeter = createBox("Demeter", "Goddess of grain, agriculture, and harvest. Daughter of Cronus and Rhea.", "Deity", [Cronus, Rhea], "Cronus, Rhea");
// // // const Dionysus = createBox("Dionysus", "God of wine, parties, madness, and the theater. Son of Zeus and Semele.", "Deity", [Zeus], "Zeus, Semele");
// // // const Hades = createBox("Hades", "God of the underworld and wealth. Son of Cronus and Rhea, brother of Zeus and Poseidon.", "Deity", [Cronus, Rhea], "Cronus, Rhea");
// // // const Hephaestus = createBox("Hephaestus", "God of fire, metalworking, and crafts. Son of Zeus and Hera.", "Deity", [Zeus, Hera], "Zeus, Hera");
// // // const Hermes = createBox("Hermes", "God of boundaries, travel, and communication. Son of Zeus and Maia.", "Deity", [Zeus], "Zeus, Maia");
// // // const Hestia = createBox("Hestia", "Goddess of the hearth and home. Daughter of Cronus and Rhea.", "Deity", [Cronus, Rhea], "Cronus, Rhea");
// // // const Persephone = createBox("Persephone", "Goddess of spring and Queen of the Underworld. Daughter of Demeter and Zeus.", "Deity", [Demeter, Zeus], "Demeter, Zeus");
// // const Poseidon = createBox("Poseidon", "God of the sea, rivers, and earthquakes. Son of Cronus and Rhea.", "Deity", [Cronus, Rhea], "Cronus, Rhea");

// // const Gigantes = createBox("Gigantes", "A race of giants born from the blood of Uranus after he was castrated by Cronus.", "Giant", [Uranus, Gaia], "Uranus, Gaia");
// // const Alcyoneus = createBox("Alcyoneus", "A giant who fought Heracles in the Gigantomachy and was immortal in his homeland.", "Giant", [Uranus, Gaia], "Uranus, Gaia");
// // const Porphyrion = createBox("Porphyrion", "The king of the giants, who challenged Zeus and attempted to violate Hera.", "Giant", [Uranus, Gaia], "Uranus, Gaia");
// // const Enceladus = createBox("Enceladus", "A giant buried under Mount Etna by Athena, known for causing earthquakes.", "Giant", [Uranus, Gaia], "Uranus, Gaia");
// // const Polybotes = createBox("Polybotes", "A giant pursued by Poseidon and buried under the island of Nisyros.", "Giant", [Uranus, Gaia], "Uranus, Gaia");
// // const Hippolytus = createBox("Hippolytus", "A giant defeated by Hermes during the Gigantomachy.", "Giant", [Uranus, Gaia], "Uranus, Gaia");
// // const Eurytus = createBox("Eurytus", "A giant who fought against Dionysus and was killed during the Gigantomachy.", "Giant", [Uranus, Gaia], "Uranus, Gaia");

