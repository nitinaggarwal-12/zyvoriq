import json

characters = [
  # -------------------------------------------------------------
  # 1. Baseline Core Characters
  # -------------------------------------------------------------
  {
    "id": "kiara_street_dancer",
    "displayName": "Kiara",
    "archetype": "young South Asian female street dancer",
    "description": "Athletic South Asian street dancer, late 20s, expressive eyes, hair in high ponytail, street dance attire.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia-Pacific",
    "language": "Hindi",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_kiara_streetwear",
        "label": "Neon Monsoon Streetwear",
        "sheetUris": ["/assets/stills/dubai_dance.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "ren_kuro",
    "displayName": "Ren Kuro",
    "archetype": "disciplined cyber-ronin swordsman",
    "description": "Mid-30s Japanese martial artist, sharp jawline, focused calm gaze, tactical haori tunic.",
    "gender": "male",
    "era": "cyberpunk",
    "country": "Japan",
    "countryCode": "JP",
    "region": "Asia-Pacific",
    "language": "Japanese",
    "category": "cinema",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_ren_tactical",
        "label": "Tactical Ronin Haori",
        "sheetUris": ["/assets/stills/ren_cyberpunk.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "elena_rostova",
    "displayName": "Elena Rostova",
    "archetype": "visionary female neuro-architect keynote speaker",
    "description": "Early 30s European researcher, tailored charcoal blazer, sophisticated demeanor.",
    "gender": "female",
    "era": "contemporary",
    "country": "France",
    "countryCode": "FR",
    "region": "Europe",
    "language": "French",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_elena_keynote",
        "label": "Keynote Charcoal Blazer",
        "sheetUris": ["/assets/characters/sophie_clarke_uk.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "david_kim",
    "displayName": "David Kim",
    "archetype": "steely deep-space vessel commander",
    "description": "Late 30s Korean-American pilot, high collar flight suit, steady watchful eyes.",
    "gender": "male",
    "era": "sci-fi",
    "country": "South Korea",
    "countryCode": "KR",
    "region": "Asia-Pacific",
    "language": "Korean",
    "category": "cinema",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_david_flightsuit",
        "label": "Command Flight Suit",
        "sheetUris": ["/assets/characters/minho_song_kr.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "marcus_vance",
    "displayName": "Marcus Vance",
    "archetype": "grizzled frontier salvage engineer",
    "description": "Mid-40s engineer, weathered leather duster, cybernetic eye optic, stern presence.",
    "gender": "male",
    "era": "sci-fi",
    "country": "United States",
    "countryCode": "US",
    "region": "Americas",
    "language": "English",
    "category": "cinema",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_marcus_salvage",
        "label": "Frontier Weathered Duster",
        "sheetUris": ["/assets/characters/jordan_cole_us.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "priya_sharma",
    "displayName": "Priya Sharma",
    "archetype": "high-altitude glaciologist and alpine researcher",
    "description": "Late 20s Indian researcher, bright red mountaineering thermal parka, snow goggles resting on forehead.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia-Pacific",
    "language": "Hindi",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_priya_alpine",
        "label": "Alpine Expedition Thermal",
        "sheetUris": ["/assets/characters/ananya_roy_in.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "sarah_campbell",
    "displayName": "Dr. Sarah Campbell",
    "archetype": "calm biomedical director in cleanroom scrubs",
    "description": "Early 40s Scottish scientist, clinical white lab coat, silver-streaked dark hair, thoughtful analytical gaze.",
    "gender": "female",
    "era": "contemporary",
    "country": "United Kingdom",
    "countryCode": "GB",
    "region": "Europe",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_sarah_clinical",
        "label": "Clinical Cleanroom Coat",
        "sheetUris": ["/assets/characters/sophie_clarke_uk.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "carlos_mendoza",
    "displayName": "Carlos Mendoza",
    "archetype": "charismatic Havana jazz club owner",
    "description": "Late 30s Cuban gentleman, tailored cream linen guayabera shirt, warm smile, rich baritone laughter.",
    "gender": "male",
    "era": "contemporary",
    "country": "Mexico",
    "countryCode": "MX",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_carlos_linen",
        "label": "Cream Linen Guayabera",
        "sheetUris": ["/assets/characters/mateo_hernandez_mx.jpg"],
        "isDefault": True
      }
    ]
  },

  # -------------------------------------------------------------
  # 2. Flagship Cinema Leads with Multi-Wardrobe Variants
  # -------------------------------------------------------------
  {
    "id": "kaelen_vance",
    "displayName": "Kaelen Vance",
    "archetype": "intense investigative neo-noir protagonist with deep contemplative presence",
    "description": "Prestige thriller protagonist, 32, textured dark hair, piercing hazel eyes, deep screen gravitas. Features 5 location-specific wardrobe variations.",
    "gender": "male",
    "era": "contemporary",
    "country": "United States",
    "countryCode": "US",
    "region": "Americas",
    "language": "English",
    "category": "cinema",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_kaelen_noir",
        "label": "Neo-Noir Trenchcoat (Street/Rain)",
        "sheetUris": ["/assets/characters/kaelen_vance.jpg"],
        "isDefault": True
      },
      {
        "id": "w_kaelen_office",
        "label": "Executive Charcoal Suit (Office/Work)",
        "sheetUris": ["/assets/characters/kaelen_vance_office.jpg"],
        "isDefault": False
      },
      {
        "id": "w_kaelen_beach",
        "label": "Coastal Linen Shirt (Beach/Resort)",
        "sheetUris": ["/assets/characters/kaelen_vance_beach.jpg"],
        "isDefault": False
      },
      {
        "id": "w_kaelen_party",
        "label": "Midnight Dinner Jacket (Party/Gala)",
        "sheetUris": ["/assets/characters/kaelen_vance_party.jpg"],
        "isDefault": False
      },
      {
        "id": "w_kaelen_home",
        "label": "Waffle Knit Crewneck (Home/Casual)",
        "sheetUris": ["/assets/characters/kaelen_vance_home.jpg"],
        "isDefault": False
      }
    ]
  },
  {
    "id": "devika_varma",
    "displayName": "Devika Varma",
    "archetype": "regal classical period epic heroine with expressive cinematic depth",
    "description": "Grand historical drama lead, 28, luminous deep brown eyes, expressive cinematic dignity. Features 5 location-specific wardrobe variations.",
    "gender": "female",
    "era": "historical",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia-Pacific",
    "language": "Hindi",
    "category": "cinema",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_devika_period",
        "label": "Banarasi Raw Silk Sari (Period/Gala)",
        "sheetUris": ["/assets/characters/devika_varma.jpg"],
        "isDefault": True
      },
      {
        "id": "w_devika_office",
        "label": "Raw Silk Executive Blazer (Office/Studio)",
        "sheetUris": ["/assets/characters/devika_varma_office.jpg"],
        "isDefault": False
      },
      {
        "id": "w_devika_beach",
        "label": "Coastal Gold Kaftan (Beach/Resort)",
        "sheetUris": ["/assets/characters/devika_varma_beach.jpg"],
        "isDefault": False
      },
      {
        "id": "w_devika_party",
        "label": "Midnight Embroidered Silk (Party/Gala)",
        "sheetUris": ["/assets/characters/devika_varma_party.jpg"],
        "isDefault": False
      },
      {
        "id": "w_devika_home",
        "label": "Handblock Chanderi Kurta (Home/Garden)",
        "sheetUris": ["/assets/characters/devika_varma_home.jpg"],
        "isDefault": False
      }
    ]
  },
  {
    "id": "lucas_silva_br",
    "displayName": "Lucas Silva",
    "archetype": "charismatic Brazilian lifestyle and travel creator with warm athletic energy",
    "description": "Rio de Janeiro content creator, 27, short dark curls, warm brown eyes, radiant athletic smile. Features 5 location-specific wardrobe variations.",
    "gender": "male",
    "era": "contemporary",
    "country": "Brazil",
    "countryCode": "BR",
    "region": "Americas",
    "language": "Portuguese",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_lucas_br",
        "label": "Rio Urban Streetwear (Street/Default)",
        "sheetUris": ["/assets/characters/lucas_silva_br.jpg"],
        "isDefault": True
      },
      {
        "id": "w_lucas_office",
        "label": "Tailored Navy Suit (Office/Corporate)",
        "sheetUris": ["/assets/characters/lucas_silva_office.jpg"],
        "isDefault": False
      },
      {
        "id": "w_lucas_beach",
        "label": "Ipanema Tropical Linen (Beach/Resort)",
        "sheetUris": ["/assets/characters/lucas_silva_beach.jpg"],
        "isDefault": False
      },
      {
        "id": "w_lucas_party",
        "label": "Black Silk Evening Shirt (Party/Lounge)",
        "sheetUris": ["/assets/characters/lucas_silva_party.jpg"],
        "isDefault": False
      },
      {
        "id": "w_lucas_home",
        "label": "Heather Grey Lounge Tee (Home/Loft)",
        "sheetUris": ["/assets/characters/lucas_silva_home.jpg"],
        "isDefault": False
      }
    ]
  },

  # -------------------------------------------------------------
  # 3. Cinema Leads & Blockbuster Archetypes
  # -------------------------------------------------------------
  {
    "id": "vikram_rathore",
    "displayName": "Vikram Rathore",
    "archetype": "commanding high-octane action protagonist with weathered screen charisma",
    "description": "Action blockbuster lead, 34, rugged dark beard, intense piercing dark eyes, golden hour rim lighting, olive tactical linen shirt.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia-Pacific",
    "language": "Hindi",
    "category": "cinema",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_vikram_tactical",
        "label": "Weathered Tactical Linen",
        "sheetUris": ["/assets/characters/vikram_rathore.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "junseo_park",
    "displayName": "Jun-seo Park",
    "archetype": "poetic arthouse cinematic lead with atmospheric melancholic romance",
    "description": "Arthouse romantic lead, 29, stylish parted dark hair, soulful eyes, structured midnight-navy wool overcoat, Wong Kar-wai inspired lighting.",
    "gender": "male",
    "era": "contemporary",
    "country": "South Korea",
    "countryCode": "KR",
    "region": "Asia-Pacific",
    "language": "Korean",
    "category": "cinema",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_junseo_wool",
        "label": "Midnight Wool Overcoat",
        "sheetUris": ["/assets/characters/junseo_park.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "camille_vidal",
    "displayName": "Camille Vidal",
    "archetype": "enigmatic psychological thriller protagonist with calculating presence",
    "description": "Psychological mystery lead, 30, sleek chin-length dark bob, penetrating hazel eyes, slate-grey tailored trench coat on misty Parisian bridge.",
    "gender": "female",
    "era": "contemporary",
    "country": "France",
    "countryCode": "FR",
    "region": "Europe",
    "language": "French",
    "category": "cinema",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_camille_trench",
        "label": "Slate Parisian Trench",
        "sheetUris": ["/assets/characters/camille_vidal.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "soren_lindberg",
    "displayName": "Soren Lindberg",
    "archetype": "stoic Nordic geopolitical espionage strategist with calculating gaze",
    "description": "Nordic noir thriller protagonist, 36, ash-blonde hair, piercing cold blue-grey eyes, heavy charcoal Norwegian wool sweater.",
    "gender": "male",
    "era": "contemporary",
    "country": "Denmark",
    "countryCode": "DK",
    "region": "Europe",
    "language": "Danish",
    "category": "cinema",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_soren_nordic",
        "label": "Norwegian Knit & Oxford",
        "sheetUris": ["/assets/characters/soren_lindberg.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "zainab_al_mansoor",
    "displayName": "Zainab Al-Mansoor",
    "archetype": "commanding desert epic protagonist with fierce majestic screen presence",
    "description": "Desert epic and speculative sci-fi lead, 27, deep amber-brown eyes, flowing indigo and sandstone raw linen traveler wrap, golden hour dunes.",
    "gender": "female",
    "era": "contemporary",
    "country": "United Arab Emirates",
    "countryCode": "AE",
    "region": "Middle East",
    "language": "Arabic",
    "category": "cinema",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_zainab_desert",
        "label": "Indigo Sandstone Wrap",
        "sheetUris": ["/assets/characters/zainab_al_mansoor.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "valentina_castillo",
    "displayName": "Valentina Castillo",
    "archetype": "passionate dramatic heroine with intense emotional cinematic depth",
    "description": "Dramatic cinematic lead, 29, voluminous dark wavy hair, expressive dark eyes, rich crimson silk blouse, warm Mediterranean chiaroscuro.",
    "gender": "female",
    "era": "contemporary",
    "country": "Spain",
    "countryCode": "ES",
    "region": "Europe",
    "language": "Spanish",
    "category": "cinema",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_valentina_crimson",
        "label": "Crimson Draped Silk Blouse",
        "sheetUris": ["/assets/characters/valentina_castillo.jpg"],
        "isDefault": True
      }
    ]
  },

  # -------------------------------------------------------------
  # 4. Haute Couture & Runway Editorial Muses
  # -------------------------------------------------------------
  {
    "id": "ines_laurent",
    "displayName": "Inès Laurent",
    "archetype": "commanding haute-couture runway muse with sculptural architectural poise",
    "description": "Paris Haute Couture icon, 26, high cheekbones, deep emerald eyes, sculptural avant-garde black velvet gown with exaggerated collar.",
    "gender": "female",
    "era": "contemporary",
    "country": "France",
    "countryCode": "FR",
    "region": "Europe",
    "language": "French",
    "category": "fashion",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_ines_velvet",
        "label": "Architectural Velvet Gown",
        "sheetUris": ["/assets/characters/ines_laurent.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "gianluigi_moretti",
    "displayName": "Gianluigi Moretti",
    "archetype": "effortless Italian luxury menswear icon embodying pure sprezzatura",
    "description": "Milanese menswear director, 33, wavy dark hair, unstructured sand-beige cashmere blazer, fine open linen shirt, Milan rooftop terrace.",
    "gender": "male",
    "era": "contemporary",
    "country": "Italy",
    "countryCode": "IT",
    "region": "Europe",
    "language": "Italian",
    "category": "fashion",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_gigi_cashmere",
        "label": "Unstructured Cashmere Blazer",
        "sheetUris": ["/assets/characters/gianluigi_moretti.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "rei_morimoto",
    "displayName": "Rei Morimoto",
    "archetype": "intense Japanese deconstructivist runway muse with sculptural poise",
    "description": "Tokyo conceptual runway model, 24, geometric asymmetrical bob, draped matte black linen structured coat, minimalist studio backdrop.",
    "gender": "female",
    "era": "contemporary",
    "country": "Japan",
    "countryCode": "JP",
    "region": "Asia-Pacific",
    "language": "Japanese",
    "category": "fashion",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_rei_deconstruct",
        "label": "Draped Matte Black Coat",
        "sheetUris": ["/assets/characters/rei_morimoto.jpg"],
        "isDefault": True
      }
    ]
  },
  {
    "id": "seun_adeleke",
    "displayName": "Seun Adeleke",
    "archetype": "commanding international runway visionary in tailored heritage textile",
    "description": "International runway lead, 27, rich mahogany skin tone, razor-sharp cheekbones, tailored double-breasted suit in indigo & gold woven textile.",
    "gender": "male",
    "era": "contemporary",
    "country": "Nigeria",
    "countryCode": "NG",
    "region": "Africa",
    "language": "English",
    "category": "fashion",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [
      {
        "id": "w_seun_indigo",
        "label": "Woven Indigo & Gold Tailoring",
        "sheetUris": ["/assets/characters/seun_adeleke.jpg"],
        "isDefault": True
      }
    ]
  },

  # -------------------------------------------------------------
  # 5. Top Social Media Obsessed Nations (16 Creators)
  # -------------------------------------------------------------
  {
    "id": "bea_mendoza_ph",
    "displayName": "Bea Mendoza",
    "archetype": "vibrant Filipino beauty and lifestyle creator with warm engaging smile",
    "description": "Manila digital creator, 23, warm golden skin tone, glossy dark brown hair, coral linen button-down shirt.",
    "gender": "female",
    "era": "contemporary",
    "country": "Philippines",
    "countryCode": "PH",
    "region": "Asia-Pacific",
    "language": "Tagalog",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_bea_ph", "label": "Coral Linen Studio", "sheetUris": ["/assets/characters/bea_mendoza_ph.jpg"], "isDefault": True}]
  },
  {
    "id": "marco_ramos_ph",
    "displayName": "Marco Ramos",
    "archetype": "energetic Filipino travel and street food vlogger with authentic warmth",
    "description": "Cebu explorer, 26, athletic sun-bronzed skin, casual dark t-shirt with tropical linen overshirt.",
    "gender": "male",
    "era": "contemporary",
    "country": "Philippines",
    "countryCode": "PH",
    "region": "Asia-Pacific",
    "language": "Tagalog",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_marco_ph", "label": "Island Explorer Linen", "sheetUris": ["/assets/characters/marco_ramos_ph.jpg"], "isDefault": True}]
  },
  {
    "id": "isabela_rocha_br",
    "displayName": "Isabela Rocha",
    "archetype": "magnetic Brazilian fitness and dance creator with infectious radiant smile",
    "description": "São Paulo fitness creator, 25, voluminous dark wavy curls, sun-kissed glowing skin, emerald green top.",
    "gender": "female",
    "era": "contemporary",
    "country": "Brazil",
    "countryCode": "BR",
    "region": "Americas",
    "language": "Portuguese",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_isabela_br", "label": "Emerald Studio Athletic", "sheetUris": ["/assets/characters/isabela_rocha_br.jpg"], "isDefault": True}]
  },
  {
    "id": "amara_okonjo_ng",
    "displayName": "Amara Okonjo",
    "archetype": "poised Nigerian tech and culture commentator with commanding elegance",
    "description": "Lagos tech founder and commentator, 28, radiant deep mahogany skin, braided updo, vibrant mustard-yellow blazer.",
    "gender": "female",
    "era": "contemporary",
    "country": "Nigeria",
    "countryCode": "NG",
    "region": "Africa",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_amara_ng", "label": "Mustard Executive Blazer", "sheetUris": ["/assets/characters/amara_okonjo_ng.jpg"], "isDefault": True}]
  },
  {
    "id": "tunde_adebayo_ng",
    "displayName": "Tunde Adebayo",
    "archetype": "charismatic Nigerian lifestyle and comedy creator with dynamic presence",
    "description": "Abuja entertainer, 26, razor-sharp fade haircut, bright engaging smile, modern navy African patterned collar shirt.",
    "gender": "male",
    "era": "contemporary",
    "country": "Nigeria",
    "countryCode": "NG",
    "region": "Africa",
    "language": "Yoruba",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_tunde_ng", "label": "Modern Ankara Collar", "sheetUris": ["/assets/characters/tunde_adebayo_ng.jpg"], "isDefault": True}]
  },
  {
    "id": "ananya_roy_in",
    "displayName": "Ananya Roy",
    "archetype": "expressive Indian lifestyle and fashion storyteller with radiant charm",
    "description": "Mumbai lifestyle creator, 24, almond dark eyes, silky black hair, elegant terracotta kurta with delicate silver earrings.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia-Pacific",
    "language": "Hindi",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_ananya_in", "label": "Terracotta Handloom Kurta", "sheetUris": ["/assets/characters/ananya_roy_in.jpg"], "isDefault": True}]
  },
  {
    "id": "aarav_kapoor_in",
    "displayName": "Aarav Kapoor",
    "archetype": "sharp Indian tech reviewer and podcast host with confident analytical gaze",
    "description": "Bengaluru tech reviewer, 27, well-groomed beard, smart minimalist round spectacles, charcoal crewneck sweater.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia-Pacific",
    "language": "Hindi",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_aarav_in", "label": "Minimalist Tech Charcoal", "sheetUris": ["/assets/characters/aarav_kapoor_in.jpg"], "isDefault": True}]
  },
  {
    "id": "siti_lestari_id",
    "displayName": "Siti Lestari",
    "archetype": "warm Indonesian culinary and heritage creator with welcoming gentle smile",
    "description": "Jakarta culinary creator, 25, warm brown complexion, tasteful modern pastel batik blouse, welcoming friendly eyes.",
    "gender": "female",
    "era": "contemporary",
    "country": "Indonesia",
    "countryCode": "ID",
    "region": "Asia-Pacific",
    "language": "Indonesian",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_siti_id", "label": "Pastel Batik Blouse", "sheetUris": ["/assets/characters/siti_lestari_id.jpg"], "isDefault": True}]
  },
  {
    "id": "rizky_pratama_id",
    "displayName": "Rizky Pratama",
    "archetype": "innovative Indonesian creative director and gaming streamer with focused gaze",
    "description": "Bandung creative, 24, contemporary textured dark fringe, stylish dark olive overshirt, focused creative gaze.",
    "gender": "male",
    "era": "contemporary",
    "country": "Indonesia",
    "countryCode": "ID",
    "region": "Asia-Pacific",
    "language": "Indonesian",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_rizky_id", "label": "Olive Overshirt Studio", "sheetUris": ["/assets/characters/rizky_pratama_id.jpg"], "isDefault": True}]
  },
  {
    "id": "valentina_gomez_mx",
    "displayName": "Valentina Gómez",
    "archetype": "spirited Mexican culinary and cultural storyteller with vibrant authentic warmth",
    "description": "Mexico City cultural storyteller, 26, dark wavy hair, warm golden olive complexion, embroidered Oaxaca linen blouse.",
    "gender": "female",
    "era": "contemporary",
    "country": "Mexico",
    "countryCode": "MX",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_valentina_mx", "label": "Embroidered Oaxaca Linen", "sheetUris": ["/assets/characters/valentina_gomez_mx.jpg"], "isDefault": True}]
  },
  {
    "id": "mateo_hernandez_mx",
    "displayName": "Mateo Hernández",
    "archetype": "insightful Mexican automotive and sports vlogger with grounded confidence",
    "description": "Guadalajara creator, 28, neat short dark fade, light stubble, rugged dark denim jacket over white henley.",
    "gender": "male",
    "era": "contemporary",
    "country": "Mexico",
    "countryCode": "MX",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_mateo_mx", "label": "Vintage Denim Henley", "sheetUris": ["/assets/characters/mateo_hernandez_mx.jpg"], "isDefault": True}]
  },
  {
    "id": "yuna_park_kr",
    "displayName": "Yuna Park",
    "archetype": "chic Korean beauty and fashion innovator with refined minimalist aesthetic",
    "description": "Seoul trendsetter, 23, sleek glass-skin complexion, subtle soft mauve lip tint, oversized cream knitted cardigan.",
    "gender": "female",
    "era": "contemporary",
    "country": "South Korea",
    "countryCode": "KR",
    "region": "Asia-Pacific",
    "language": "Korean",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_yuna_kr", "label": "Oversized Cream Knit", "sheetUris": ["/assets/characters/yuna_park_kr.jpg"], "isDefault": True}]
  },
  {
    "id": "minho_song_kr",
    "displayName": "Minho Song",
    "archetype": "meticulous Korean tech and design reviewer with modern sharp styling",
    "description": "Seoul product designer, 26, contemporary two-block dark haircut, clear wireframe glasses, structured charcoal mock-neck.",
    "gender": "male",
    "era": "contemporary",
    "country": "South Korea",
    "countryCode": "KR",
    "region": "Asia-Pacific",
    "language": "Korean",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_minho_kr", "label": "Structured Charcoal Mock-Neck", "sheetUris": ["/assets/characters/minho_song_kr.jpg"], "isDefault": True}]
  },
  {
    "id": "chloe_taylor_us",
    "displayName": "Chloe Taylor",
    "archetype": "vibrant American comedy and pop-culture commentator with expressive bright smile",
    "description": "California creator, 24, sun-lit blonde balayage, open engaging smile, relaxed denim overshirt and gold hoops.",
    "gender": "female",
    "era": "contemporary",
    "country": "United States",
    "countryCode": "US",
    "region": "Americas",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_chloe_us", "label": "SoHo Denim Overshirt", "sheetUris": ["/assets/characters/chloe_taylor_us.jpg"], "isDefault": True}]
  },
  {
    "id": "jordan_cole_us",
    "displayName": "Jordan Cole",
    "archetype": "confident American podcast host and tech narrative creator with approachable warmth",
    "description": "Brooklyn commentator, 27, short faded fade haircut, warm dark skin, stylish tortoiseshell glasses, navy bomber jacket.",
    "gender": "male",
    "era": "contemporary",
    "country": "United States",
    "countryCode": "US",
    "region": "Americas",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_jordan_us", "label": "Brooklyn Studio Bomber", "sheetUris": ["/assets/characters/jordan_cole_us.jpg"], "isDefault": True}]
  },

  # -------------------------------------------------------------
  # 6. European Creators
  # -------------------------------------------------------------
  {
    "id": "sophie_clarke_uk",
    "displayName": "Sophie Clarke",
    "archetype": "articulate British literature and lifestyle essayist",
    "description": "London essayist, 26, soft auburn hair, hazel eyes, olive trenchcoat over fine turtleneck.",
    "gender": "female",
    "era": "contemporary",
    "country": "United Kingdom",
    "countryCode": "GB",
    "region": "Europe",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_sophie_uk", "label": "London Tailored Trench", "sheetUris": ["/assets/characters/sophie_clarke_uk.jpg"], "isDefault": True}]
  },
  {
    "id": "oliver_wright_uk",
    "displayName": "Oliver Wright",
    "archetype": "sharp British documentary host and architecture critic",
    "description": "Edinburgh documentary creator, 29, dark brown combed hair, charcoal wool overcoat.",
    "gender": "male",
    "era": "contemporary",
    "country": "United Kingdom",
    "countryCode": "GB",
    "region": "Europe",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_oliver_uk", "label": "Edinburgh Wool Overcoat", "sheetUris": ["/assets/characters/oliver_wright_uk.jpg"], "isDefault": True}]
  },
  {
    "id": "camille_dupont_fr",
    "displayName": "Camille Dupont",
    "archetype": "chic French cinema and art historian with effortless elegance",
    "description": "Parisian art critic, 25, wavy chestnut bob, dark green silk scarf and trench.",
    "gender": "female",
    "era": "contemporary",
    "country": "France",
    "countryCode": "FR",
    "region": "Europe",
    "language": "French",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_camille_fr", "label": "Saint-Germain Silk Scarf", "sheetUris": ["/assets/characters/camille_dupont_fr.jpg"], "isDefault": True}]
  },
  {
    "id": "julien_moreau_fr",
    "displayName": "Julien Moreau",
    "archetype": "contemplative French culinary artisan and philosophy essayist",
    "description": "Lyon culinary creator, 31, dark wavy hair, trimmed beard, structured navy linen workwear jacket.",
    "gender": "male",
    "era": "contemporary",
    "country": "France",
    "countryCode": "FR",
    "region": "Europe",
    "language": "French",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_julien_fr", "label": "Atelier Navy Workwear", "sheetUris": ["/assets/characters/julien_moreau_fr.jpg"], "isDefault": True}]
  },
  {
    "id": "hanna_weber_de",
    "displayName": "Hanna Weber",
    "archetype": "precise German industrial design and sustainability researcher",
    "description": "Berlin design innovator, 27, ash-blonde ponytail, architectural black mock-neck sweater.",
    "gender": "female",
    "era": "contemporary",
    "country": "Germany",
    "countryCode": "DE",
    "region": "Europe",
    "language": "German",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_hanna_de", "label": "Bauhaus Minimalist Black", "sheetUris": ["/assets/characters/hanna_weber_de.jpg"], "isDefault": True}]
  },
  {
    "id": "lukas_schmidt_de",
    "displayName": "Lukas Schmidt",
    "archetype": "dynamic German automotive engineer and tech podcaster",
    "description": "Munich tech host, 29, short brown hair, blue eyes, charcoal technical knit sweater.",
    "gender": "male",
    "era": "contemporary",
    "country": "Germany",
    "countryCode": "DE",
    "region": "Europe",
    "language": "German",
    "category": "creator",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_lukas_de", "label": "Munich Tech Crewneck", "sheetUris": ["/assets/characters/lukas_schmidt_de.jpg"], "isDefault": True}]
  },
  {
    "id": "celine_brun_ch",
    "displayName": "Céline Brun",
    "archetype": "serene Swiss alpine conservationist and documentary filmmaker",
    "description": "Zurich environmental filmmaker, 28, golden hazel eyes, warm cream alpaca wool knit.",
    "gender": "female",
    "era": "contemporary",
    "country": "Switzerland",
    "countryCode": "CH",
    "region": "Europe",
    "language": "German",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_celine_ch", "label": "Alpine Cream Alpaca", "sheetUris": ["/assets/characters/celine_brun_ch.jpg"], "isDefault": True}]
  },
  {
    "id": "mathias_alder_ch",
    "displayName": "Mathias Alder",
    "archetype": "methodical Swiss horology expert and luxury curator",
    "description": "Geneva horology specialist, 33, combed dark blonde hair, bespoke charcoal flannel blazer.",
    "gender": "male",
    "era": "contemporary",
    "country": "Switzerland",
    "countryCode": "CH",
    "region": "Europe",
    "language": "French",
    "category": "creator",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_mathias_ch", "label": "Geneva Charcoal Flannel", "sheetUris": ["/assets/characters/mathias_alder_ch.jpg"], "isDefault": True}]
  },
  {
    "id": "lucia_serrano_es",
    "displayName": "Lucía Serrano",
    "archetype": "passionate Spanish flamenco and performing arts director",
    "description": "Madrid arts director, 26, dark brown curls, deep warm eyes, modern terracotta linen blouse.",
    "gender": "female",
    "era": "contemporary",
    "country": "Spain",
    "countryCode": "ES",
    "region": "Europe",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_lucia_es", "label": "Terracotta Linen Blouse", "sheetUris": ["/assets/characters/lucia_serrano_es.jpg"], "isDefault": True}]
  },
  {
    "id": "javier_navarro_es",
    "displayName": "Javier Navarro",
    "archetype": "charismatic Spanish travel vlogger and maritime historian",
    "description": "Valencia explorer, 28, sun-bleached wavy hair, light beard, washed navy maritime polo.",
    "gender": "male",
    "era": "contemporary",
    "country": "Spain",
    "countryCode": "ES",
    "region": "Europe",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_javier_es", "label": "Valencia Maritime Polo", "sheetUris": ["/assets/characters/javier_navarro_es.jpg"], "isDefault": True}]
  },
  {
    "id": "giulia_romano_it",
    "displayName": "Giulia Romano",
    "archetype": "expressive Italian fashion journalist and architecture host",
    "description": "Rome lifestyle host, 26, dark eyes, tailored olive linen blazer, Roman courtyard backdrop.",
    "gender": "female",
    "era": "contemporary",
    "country": "Italy",
    "countryCode": "IT",
    "region": "Europe",
    "language": "Italian",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_giulia_it", "label": "Roman Olive Linen", "sheetUris": ["/assets/characters/giulia_romano_it.jpg"], "isDefault": True}]
  },
  {
    "id": "matteo_conti_it",
    "displayName": "Matteo Conti",
    "archetype": "charismatic Italian espresso artisan and culinary creator",
    "description": "Florence culinary creator, 29, dark wavy hair, light stubble, espresso barista apron over chambray.",
    "gender": "male",
    "era": "contemporary",
    "country": "Italy",
    "countryCode": "IT",
    "region": "Europe",
    "language": "Italian",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_matteo_it", "label": "Florence Artisanal Apron", "sheetUris": ["/assets/characters/matteo_conti_it.jpg"], "isDefault": True}]
  },
  {
    "id": "elif_demir_tr",
    "displayName": "Elif Demir",
    "archetype": "captivating Turkish travel vlogger and ceramic artist",
    "description": "Istanbul creator, 25, dark brown hair, warm amber eyes, terracotta silk blouse with gold pendant.",
    "gender": "female",
    "era": "contemporary",
    "country": "Turkey",
    "countryCode": "TR",
    "region": "Europe",
    "language": "Turkish",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_elif_tr", "label": "Bosphorus Silk Blouse", "sheetUris": ["/assets/characters/elif_demir_tr.jpg"], "isDefault": True}]
  },
  {
    "id": "kerem_yildiz_tr",
    "displayName": "Kerem Yıldız",
    "archetype": "dynamic Turkish documentary filmmaker and drone photographer",
    "description": "Istanbul filmmaker, 28, sharp jawline, short fade, charcoal bomber jacket, Bosphorus dusk backdrop.",
    "gender": "male",
    "era": "contemporary",
    "country": "Turkey",
    "countryCode": "TR",
    "region": "Europe",
    "language": "Turkish",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_kerem_tr", "label": "Bosphorus Bomber Jacket", "sheetUris": ["/assets/characters/kerem_yildiz_tr.jpg"], "isDefault": True}]
  },
  {
    "id": "elena_ionescu_ro",
    "displayName": "Elena Ionescu",
    "archetype": "articulate Romanian tech entrepreneur and AI researcher",
    "description": "Bucharest AI creator, 26, dark eyes, structured emerald green modern blazer.",
    "gender": "female",
    "era": "contemporary",
    "country": "Romania",
    "countryCode": "RO",
    "region": "Europe",
    "language": "Romanian",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_elena_ro", "label": "Emerald Tech Blazer", "sheetUris": ["/assets/characters/elena_ionescu_ro.jpg"], "isDefault": True}]
  },
  {
    "id": "andrei_popa_ro",
    "displayName": "Andrei Popa",
    "archetype": "friendly Romanian digital creator and tech educator",
    "description": "Cluj-Napoca creator, 27, dark wavy hair, well-groomed stubble, charcoal minimalist crewneck.",
    "gender": "male",
    "era": "contemporary",
    "country": "Romania",
    "countryCode": "RO",
    "region": "Europe",
    "language": "Romanian",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_andrei_ro", "label": "Charcoal Studio Knit", "sheetUris": ["/assets/characters/andrei_popa_ro.jpg"], "isDefault": True}]
  },
  {
    "id": "daria_morozova_ru",
    "displayName": "Daria Morozova",
    "archetype": "poised Eastern European winter lifestyle and fashion creator",
    "description": "St. Petersburg creator, 25, long ash-blonde hair, piercing blue eyes, ivory ribbed turtleneck.",
    "gender": "female",
    "era": "contemporary",
    "country": "Russia",
    "countryCode": "RU",
    "region": "Europe",
    "language": "Russian",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_daria_ru", "label": "Ivory Ribbed Turtleneck", "sheetUris": ["/assets/characters/daria_morozova_ru.jpg"], "isDefault": True}]
  },
  {
    "id": "nikolai_volkov_ru",
    "displayName": "Nikolai Volkov",
    "archetype": "focused documentary cinematographer and outdoor filmmaker",
    "description": "Filmmaker, 29, clean fade dark haircut, sharp jawline, black minimalist bomber jacket.",
    "gender": "male",
    "era": "contemporary",
    "country": "Russia",
    "countryCode": "RU",
    "region": "Europe",
    "language": "Russian",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_nikolai_ru", "label": "Filmmaker Bomber Jacket", "sheetUris": ["/assets/characters/nikolai_volkov_ru.jpg"], "isDefault": True}]
  },

  # -------------------------------------------------------------
  # 7. South American Creators
  # -------------------------------------------------------------
  {
    "id": "camila_alvarez_ar",
    "displayName": "Camila Álvarez",
    "archetype": "vibrant Argentine literary and theater director with bold creative voice",
    "description": "Buenos Aires director, 27, dark expressive eyes, vintage burgundy leather jacket.",
    "gender": "female",
    "era": "contemporary",
    "country": "Argentina",
    "countryCode": "AR",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_camila_ar", "label": "Burgundy Vintage Leather", "sheetUris": ["/assets/characters/camila_alvarez_ar.jpg"], "isDefault": True}]
  },
  {
    "id": "diego_rossi_ar",
    "displayName": "Diego Rossi",
    "archetype": "passionate Argentine music producer and cultural commentator",
    "description": "Buenos Aires producer, 30, dark hair with subtle fade, textured charcoal blazer over dark henley.",
    "gender": "male",
    "era": "contemporary",
    "country": "Argentina",
    "countryCode": "AR",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_diego_ar", "label": "San Telmo Studio Blazer", "sheetUris": ["/assets/characters/diego_rossi_ar.jpg"], "isDefault": True}]
  },
  {
    "id": "xiomara_quispe_pe",
    "displayName": "Xiomara Quispe",
    "archetype": "thoughtful Peruvian environmental scientist and Andean textile historian",
    "description": "Cusco heritage researcher, 25, deep brown Andean features, contemporary alpaca vest in indigo.",
    "gender": "female",
    "era": "contemporary",
    "country": "Peru",
    "countryCode": "PE",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_xiomara_pe", "label": "Indigo Andean Alpaca", "sheetUris": ["/assets/characters/xiomara_quispe_pe.jpg"], "isDefault": True}]
  },
  {
    "id": "gonzalo_flores_pe",
    "displayName": "Gonzalo Flores",
    "archetype": "visionary Peruvian gastronomic researcher and coastal chef",
    "description": "Lima culinary pioneer, 29, dark hair, trimmed beard, tailored navy linen chef overshirt.",
    "gender": "male",
    "era": "contemporary",
    "country": "Peru",
    "countryCode": "PE",
    "region": "Americas",
    "language": "Spanish",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_gonzalo_pe", "label": "Miraflores Linen Overshirt", "sheetUris": ["/assets/characters/gonzalo_flores_pe.jpg"], "isDefault": True}]
  },

  # -------------------------------------------------------------
  # 8. Asia-Pacific Creators
  # -------------------------------------------------------------
  {
    "id": "lin_chen_cn",
    "displayName": "Lin Chen",
    "archetype": "graceful Chinese lifestyle and design curator with gentle radiant smile",
    "description": "Shanghai lifestyle creator, 24, sleek black hair with soft bangs, oversized sage green linen shirt.",
    "gender": "female",
    "era": "contemporary",
    "country": "China",
    "countryCode": "CN",
    "region": "Asia-Pacific",
    "language": "Mandarin",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_lin_cn", "label": "Sage Green Linen", "sheetUris": ["/assets/characters/lin_chen_cn.jpg"], "isDefault": True}]
  },
  {
    "id": "bo_wang_cn",
    "displayName": "Bo Wang",
    "archetype": "articulate Chinese tech reviewer and hardware innovator with sharp glasses",
    "description": "Shenzhen tech reviewer, 27, textured black hair, tortoiseshell spectacles, minimalist black collarless shirt.",
    "gender": "male",
    "era": "contemporary",
    "country": "China",
    "countryCode": "CN",
    "region": "Asia-Pacific",
    "language": "Mandarin",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_bo_cn", "label": "Minimalist Collarless Black", "sheetUris": ["/assets/characters/bo_wang_cn.jpg"], "isDefault": True}]
  },
  {
    "id": "sienna_brooks_au",
    "displayName": "Sienna Brooks",
    "archetype": "infectious Australian coastal fitness and adventure creator",
    "description": "Sydney travel creator, 26, sun-kissed blonde bun, hazel eyes, rust-orange coastal linen tank top.",
    "gender": "female",
    "era": "contemporary",
    "country": "Australia",
    "countryCode": "AU",
    "region": "Asia-Pacific",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_sienna_au", "label": "Coastal Rust Linen Tank", "sheetUris": ["/assets/characters/sienna_brooks_au.jpg"], "isDefault": True}]
  },
  {
    "id": "jack_callahan_au",
    "displayName": "Jack Callahan",
    "archetype": "rugged Australian adventure filmmaker and wildlife documentarian",
    "description": "Byron Bay adventurer, 28, sandy brown wavy hair, sun-bronzed skin, vintage washed denim shirt over henley.",
    "gender": "male",
    "era": "contemporary",
    "country": "Australia",
    "countryCode": "AU",
    "region": "Asia-Pacific",
    "language": "English",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_jack_au", "label": "Byron Bay Washed Denim", "sheetUris": ["/assets/characters/jack_callahan_au.jpg"], "isDefault": True}]
  },
  {
    "id": "aoi_takahashi_jp",
    "displayName": "Aoi Takahashi",
    "archetype": "poised Japanese design and modern ceramic artisan with calm gaze",
    "description": "Tokyo fashion designer, 23, chic sleek bob, structured cream Japanese minimal blouse.",
    "gender": "female",
    "era": "contemporary",
    "country": "Japan",
    "countryCode": "JP",
    "region": "Asia-Pacific",
    "language": "Japanese",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_aoi_jp", "label": "Tokyo Minimalist Blouse", "sheetUris": ["/assets/characters/aoi_takahashi_jp.jpg"], "isDefault": True}]
  },
  {
    "id": "kenji_sato_jp",
    "displayName": "Kenji Sato",
    "archetype": "thoughtful Japanese specialty coffee roaster and culinary artisan",
    "description": "Shibuya artisan, 28, textured black hair, navy workwear apron over oatmeal crewneck.",
    "gender": "male",
    "era": "contemporary",
    "country": "Japan",
    "countryCode": "JP",
    "region": "Asia-Pacific",
    "language": "Japanese",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_kenji_jp", "label": "Shibuya Roaster Apron", "sheetUris": ["/assets/characters/kenji_sato_jp.jpg"], "isDefault": True}]
  },

  # -------------------------------------------------------------
  # 9. Indian Regional States & Languages (6 States, 12 Creators)
  # -------------------------------------------------------------
  {
    "id": "harleen_kaur_pb",
    "displayName": "Harleen Kaur",
    "archetype": "vibrant Punjabi cultural educator and folk dance choreographer",
    "description": "Amritsar creator, 24, bright hazel eyes, golden yellow Phulkari embroidered dupatta over emerald kurta.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Punjabi",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_harleen_pb", "label": "Phulkari Emerald Kurta", "sheetUris": ["/assets/characters/harleen_kaur_pb.jpg"], "isDefault": True}]
  },
  {
    "id": "gurpreet_singh_pb",
    "displayName": "Gurpreet Singh",
    "archetype": "proud Punjabi youth leader and agricultural innovator with royal blue turban",
    "description": "Punjab agricultural creator, 27, neatly tied royal blue turban, trimmed beard, crisp white kurta-pajama.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Punjabi",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_gurpreet_pb", "label": "Royal Blue Turban & Kurta", "sheetUris": ["/assets/characters/gurpreet_singh_pb.jpg"], "isDefault": True}]
  },
  {
    "id": "sayali_deshmukh_mh",
    "displayName": "Sayali Deshmukh",
    "archetype": "graceful Marathi theater actress and literature podcaster",
    "description": "Pune theater actress, 26, classical Marathi nose ring, deep marigold Paithani silk sari.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Marathi",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_sayali_mh", "label": "Marigold Paithani Sari", "sheetUris": ["/assets/characters/sayali_deshmukh_mh.jpg"], "isDefault": True}]
  },
  {
    "id": "rohit_shinde_mh",
    "displayName": "Rohit Shinde",
    "archetype": "sharp Marathi tech founder and cinema documentarian",
    "description": "Mumbai entrepreneur, 28, styled black hair, indigo Khadi cotton kurta-shirt, intelligent spectacles.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Marathi",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_rohit_mh", "label": "Indigo Khadi Kurta", "sheetUris": ["/assets/characters/rohit_shinde_mh.jpg"], "isDefault": True}]
  },
  {
    "id": "meenakshi_iyer_tn",
    "displayName": "Meenakshi Iyer",
    "archetype": "distinguished Tamil classical Carnatic vocalist and temple architecture historian",
    "description": "Chennai vocalist, 27, traditional jasmine flower gajra in hair, rich peacock-blue Kanjivaram silk sari.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Tamil",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_meenakshi_tn", "label": "Peacock Kanjivaram Silk", "sheetUris": ["/assets/characters/meenakshi_iyer_tn.jpg"], "isDefault": True}]
  },
  {
    "id": "karthik_subramanian_tn",
    "displayName": "Karthik Subramanian",
    "archetype": "dynamic Tamil tech lead and startup storyteller with crisp veshti",
    "description": "Chennai tech narrator, 29, neatly trimmed beard, pristine white silk shirt with gold border veshti.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Tamil",
    "category": "creator",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_karthik_tn", "label": "Silk Shirt & Gold Veshti", "sheetUris": ["/assets/characters/karthik_subramanian_tn.jpg"], "isDefault": True}]
  },
  {
    "id": "debjani_sen_wb",
    "displayName": "Debjani Sen",
    "archetype": "intellectual Bengali film critic and literary essayist with iconic red bindi",
    "description": "Kolkata literary essayist, 28, dark curls, round spectacles, prominent red bindi, ivory and red Baluchari sari.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Bengali",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_debjani_wb", "label": "Baluchari Ivory & Red Sari", "sheetUris": ["/assets/characters/debjani_sen_wb.jpg"], "isDefault": True}]
  },
  {
    "id": "sourav_banerjee_wb",
    "displayName": "Sourav Banerjee",
    "archetype": "thoughtful Bengali documentary photographer and indie music producer",
    "description": "Kolkata documentarian, 30, wavy dark hair, rimless spectacles, mustard-yellow raw tussar silk kurta.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Bengali",
    "category": "creator",
    "defaultVoiceId": "Fenrir",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_sourav_wb", "label": "Tussar Silk Mustard Kurta", "sheetUris": ["/assets/characters/sourav_banerjee_wb.jpg"], "isDefault": True}]
  },
  {
    "id": "anwita_gowda_ka",
    "displayName": "Anwita Gowda",
    "archetype": "innovative Kannada tech developer and heritage wildlife advocate",
    "description": "Bengaluru developer and advocate, 25, radiant dark eyes, emerald Ilkal cotton-silk handloom sari.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Kannada",
    "category": "creator",
    "defaultVoiceId": "Aoede",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_anwita_ka", "label": "Emerald Ilkal Handloom", "sheetUris": ["/assets/characters/anwita_gowda_ka.jpg"], "isDefault": True}]
  },
  {
    "id": "varun_hegde_ka",
    "displayName": "Varun Hegde",
    "archetype": "insightful Kannada entrepreneur and specialty coffee plantation curator",
    "description": "Coorg coffee curator, 28, neat short dark fade, olive linen shirt with rolled cuffs, warm confident gaze.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Kannada",
    "category": "creator",
    "defaultVoiceId": "Puck",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_varun_ka", "label": "Coorg Plantation Linen", "sheetUris": ["/assets/characters/varun_hegde_ka.jpg"], "isDefault": True}]
  },
  {
    "id": "arya_menon_kl",
    "displayName": "Arya Menon",
    "archetype": "serene Malayalam eco-architect and backwaters travel documentarian",
    "description": "Kochi architect, 26, dark wavy hair, gold jhumkas, traditional off-white Kasavu sari with golden zari border.",
    "gender": "female",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Malayalam",
    "category": "creator",
    "defaultVoiceId": "Kore",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_arya_kl", "label": "Kerala Gold Kasavu Sari", "sheetUris": ["/assets/characters/arya_menon_kl.jpg"], "isDefault": True}]
  },
  {
    "id": "pranav_nair_kl",
    "displayName": "Pranav Nair",
    "archetype": "visionary Malayalam indie cinema writer and sound designer",
    "description": "Trivandrum cinema creator, 29, thick dark beard, intelligent gaze, crisp off-white Kerala jubba shirt.",
    "gender": "male",
    "era": "contemporary",
    "country": "India",
    "countryCode": "IN",
    "region": "India Regional",
    "language": "Malayalam",
    "category": "creator",
    "defaultVoiceId": "Charon",
    "validationStatus": "VALIDATED",
    "wardrobe": [{"id": "w_pranav_kl", "label": "Off-White Kerala Jubba", "sheetUris": ["/assets/characters/pranav_nair_kl.jpg"], "isDefault": True}]
  }
]

with open("scripts/character_catalog.json", "w", encoding="utf-8") as f:
    json.dump(characters, f, indent=2, ensure_ascii=False)

print(f"Exported {len(characters)} characters to scripts/character_catalog.json!")
