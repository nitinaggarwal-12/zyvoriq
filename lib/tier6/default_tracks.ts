import { ANIME_SUBTITLE_CUES } from "./anime_subtitles";

export interface SeriesTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  character: string;
  videoSrc: string;
  audioSrc?: string;
  acts: any[];
  duration: number;
  veritas?: {
    status: string;
    snarkProofHash: string;
  };
  createdAt?: string;
}

export const CANONICAL_SERIES_TRACKS: SeriesTrack[] = [
  {
    "id": "track_history_mongol_conquest_20min",
    "title": "The Mongol Steppe Storm: Wrath of the Khans (20-Minute Epic)",
    "subtitle": "20-Act 1,200s (20-Minute) Master Historical Docu-Drama · Genghis Khan to the Four Khanates",
    "category": "history_geopolitics",
    "character": "🐎 Subutai Ba'atur & Genghis Khan (The Steppe Commanders)",
    "videoSrc": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
    "duration": 1200,
    "acts": [
      {
        "id": "mongol_act_1",
        "startTime": 0,
        "endTime": 60,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 1: The Altai Steppe & The Eternal Blue Sky (Tengri)",
        "philosophy": "Nomadic Endurance & Primordial Steppe Winds",
        "text": {
          "ja": "🐎 NARRATOR: 「見渡す限りの大草原。零下40度の極寒の風が吹き荒れるモンゴル高原で、世界最強の騎馬軍団が胎動する。」",
          "en": "🐎 NARRATOR: \"Across the endless windswept steppes of Central Asia beneath the Eternal Blue Sky, a martial nomadic culture forged in extreme adversity prepares to alter world history.\"",
          "es": "🐎 NARRATOR: \"A través de las interminables estepas bajo el Cielo Azul Eterno, una cultura nómada templada en la adversidad se prepara para cambiar la historia del mundo.\"",
          "fr": "🐎 NARRATOR: « À travers les steppes infinies balayées par les vents sous le Ciel Bleu Éternel, une culture nomade forgée dans l'adversité s'apprête à bouleverser l'histoire. »",
          "de": "🐎 NARRATOR: „Über den endlosen Steppen unter dem Ewigen Blauen Himmel formiert sich eine nomadische Kriegerkultur, um die Weltgeschichte zu verändern.“",
          "hi": "🐎 सूत्रधार: \"अनंत नीले आकाश के नीचे मध्य एशिया के तूफानी मैदानों में एक ऐसी घुड़सवार सेना का उदय होता है जो दुनिया का नक्शा बदलने वाली थी।\""
        }
      },
      {
        "id": "mongol_act_2",
        "startTime": 60,
        "endTime": 120,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Genghis Khan",
        "speakerRole": "Supreme Khagan of the Mongol Empire",
        "actName": "Act 2: Temüjin's Blood Oath & Unification of the Tribes (1206)",
        "philosophy": "Meritocratic Unity & Absolute Loyalty",
        "text": {
          "ja": "👑 GENGHIS KHAN: 「我らはひとつの矢のように束ねられた。氏族の壁を破り、実力のみが地位を決める。」",
          "en": "👑 GENGHIS KHAN: \"A single arrow is easily broken, but a bundle of arrows cannot be shattered. By the will of Tengri, all nomadic tribes are now united under one law — the Yassa.\"",
          "es": "👑 GENGHIS KHAN: \"Una sola flecha se quiebra fácilmente, pero un haz de flechas es indestructible. Bajo la Yassa, todas las tribus se unen.\"",
          "fr": "👑 GENGHIS KHAN: « Une seule flèche se brise facilement, mais un faisceau est indestructible. Par la volonté de Tengri, tous les clans sont unis sous la Yassa. »",
          "de": "👑 GENGHIS KHAN: „Ein einzelner Pfeil bricht leicht, ein Bündel Pfeile ist unzerbrechlich. Unter der Yassa sind alle Stämme vereint.“",
          "hi": "👑 चंगेज़ खान: \"एक अकेला तीर आसानी से टूट जाता है, लेकिन तीरों का गट्ठर अटूट होता है। यास्सा कानून के तहत सभी कबीले एकजुट हैं।\""
        }
      },
      {
        "id": "mongol_act_3",
        "startTime": 120,
        "endTime": 180,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Subutai Ba'atur",
        "speakerRole": "Supreme Military Strategist",
        "actName": "Act 3: The Horn Composite Bow & The Silk Undershirt",
        "philosophy": "Kinetic Ballistic Mastery & Battlefield Triage",
        "text": {
          "ja": "🏹 SUBUTAI: 「水牛の角と腱を張り合わせた複合弓。300メートル先から敵の重装甲を貫通する。」",
          "en": "🏹 SUBUTAI: \"Our composite recurve bows deliver 160 pounds of draw weight. Coupled with raw silk undershirts, our horsemen fight shielded against deep penetrating arrowheads.\"",
          "es": "🏹 SUBUTAI: \"Nuestros arcos compuestos curvos ofrecen 160 libras de potencia. Con camisas de seda cruda, nuestros jinetes quedan protegidos.\"",
          "fr": "🏹 SUBUTAI: « Nos arcs composites courbés délivrent une puissance colossale. Avec des sous-vêtements en soie, nos cavaliers sont protégés. »",
          "de": "🏹 SUBUTAI: „Unsere Kompositbögen besitzen enorme Durchschlagskraft. Seidenunterhemden schützen unsere Reiter vor tiefen Wunden.“",
          "hi": "🏹 सुबुताई: \"हमारे मिश्रित धनुष 300 मीटर की दूरी से भी दुश्मन के कवच को भेदने की अभूतपूर्व क्षमता रखते हैं।\""
        }
      },
      {
        "id": "mongol_act_4",
        "startTime": 180,
        "endTime": 240,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 4: The Decimal Military Hierarchy: Arban to Tumen",
        "philosophy": "Decentralized Modular Chain of Command",
        "text": {
          "ja": "🐎 NARRATOR: 「10人のアルバン、百人のジャグン、千人のミンガン、そして万人のトゥメン。厳格な十進法が電撃的な機動力を生む。」",
          "en": "🐎 NARRATOR: \"Structured in strict decimal units — from squads of ten (Arban) to armies of ten thousand (Tumen) — the Mongol cavalry operated with unmatched tactical synchronization.\"",
          "es": "🐎 NARRATOR: \"Estructurada en unidades decimales —desde escuadras de 10 hasta ejércitos de 10.000 (Tumen)— la caballería operaba con sincronización impecable.\"",
          "fr": "🐎 NARRATOR: « Structurée en unités décimales rigoureuses — de 10 guerriers à 10 000 (Tumen) — la cavalerie mongole manœuvre avec une synchronisation parfaite. »",
          "de": "🐎 NARRATOR: „Gegliedert in Zehnereinheiten – von 10 Kriegern bis zu 10.000 (Tumen) – agiert die Kavallerie mit perfekter Synchronisation.“",
          "hi": "🐎 सूत्रधार: \"10 सैनिकों के अर्बन से लेकर 10,000 की तुमेन तक — दशमलव सैन्य व्यवस्था ने मंगोल सेना को अद्वितीय गति दी।\""
        }
      },
      {
        "id": "mongol_act_5",
        "startTime": 240,
        "endTime": 300,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Genghis Khan",
        "speakerRole": "Supreme Khagan",
        "actName": "Act 5: Breaching the Great Wall: The Jin Dynasty Campaign (1211)",
        "philosophy": "Adaptive Siege Warfare & Tactical Flexibility",
        "text": {
          "ja": "👑 GENGHIS KHAN: 「金国の要塞万里の長城。野戦で敵主力をおびき出し、壊滅させる。」",
          "en": "👑 GENGHIS KHAN: \"The towering fortifications of the Jin Dynasty could not hold our mobility. By feigning retreat through mountain passes, we shattered their defending armies in open terrain.\"",
          "es": "👑 GENGHIS KHAN: \"Las murallas de la dinastía Jin no pudieron frenar nuestra movilidad. Fingiendo retiradas, destruimos sus ejércitos.\"",
          "fr": "👑 GENGHIS KHAN: « Les murailles de la dynastie Jin n'ont pu stopper notre mobilité. Par de fausses retraites, nous avons anéanti leurs armées. »",
          "de": "👑 GENGHIS KHAN: „Die Festungen der Jin-Dynastie konnten uns nicht aufhalten. Taktische Rückzüge lockten ihre Armeen ins offene Feld.“",
          "hi": "👑 चंगेज़ खान: \"जिन राजवंश की विशाल दीवारें हमारी रफ्तार को नहीं रोक सकीं। झूठे पीछे हटने की चाल से हमने उनकी सेना को खुले मैदान में हराया।\""
        }
      },
      {
        "id": "mongol_act_6",
        "startTime": 300,
        "endTime": 360,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 6: The Caravan at Otrar & The Khwarazmian Provocation (1219)",
        "philosophy": "The Sanctity of Trade & Absolute Retribution",
        "text": {
          "ja": "🐎 NARRATOR: 「オトラル総督による平和使節団の虐殺。この暴挙がホラズム帝国の完全な破滅の引き金となる。」",
          "en": "🐎 NARRATOR: \"The governor of Otrar slaughtered a peaceful 500-camel trade caravan sent by Genghis Khan. This fateful provocation unleashed the full fury of the Mongol war machine upon the Islamic world.\"",
          "es": "🐎 NARRATOR: \"La masacre de la caravana comercial en Otrar desató la furia total del ejército mongol sobre el Imperio Corasmio.\"",
          "fr": "🐎 NARRATOR: « Le massacre de la caravane commerciale à Otrar déclencha la fureur implacable de l'armée mongole contre l'Empire khwarezmien. »",
          "de": "🐎 NARRATOR: „Das Massaker an der Handelskarawane in Otrar entfesselte den Zorn der mongolischen Armee gegen das Choresmische Reich.“",
          "hi": "🐎 सूत्रधार: \"ओतरार में व्यापारिक कारवां की हत्या ने चंगेज़ खान के भीषण प्रतिशोध की ज्वाला को भड़का दिया।\""
        }
      },
      {
        "id": "mongol_act_7",
        "startTime": 360,
        "endTime": 420,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Subutai Ba'atur",
        "speakerRole": "Supreme Military Strategist",
        "actName": "Act 7: The Impossible Desert Crossing: Siege of Bukhara (1220)",
        "philosophy": "Operational Audacity & Flanking from the Void",
        "text": {
          "ja": "🏹 SUBUTAI: 「誰もが越えられないと信じたキジルクム砂漠。我らは裏口からブハラ城塞の背後に現れた。」",
          "en": "🏹 SUBUTAI: \"Marching 300 miles through the untracked Kyzylkum Desert deemed impenetrable by Sultan Shah, our columns emerged directly behind Bukhara, catching the garrison in utter disbelief.\"",
          "es": "🏹 SUBUTAI: \"Cruzando 300 millas del impenetrable desierto de Kyzylkum, aparecimos directamente detrás de Bujará.\"",
          "fr": "🏹 SUBUTAI: « Traversant 500 kilomètres du désert réputé infranchissable du Kyzylkoum, nous avons surgi dans le dos de Boukhara. »",
          "de": "🏹 SUBUTAI: „Ein 500-Kilometer-Marsch durch die Wüste Kyzylkum brachte uns direkt hinter die Stadtmauern von Buchara.“",
          "hi": "🏹 सुबुताई: \"दुर्गम रेगिस्तान को पार कर हमारी सेना सीधे बुखारा के पीछे जा पहुंची और दुश्मन को चकित कर दिया।\""
        }
      },
      {
        "id": "mongol_act_8",
        "startTime": 420,
        "endTime": 480,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 8: The Siege of Samarkand & Captured Engineering Corps",
        "philosophy": "Integrated Polymath Siege Technology",
        "text": {
          "ja": "🐎 NARRATOR: 「サマルカンドの戦い。中国の火薬工とイスラムの投石機技師を統合した最新鋭の攻城兵器が壁を破る。」",
          "en": "🐎 NARRATOR: \"At the legendary city of Samarkand, the Mongols deployed captured Chinese gunpowder engineers and Muslim trebuchet specialists, turning high-tech siege craft into devastating warfare.\"",
          "es": "🐎 NARRATOR: \"En Samarcanda, los mongoles combinaron la pólvora china con catapultas de torsión para demoler las defensas.\"",
          "fr": "🐎 NARRATOR: « À Samarcande, les Mongols intégrèrent des ingénieurs chinois spécialistes de la poudre et des maîtres d'artillerie musulmans. »",
          "de": "🐎 NARRATOR: „Vor Samarkand kombinierten mongolische Truppen chinesisches Schießpulver mit fortschrittlicher Belagerungstechnik.“",
          "hi": "🐎 सूत्रधार: \"समरकंद के घेरे में चीनी बारूद और मध्यकालीन तोपखाने की संयुक्त शक्ति ने शहर की दीवारों को ढहा दिया।\""
        }
      },
      {
        "id": "mongol_act_9",
        "startTime": 480,
        "endTime": 540,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Jebe Noyan",
        "speakerRole": "Vanguard General",
        "actName": "Act 9: The 5,000-Mile Reconnaissance Raid Around the Caspian",
        "philosophy": "Deep Cavalry Infiltration & Geopolitical Mapping",
        "text": {
          "ja": "🐎 JEBE: 「スブタイと共にわずか2万の騎兵でカスピ海を一周。カフカス山脈を越え、未知の大陸を疾走した。」",
          "en": "🐎 JEBE: \"With only 20,000 horsemen, Subutai and I rode around the entire Caspian Sea, crossing the frozen Caucasus mountains in history's greatest military reconnaissance expedition.\"",
          "es": "🐎 JEBE: \"Con solo 20.000 jinetes, rodeamos el Mar Caspio y cruzamos el Cáucaso en la mayor expedición de reconocimiento de la historia.\"",
          "fr": "🐎 JEBE: « Avec seulement 20 000 cavaliers, nous avons contourné la mer Caspienne et franchi le Caucase dans le plus grand raid de reconnaissance de l'histoire. »",
          "de": "🐎 JEBE: „Mit nur 20.000 Reitern umrundeten wir das Kaspische Meer auf dem kühnsten Erkundungszug der Militärgeschichte.“",
          "hi": "🐎 जेबे: \"मात्र 20,000 घुड़सवारों के साथ हमने कैस्पियन सागर की परिक्रमा कर इतिहास का सबसे बड़ा सैन्य टोही अभियान पूरा किया।\""
        }
      },
      {
        "id": "mongol_act_10",
        "startTime": 540,
        "endTime": 600,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Subutai Ba'atur",
        "speakerRole": "Supreme Military Strategist",
        "actName": "Act 10: Battle of the Kalka River (1223): The Master Feigned Retreat",
        "philosophy": "Psychological Exhaustion & Decisive Encirclement",
        "text": {
          "ja": "🏹 SUBUTAI: 「9日間にわたる偽装退却。油断し伸び切った8万のルーシ連合軍をカルカ河畔で包囲殲滅した。」",
          "en": "🏹 SUBUTAI: \"For nine consecutive days we feigned disorder and fled westward. When the 80,000-strong coalition of Rus and Cuman knights became overextended and exhausted, we turned and annihilated them at the Kalka River.\"",
          "es": "🏹 SUBUTAI: \"Durante 9 días fingimos huir. Cuando los 80.000 caballeros rusos se agotaron, giramos y los destruimos en el río Kalka.\"",
          "fr": "🏹 SUBUTAI: « Pendant neuf jours, nous avons simulé la fuite. Lorsque l'armée coalisée de 80 000 chevaliers fut épuisée, nous l'avons anéantie à la Kalka. »",
          "de": "🏹 SUBUTAI: „Neun Tage lang täuschten wir die Flucht vor. Als die 80.000 Ritter erschöpft waren, zerschlugen wir sie an der Kalka.“",
          "hi": "🏹 सुबुताई: \"9 दिनों तक पीछे हटने का नाटक कर हमने 80,000 की रूसी सेना को थका दिया और कालका नदी के तट पर घेर कर नष्ट कर दिया।\""
        }
      },
      {
        "id": "mongol_act_11",
        "startTime": 600,
        "endTime": 660,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 11: The Passing of Genghis Khan & The Kurultai of 1227",
        "philosophy": "Dynastic Transition & The Global Mandate",
        "text": {
          "ja": "🐎 NARRATOR: 「1227年、大オルドにてチンギス・カン崩御。カラコルムのクリルタイでオゴデイが第2代大ハーンに即位する。」",
          "en": "🐎 NARRATOR: \"In 1227, Genghis Khan passed into eternity beneath the steppe skies. At the Kurultai assembly in Karakorum, Ögedei Khan succeeded his father, expanding the empire's mandate to the far ends of the earth.\"",
          "es": "🐎 NARRATOR: \"En 1227 murió Gengis Kan. En el Kurultai de Karakórum, Ogodei asumió el mando para expandir el imperio a escala global.\"",
          "fr": "🐎 NARRATOR: « En 1227, Gengis Khan s'éteignit. Lors du grand Kurultai de Karakorum, Ögödei lui succéda pour étendre l'empire aux confins du monde. »",
          "de": "🐎 NARRATOR: „1227 starb Dschingis Khan. Auf dem Kurultai in Karakorum übernahm Ögedei die Führung des Weltreichs.“",
          "hi": "🐎 सूत्रधार: \"1227 में चंगेज़ खान के निधन के बाद काराकोरम में ओगदेई खान ने साम्राज्य की बागडोर संभाली।\""
        }
      },
      {
        "id": "mongol_act_12",
        "startTime": 660,
        "endTime": 720,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Batu Khan",
        "speakerRole": "Founder of the Golden Horde",
        "actName": "Act 12: Frozen River Highways: The Winter Invasion of Rus (1237-1240)",
        "philosophy": "Winter Asymmetric Warfare & Logistical Domination",
        "text": {
          "ja": "🐎 BATU KHAN: 「凍結したロシアの河川こそが我らの高速道路。氷上を疾走し、キエフ大公国を制圧した。」",
          "en": "🐎 BATU KHAN: \"Where European armies halted in winter mud, our horses traversed frozen rivers like express highways. City after city fell as the Golden Horde established dominance across the Eastern European forest belts.\"",
          "es": "🐎 BATU KHAN: \"Los ríos congelados fueron nuestras autopistas de invierno. La Horda de Oro dominó toda Europa del Este.\"",
          "fr": "🐎 BATU KHAN: « Les rivières gelées devinrent nos autoroutes d'hiver. La Horde d'Or imposa sa suprématie sur toute la Russie. »",
          "de": "🐎 BATU KHAN: „Zugefrorene Flüsse dienten uns als Straßen. Die Goldene Horde unterwarf die Fürstentümer der Rus im Eiltempo.“",
          "hi": "🐎 बाटू खान: \"जमी हुई नदियां हमारे घोड़ों के लिए राजमार्ग बन गईं और गोल्डेन होर्ड ने पूरे पूर्वी यूरोप पर नियंत्रण कर लिया।\""
        }
      },
      {
        "id": "mongol_act_13",
        "startTime": 720,
        "endTime": 780,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Subutai Ba'atur",
        "speakerRole": "Supreme Military Strategist",
        "actName": "Act 13: Dual Strategic Pincer: Battles of Legnica & Mohi (1241)",
        "philosophy": "Multi-Theater Strategic Convergence Across 500 Miles",
        "text": {
          "ja": "🏹 SUBUTAI: 「同日、500キロ離れたポーランドとハンガリーで欧州騎士団を同時撃破。西洋に戦慄が走った。」",
          "en": "🏹 SUBUTAI: \"Operating 500 miles apart with synchronized dispatch couriers, our Northern army crushed the Teutonic Knights at Legnica while our Southern force decimated the Hungarian royal army at Mohi on the Sajo River.\"",
          "es": "🏹 SUBUTAI: \"A 500 millas de distancia y coordinados por correos, derrotamos a los Caballeros Teutónicos en Legnica y al ejército húngaro en Mohi.\"",
          "fr": "🏹 SUBUTAI: « À 800 kilomètres de distance et en parfaite coordination, nous avons vaincu les Chevaliers Teutoniques à Legnica et l'armée hongroise à Mohi. »",
          "de": "🏹 SUBUTAI: „Über eine Distanz von 800 Kilometern zerschlugen wir die Deutschordensritter bei Liegnitz und das ungarische Heer bei Mohi.“",
          "hi": "🏹 सुबुताई: \"500 मील की दूरी पर एक साथ समन्वित हमलों में हमने लेग्निका और मोही के मैदानों में यूरोपीय सेनाओं को परास्त किया।\""
        }
      },
      {
        "id": "mongol_act_14",
        "startTime": 780,
        "endTime": 840,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Hulagu Khan",
        "speakerRole": "Founder of the Ilkhanate",
        "actName": "Act 14: The Fall of Baghdad & The End of the Abbasid Caliphate (1258)",
        "philosophy": "Total Siege Annihilation & Geopolitical Realignment",
        "text": {
          "ja": "👑 HULAGU KHAN: 「知恵の館を誇るアッバース朝の都バグダード。500年のカリフ制がティグリス川の底に沈む。」",
          "en": "👑 HULAGU KHAN: \"At the walls of Baghdad, capital of the Abbasid Caliphate for half a millennium, our heavy siege trains forced unconditional surrender, permanently reshaping the Middle East.\"",
          "es": "👑 HULAGU KHAN: \"En las murallas de Bagdad, nuestras máquinas de asedio pusieron fin al califato abasí tras 500 años.\"",
          "fr": "👑 HULAGU KHAN: « Devant les murailles de Bagdad, nos puissantes machines de siège mirent un terme à cinq siècles de califat abbasside. »",
          "de": "👑 HULAGU KHAN: „Vor den Toren Bagdads beendeten unsere Belagerungstruppen das fünfhundertjährige abbasidische Kalifat.“",
          "hi": "👑 हुलागु खान: \"बगदाद के पतन के साथ 500 साल पुराने अब्बासी खिलाफत का अंत हुआ और मध्य पूर्व का इतिहास हमेशा के लिए बदल गया।\""
        }
      },
      {
        "id": "mongol_act_15",
        "startTime": 840,
        "endTime": 900,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 15: The Climax at Ain Jalut: The Mamluk Stand (1260)",
        "philosophy": "The Limits of Nomadic Expansion & Desert Realities",
        "text": {
          "ja": "🐎 NARRATOR: 「アイン・ジャールートの泉。マムルーク朝がモンゴル不敗神話に初めて立ち向かった激戦。」",
          "en": "🐎 NARRATOR: \"At the Spring of Goliath (Ain Jalut), Mamluk cavalry under Qutuz and Baibars deployed the Mongols' own tactics of feigned retreat to halt the steppe advance into Egypt.\"",
          "es": "🐎 NARRATOR: \"En Ain Jalut, la caballería mameluca utilizó las propias tácticas mongolas para frenar su avance hacia Egipto.\"",
          "fr": "🐎 NARRATOR: « À Ain Djalout, la cavalerie mamelouke utilisa les tactiques mongoles pour stopper leur progression vers l'Égypte. »",
          "de": "🐎 NARRATOR: „Bei Ain Djalut stoppten die Mamluken den mongolischen Vormarsch nach Ägypten mit deren eigener Taktik.“",
          "hi": "🐎 सूत्रधार: \"ऐन जालूत के मैदान में मामलुक घुड़सवारों ने मंगोलों की रणनीति का उपयोग कर उनके मिस्र विजय अभियान को रोका।\""
        }
      },
      {
        "id": "mongol_act_16",
        "startTime": 900,
        "endTime": 960,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Kublai Khan",
        "speakerRole": "Emperor Shizu of Yuan",
        "actName": "Act 16: Khanbaliq & The Founding of the Yuan Dynasty (1271)",
        "philosophy": "Nomadic Rule Over Sedentary Civilizations",
        "text": {
          "ja": "👑 KUBLAI KHAN: 「大都（現在の北京）に新都を築く。遊牧民の武力と中国の官僚制度が融合した元朝の誕生である。」",
          "en": "👑 KUBLAI KHAN: \"At Khanbaliq (modern Beijing), we founded the Yuan Dynasty, synthesizing the equestrian strength of the steppe with the bureaucratic governance of Imperial China.\"",
          "es": "👑 KUBLAI KHAN: \"En Janbalic fundamos la dinastía Yuan, uniendo la fuerza ecuestre de la estepa con la administración imperial china.\"",
          "fr": "👑 KUBLAI KHAN: « À Khanbalik, nous avons fondé la dynastie Yuan, alliant la puissance équestre de la steppe à l'administration impériale chinoise. »",
          "de": "👑 KUBLAI KHAN: „In Khanbaliq gründeten wir die Yuan-Dynastie und verbanden Steppenkriegertum mit kaiserlicher Verwaltung.“",
          "hi": "👑 कुबलई खान: \"खानबालिक (बीजिंग) में हमने युआन राजवंश की स्थापना की और स्टेपी की शक्ति को चीनी सभ्यता के साथ जोड़ा।\""
        }
      },
      {
        "id": "mongol_act_17",
        "startTime": 960,
        "endTime": 1020,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 17: The Kamikaze Typhoons: Invasion Fleets of Japan (1274 & 1281)",
        "philosophy": "The Limits of Naval Amphibious Operations",
        "text": {
          "ja": "🐎 NARRATOR: 「博多湾を埋め尽くした数千隻の元軍船。だが二度にわたる『神風』の猛威が艦隊を壊滅させた。」",
          "en": "🐎 NARRATOR: \"Massive amphibious invasion armadas sailed across the Tsushima Strait to conquer Japan. Twice, ferocious typhoons known as the Kamikaze wrecked the fleets off the shores of Hakata Bay.\"",
          "es": "🐎 NARRATOR: \"Dos gigantescas flotas navales intentaron invadir Japón, pero violentos tifones destruyeron las armadas en la bahía de Hakata.\"",
          "fr": "🐎 NARRATOR: « D'immenses armadas maritimes tentèrent de conquérir le Japon, mais de violents typhons — les Kamikazes — anéantirent les flottes. »",
          "de": "🐎 NARRATOR: „Zwei riesige Invasionsflotten scheiterten an den Küsten Japans durch die verheerenden Taifune – die Kamikaze.“",
          "hi": "🐎 सूत्रधार: \"जापान पर विजय के लिए भेजे गए विशाल नौसैनिक बेड़े को समुद्र में उठे भीषण तूफानों (कामिकेज़) ने नष्ट कर दिया।\""
        }
      },
      {
        "id": "mongol_act_18",
        "startTime": 1020,
        "endTime": 1080,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 18: Pax Mongolica: The Yam Relay & Global Trade Boom",
        "philosophy": "Global Continental Integration & Secure Commerce",
        "text": {
          "ja": "🐎 NARRATOR: 「パクス・モンゴリカ。駅伝制『ジャムチ』により、ローマから北京まで商人が金板を掲げて安全に往来した。」",
          "en": "🐎 NARRATOR: \"The Pax Mongolica established the first continental free-trade zone. Through the Yam postal relay network, a maiden bearing a golden nugget could traverse Eurasia safely from the Danube to the Pacific Ocean.\"",
          "es": "🐎 NARRATOR: \"La Pax Mongolica creó una zona continental de libre comercio y comunicación mediante la red postal Yam.\"",
          "fr": "🐎 NARRATOR: « La Pax Mongolica instaura la première zone de libre-échange continentale reliée par le réseau postal ultra-rapide du Yam. »",
          "de": "🐎 NARRATOR: „Die Pax Mongolica schuf eine kontinentale Freihandelszone, gesichert durch das hocheffiziente Yam-Pferdepostsystem.“",
          "hi": "🐎 सूत्रधार: \"पैक्स मंगोलिका और याम डाक प्रणाली ने यूरोप से एशिया तक सुरक्षित व्यापार और सांस्कृतिक आदान-प्रदान का मार्ग खोला।\""
        }
      },
      {
        "id": "mongol_act_19",
        "startTime": 1080,
        "endTime": 1140,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Narrator",
        "speakerRole": "Military Historian",
        "actName": "Act 19: The Four Khanates: Partition of the World Empire",
        "philosophy": "Imperial Scale & Regional Metamorphosis",
        "text": {
          "ja": "🐎 NARRATOR: 「元朝、キプチャク汗国、イル汗国、チャガタイ汗国。広大すぎる帝国は4つの独立した汗国へと分立した。」",
          "en": "🐎 NARRATOR: \"Spanning 24 million square kilometers, the largest contiguous land empire in history partitioned into four great polities: the Yuan Dynasty, the Golden Horde, the Ilkhanate, and the Chagatai Khanate.\"",
          "es": "🐎 NARRATOR: \"Con 24 millones de km², el imperio se dividió en cuatro kanatos: la dinastía Yuan, la Horda de Oro, el Ilkanato y Chagatai.\"",
          "fr": "🐎 NARRATOR: « Couvrant 24 millions de km², le plus grand empire territorial se partagea en quatre grands khanats souverains. »",
          "de": "🐎 NARRATOR: „Mit 24 Millionen Quadratkilometern teilte sich das größte Landreich der Geschichte in vier eigenständige Khanate.“",
          "hi": "🐎 सूत्रधार: \"2.4 करोड़ वर्ग किलोमीटर में फैला यह साम्राज्य चार बड़े खानतों में विभाजित होकर इतिहास में अमर हो गया।\""
        }
      },
      {
        "id": "mongol_act_20",
        "startTime": 1140,
        "endTime": 1200,
        "videoUrl": "/assets/video/veo_mongol_steppe_warfare_master.mp4",
        "speaker": "Genghis Khan",
        "speakerRole": "Supreme Khagan",
        "actName": "Act 20: The Eternal Steppe Legacy & Veritas Provenance",
        "philosophy": "Indelible Historical Footprint on Modern Civilizations",
        "text": {
          "ja": "👑 GENGHIS KHAN: 「私の肉体が滅びようとも、開かれた交易路、法体系、人々の記憶は永遠に生き続ける。」",
          "en": "👑 GENGHIS KHAN: \"Though mortal kings turn to dust beneath the grass, the interconnected world we forged through blood, law, and iron will endure across all centuries to come.\"",
          "es": "👑 GENGHIS KHAN: \"Aunque los reyes mortales se conviertan en polvo, el mundo interconectado que forjamos perdurará por los siglos.\"",
          "fr": "👑 GENGHIS KHAN: « Bien que les rois mortels retournent à la poussière, le monde interconnecté que nous avons forgé perdurera à travers les siècles. »",
          "de": "👑 GENGHIS KHAN: „Auch wenn Könige zu Staub zerfallen, bleibt die vernetzte Welt, die wir schufen, für alle Zeiten bestehen.“",
          "hi": "👑 चंगेज़ खान: \"राजा और साम्राज्य भले ही धूल में मिल जाएं, लेकिन हमारे द्वारा बनाई गई नई दुनिया सदियों तक जीवित रहेगी।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x9e8170c1aa3902b892a018cbb4901928"
    }
  },
  {
    "id": "track_wildlife_serengeti_120s",
    "title": "Serengeti & Masai Mara: The 15-Act Wildlife Odyssey",
    "subtitle": "15-Act 120s 4K African Wildlife Documentary · The Great Migration & Apex Predators",
    "category": "nature",
    "character": "🦁 Serengeti Apex Wildlife & Savannah Ecosystem",
    "videoSrc": "/assets/video/serengeti_savannah_8s.mp4",
    "duration": 120,
    "acts": [
      {
        "id": "wildlife_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/serengeti_savannah_8s.mp4",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 1: Dawn Over the Serengeti Plain",
        "philosophy": "The Awakening Savannah",
        "text": {
          "ja": "🦁 NARRATOR: 「夜明けの金色の光が地平線を照らし、百万頭のヌーが命がけの大移動を開始します。」",
          "en": "🦁 NARRATOR: \"Golden dawn breaks across the endless acacia plains of the Serengeti as the great migration begins.\"",
          "es": "🦁 NARRATOR: \"El amanecer dorado despierta las llanuras del Serengeti cuando comienza la gran migración.\"",
          "fr": "🦁 NARRATOR: « L'aube dorée illumine les plaines du Serengeti alors que commence la grande migration. »",
          "de": "🦁 NARRATOR: „Der goldene Sonnenaufgang erhellt die Serengeti-Ebene bei Beginn der großen Tierwanderung.“",
          "hi": "🦁 सूत्रधार: \"सेरेनगेटी के सुनहरे मैदानों पर सुबह की पहली किरण के साथ महान प्रवासन का आरंभ होता है।\""
        }
      },
      {
        "id": "wildlife_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/serengeti_lion.mp4",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 2: The Lion Pride Awakens",
        "philosophy": "Apex Predator Dominance",
        "text": {
          "ja": "🦁 NARRATOR: 「岩山の上で威厳あるライオンの群れが目覚め、獲物の気配を鋭く探ります。」",
          "en": "🦁 NARRATOR: \"A powerful pride of lions stirs on the kopje rocks, scanning the morning horizon for prey.\"",
          "es": "🦁 NARRATOR: \"Una manada de leones se despereza sobre las rocas, vigilando el horizonte en busca de presas.\"",
          "fr": "🦁 NARRATOR: « Une troupe de lions s'éveille sur les rochers, scrutant l'horizon matinal en quête de proies. »",
          "de": "🦁 NARRATOR: „Ein Löwenrudel erwacht auf den Felsen und späht den morgendlichen Horizont nach Beute ab.“",
          "hi": "🦁 सूत्रधार: \"चट्टानों पर शेरों का झुंड जागता है और शिकार की तलाश में नज़रें दौड़ाता है।\""
        }
      },
      {
        "id": "wildlife_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/serengeti_cheetah.mp4",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 3: Cheetah in the Tall Grass",
        "philosophy": "Silent Stalking & Focus",
        "text": {
          "ja": "🦁 NARRATOR: 「風に揺れる黄金の草むらの中、チーターが音もなくガゼルへと忍び寄ります。」",
          "en": "🦁 NARRATOR: \"Crouched low in the whispering golden grass, a solitary cheetah locks eyes with a grazing gazelle.\"",
          "es": "🦁 NARRATOR: \"Agachado en la hierba dorada, un guepardo solitario fija su mirada en una gacela.\"",
          "fr": "🦁 NARRATOR: « Accroupi dans les herbes dorées, un guépard solitaire fixe une gazelle qui broute. »",
          "de": "🦁 NARRATOR: „Geduckt im goldenen Gras fixiert ein einsamer Gepard eine grasende Gazelle.“",
          "hi": "🦁 सूत्रधार: \"सुनहरी घास में छिपा एक चीता चरती हुई गज़ेल पर अपनी नज़रें गड़ाता है।\""
        }
      },
      {
        "id": "wildlife_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/serengeti_act_4_cheetah_sprint.mp4",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 4: The 70mph Cheetah Sprint",
        "philosophy": "Aerodynamic Kinetic Power",
        "text": {
          "ja": "🦁 NARRATOR: 「時速110キロの爆発的な疾走！大地を蹴り、驚異的な敏捷性で獲物を追いつめます。」",
          "en": "🦁 NARRATOR: \"Explosive acceleration at 70 miles per hour! A breathtaking sprint across the sunbaked earth.\"",
          "es": "🦁 NARRATOR: \"¡Aceleración explosiva a más de 100 km/h! Una carrera asombrosa por la tierra árida.\"",
          "fr": "🦁 NARRATOR: « Une accélération fulgurante à plus de 100 km/h ! Un sprint spectaculaire à travers la savane. »",
          "de": "🦁 NARRATOR: „Explosive Beschleunigung auf über 100 km/h! Ein atemberaubender Sprint über den staubigen Boden.“",
          "hi": "🦁 सूत्रधार: \"100 किमी प्रति घंटे की रफ्तार से विस्फोटक दौड़! सवाना की धरती पर रोमांचक पीछा।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x8f2d91a082bc310d289aa84bb9084e88"
    }
  },
  {
    "id": "track_anime_kaizen",
    "title": "The Master & The Apprentice: Path to Kaizen",
    "subtitle": "7-Act 56s Cinematic Japanese Anime Series · Sensei Ren & Apprentice Aoi",
    "category": "anime",
    "character": "🥋 Sensei Ren & Apprentice Aoi",
    "videoSrc": "/assets/video/ren_and_aoi_conversation_synced.mp4",
    "acts": [],
    "duration": 56,
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x8f2d61bca79e4310d289aa84bb234f9011"
    }
  },
  {
    "id": "track_executive_sovereign",
    "title": "Executive Sovereign AI Keynote",
    "subtitle": "Frontier Autonomous Intelligence & Veritas zk-SNARK Provenance",
    "category": "executive",
    "character": "👩‍💼 Priya Sharma (Chief AI Officer)",
    "videoSrc": "/assets/video/priya_4k_10act_master.mp4",
    "duration": 24,
    "acts": [
      {
        "id": "exec_act_1",
        "startTime": 0,
        "endTime": 12,
        "videoUrl": "/assets/video/priya_4k_10act_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Chief AI Officer",
        "actName": "Act 1: Frontier Autonomous AI",
        "philosophy": "Sovereign Intelligence Architecture",
        "text": {
          "ja": "🌐 PRIYA: 「企業の意思決定を加速する自律型AIインテリジェンスの新時代へようこそ。」",
          "en": "🌐 PRIYA: \"Welcome to the frontier of sovereign autonomous enterprise intelligence.\"",
          "es": "🌐 PRIYA: \"Bienvenidos a la frontera de la inteligencia empresarial autónoma y soberana.\"",
          "fr": "🌐 PRIYA: « Bienvenue à la frontière de l'intelligence d'entreprise souveraine et autonome. »",
          "de": "🌐 PRIYA: „Willkommen an der Grenze souveräner autonomer Unternehmensintelligenz.“",
          "hi": "🌐 प्रिया: \"स्वायत्त उद्यम बुद्धिमत्ता के नए युग में आपका स्वागत है।\""
        }
      },
      {
        "id": "exec_act_2",
        "startTime": 12,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_priya_24s_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Chief AI Officer",
        "actName": "Act 2: Cryptographic zk-SNARK Sealing",
        "philosophy": "Veritas Zero-Drift Media Synthesis",
        "text": {
          "ja": "🌐 PRIYA: 「Veritas暗号化証明書により、すべての主張と動画フレームの真実性を保証します。」",
          "en": "🌐 PRIYA: \"Veritas zk-SNARK guarantees claim-level grounding and zero lip-sync drift.\"",
          "es": "🌐 PRIYA: \"Veritas zk-SNARK garantiza la veracidad y cero desfase labial.\"",
          "fr": "🌐 PRIYA: « Veritas zk-SNARK garantit l'ancrage des faits et zéro décalage labial. »",
          "de": "🌐 PRIYA: „Veritas zk-SNARK garantiert faktische Fundierung und 0ms Drift.“",
          "hi": "🌐 प्रिया: \"वेरिटास तकनीक हर दावे की प्रामाणिकता और सटीक लिप-सिंक सुनिश्चित करती है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x4e9a82b31cd904fe716bb21890ea5541"
    }
  },
  {
    "id": "track_fantasy_starlight_wyrm",
    "title": "Citadel of the Starlight Wyrm (32s Master)",
    "subtitle": "4-Act 32s High Fantasy Epic with Floating Arcane Spires & Crystalline Dragon Flight",
    "category": "fantasy_scifi",
    "character": "🏰 Elena Rostova (Arcane Chronicler)",
    "videoSrc": "/assets/video/veo_fantasy_32s_act1.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "fantasy_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_fantasy_32s_act1.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Arcane Chronicler",
        "actName": "Act 1: Awakening of the Floating Runes",
        "philosophy": "Ancient Celestial Resonance",
        "text": {
          "ja": "🏰 ELENA: 「千年の眠りから覚めた星光のルーンが、浮遊要塞の尖塔を黄金色に染め上げる。」",
          "en": "🏰 ELENA: \"Awakened from a thousand-year slumber, the starlight runes bathe the floating citadel in golden fire.\"",
          "es": "🏰 ELENA: \"Despertadas de un sueño milenario, las runas estelares bañan la ciudadela flotante en fuego dorado.\"",
          "fr": "🏰 ELENA: « Éveillées d'un sommeil millénaire, les runes stellaires baignent la citadelle flottante de lumière dorée. »",
          "de": "🏰 ELENA: „Erwacht aus tausendjährigem Schlaf tauchen die Sternenrunen die schwebende Zitadelle in goldenes Licht.“",
          "hi": "🏰 एलेना: \"हजारों साल की नींद से जागे रहस्यमयी संकेत तैरते किले को सुनहरे प्रकाश से भर देते हैं।\""
        },
        "audioUrl": "/assets/audio/audio_fantasy_act1.wav"
      },
      {
        "id": "fantasy_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_fantasy_32s_act2.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Arcane Chronicler",
        "actName": "Act 2: Flight of the Crystal Dragon",
        "philosophy": "Majesty of the Skies",
        "text": {
          "ja": "🏰 ELENA: 「雲海を裂いて飛翔する水晶竜。その翼が放つプリズムが天空を虹色に染める。」",
          "en": "🏰 ELENA: \"Shattering the sea of clouds, the crystalline dragon takes flight, its prismatic wings painting the sky.\"",
          "es": "🏰 ELENA: \"Surcando el mar de nubes, el dragón de cristal alza el vuelo, pintando el cielo con sus alas prismáticas.\"",
          "fr": "🏰 ELENA: « Fendant la mer de nuages, le dragon de cristal s'élance, peignant le ciel de ses ailes prismatiques. »",
          "de": "🏰 ELENA: „Das Wolkenmeer durchbrechend steigt der Kristalldrache empor und taucht den Himmel in Prismenfarben.“",
          "hi": "🏰 एलेना: \"बादलों को चीरता हुआ क्रिस्टल ड्रैगन आसमान में अपने रंग बिखेरता है।\""
        },
        "audioUrl": "/assets/audio/audio_fantasy_act2.wav"
      },
      {
        "id": "fantasy_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_fantasy_32s_act3.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Arcane Chronicler",
        "actName": "Act 3: Lightning Storm on Celestial Peaks",
        "philosophy": "Elemental Primordial Power",
        "text": {
          "ja": "🏰 ELENA: 「天空の雷鳴が轟き、古代の守護結界が紫紺の稲妻と共に覚醒する。」",
          "en": "🏰 ELENA: \"Arcane thunder echoes through the heavens as the celestial ward awakens with violet lightning.\"",
          "es": "🏰 ELENA: \"El trueno arcano resuena en los cielos mientras la barrera celestial despierta.\"",
          "fr": "🏰 ELENA: « Le tonnerre arcanique gronde dans les cieux alors que la barrière céleste s'éveille. »",
          "de": "🏰 ELENA: „Arkaner Donner hallt durch die Himmel, während die Schutzbarriere erwacht.“",
          "hi": "🏰 एलेना: \"आकाशीय गर्जना के साथ प्राचीन सुरक्षा चक्र जागृत हो उठता है।\""
        },
        "audioUrl": "/assets/audio/audio_fantasy_act3.wav"
      },
      {
        "id": "fantasy_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_fantasy_32s_act4.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Arcane Chronicler",
        "actName": "Act 4: Oath of the Starlight Wardens",
        "philosophy": "Eternal Guardian Vow",
        "text": {
          "ja": "🏰 ELENA: 「星々の加護のもと、聖なる誓いが結ばれ、浮遊都市は新たな黎明を迎える。」",
          "en": "🏰 ELENA: \"Under the celestial gaze of ancient constellations, the sacred covenant is renewed for all eternity.\"",
          "es": "🏰 ELENA: \"Bajo la mirada celeste de constelaciones ancestrales, el pacto sagrado se renueva por la eternidad.\"",
          "fr": "🏰 ELENA: « Sous le regard céleste des constellations ancestrales, le pacte sacré est scellé pour l'éternité. »",
          "de": "🏰 ELENA: „Unter dem Himmelsblick uralter Sternbilder wird der heilige Bund für alle Ewigkeit erneuert.“",
          "hi": "🏰 एलेना: \"तारों की छत्रछाया में प्राचीन प्रतिज्ञा सदा के लिए अमर हो जाती है।\""
        },
        "audioUrl": "/assets/audio/audio_fantasy_act4.wav"
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x1f9048a729e018cbb490192837482a10"
    },
    "audioSrc": "/assets/audio/audio_fantasy_act1.wav"
  },
  {
    "id": "track_gaming_nexus_arena",
    "title": "Grand Finals: Nexus Arena Championship (32s Master)",
    "subtitle": "4-Act 32s Tactical Esports Arena Championship · Stadium Walkout to Victory Confetti",
    "category": "gaming",
    "character": "🎮 Aoi Takahashi (Esports Caster)",
    "videoSrc": "/assets/video/veo_gaming_32s_act1.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "gaming_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_gaming_32s_act1.mp4",
        "speaker": "Aoi Takahashi",
        "speakerRole": "Esports Lead Caster",
        "actName": "Act 1: Stadium Walkout & Crowd Roar",
        "philosophy": "Arena Kinetic Atmosphere",
        "text": {
          "ja": "🎮 AOI: 「超満員のネクサスアリーナ！5万人の大歓声の中、グランドファイナルが開幕します！」",
          "en": "🎮 AOI: \"A sold-out Nexus Arena! 50,000 screaming fans roar as the Grand Finals kickoff!\"",
          "es": "🎮 AOI: \"¡El Nexus Arena completamente lleno! ¡50.000 aficionados rugen al inicio de la Gran Final!\"",
          "fr": "🎮 AOI: « L'arène Nexus comble ! 50 000 fans hurlent alors que la grande finale débute ! »",
          "de": "🎮 AOI: „Eine ausverkaufte Nexus Arena! 50.000 Fans jubeln zum Start des großen Finales!“",
          "hi": "🎮 आओई: \"खचाखच भरा नेक्सस एरिना! 50,000 प्रशंसकों के जयघोष के साथ ग्रैंड फाइनल्स की शुरुआत!\""
        },
        "audioUrl": "/assets/audio/audio_gaming_act1.wav"
      },
      {
        "id": "gaming_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_gaming_32s_act2.mp4",
        "speaker": "Aoi Takahashi",
        "speakerRole": "Esports Lead Caster",
        "actName": "Act 2: Holographic Draft & Battle Stage",
        "philosophy": "Macro Tactical Strategy",
        "text": {
          "ja": "🎮 AOI: 「ホログラフィックドラフト画面が点灯！両チームの伝説のアバターがステージ中央に顕現します！」",
          "en": "🎮 AOI: \"The holographic draft screen ignites as both teams lock in their signature battle avatars!\"",
          "es": "🎮 AOI: \"¡La pantalla holográfica se ilumina mientras ambos equipos eligen a sus avatares!\"",
          "fr": "🎮 AOI: « L'écran holographique s'illumine alors que les équipes verrouillent leurs avatars ! »",
          "de": "🎮 AOI: „Der holografische Draft-Bildschirm leuchtet auf, während die Teams ihre Avatare wählen!“",
          "hi": "🎮 आओई: \"होलोग्राफिक स्क्रीन पर दोनों टीमें अपने मुख्य लड़ाकू अवतारों को चुनती हैं!\""
        },
        "audioUrl": "/assets/audio/audio_gaming_act2.wav"
      },
      {
        "id": "gaming_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_gaming_32s_act3.mp4",
        "speaker": "Aoi Takahashi",
        "speakerRole": "Esports Lead Caster",
        "actName": "Act 3: 5v5 Team Fight Decisive Climax",
        "philosophy": "Sub-Millisecond Execution",
        "text": {
          "ja": "🎮 AOI: 「決定的集団戦！超高速のスキルコンボが炸裂し、敵の防衛ラインを一瞬で粉砕！」",
          "en": "🎮 AOI: \"Decisive 5v5 teamfight! Frame-perfect ultimate combos shatter the enemy defense in milliseconds!\"",
          "es": "🎮 AOI: \"¡Pelea de equipo decisiva 5v5! ¡Los combos definitivos destrozan la defensa rival!\"",
          "fr": "🎮 AOI: « Combat d'équipe décisif en 5v5 ! Les combos ultimes brisent la défense adverse ! »",
          "de": "🎮 AOI: „Entscheidender 5v5-Teamkampf! Perfekte Combos durchbrechen die gegnerische Abwehr!“",
          "hi": "🎮 आओई: \"निर्णायक 5v5 मुकाबला! सटीक रणनीतिक हमलों ने विरोधी खेमे को ध्वस्त कर दिया!\""
        },
        "audioUrl": "/assets/audio/audio_gaming_act3.wav"
      },
      {
        "id": "gaming_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_gaming_32s_act4.mp4",
        "speaker": "Aoi Takahashi",
        "speakerRole": "Esports Lead Caster",
        "actName": "Act 4: Trophy Ceremony & Confetti Shower",
        "philosophy": "Championship Glory",
        "text": {
          "ja": "🎮 AOI: 「GG！黄金のトロフィーが掲げられ、金色の紙吹雪がアリーナ全体に舞い散ります！」",
          "en": "🎮 AOI: \"GG! The golden trophy is raised high as championship confetti showers the entire arena!\"",
          "es": "🎮 AOI: \"¡GG! ¡El trofeo dorado se alza mientras el confeti inunda toda la arena!\"",
          "fr": "🎮 AOI: « GG ! Le trophée doré est brandi alors que les confettis inondent l'arène ! »",
          "de": "🎮 AOI: „GG! Der goldene Pokal wird emporgehoben, während Konfetti die Arena erfüllt!“",
          "hi": "🎮 आओई: \"शानदार जीत! स्वर्णिम ट्रॉफी के साथ जश्न और आतिशबाजी का अद्भुत नज़ारा!\""
        },
        "audioUrl": "/assets/audio/audio_gaming_act4.wav"
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x7b2a9e018cbb490192837482a1049de8"
    },
    "audioSrc": "/assets/audio/audio_gaming_act1.wav"
  },
  {
    "id": "track_cinema_midnight_shadow",
    "title": "Midnight Shadow: The Last Detective (32s Master)",
    "subtitle": "4-Act 32s 35mm Chicago Film Noir Mystery in Heavy Rain",
    "category": "cinema",
    "character": "🕵️ Marcus Vance (Detective Cole)",
    "videoSrc": "/assets/video/veo_cinema_noir_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "noir_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_cinema_noir_master.mp4",
        "speaker": "Detective Cole",
        "speakerRole": "Film Noir Protagonist",
        "actName": "Act 1: Rain Over Wabash Avenue",
        "philosophy": "Hardboiled Realism",
        "text": {
          "ja": "🕵️ COLE: 「午前2時のシカゴ。雨はすべての罪を洗い流そうとするが、真実は消せない。」",
          "en": "🕵️ COLE: \"2 AM in Chicago. Rain tries to wash away every sin, but truth leaves a stain.\"",
          "es": "🕵️ COLE: \"2 AM en Chicago. La lluvia intenta lavar cada pecado, pero la verdad siempre deja marca.\"",
          "fr": "🕵️ COLE: « 2h du matin à Chicago. La pluie tente d'effacer les péchés, mais la vérité persiste. »",
          "de": "🕵️ COLE: „2 Uhr morgens in Chicago. Der Regen will alles reinwaschen, doch die Wahrheit bleibt.“",
          "hi": "🕵️ कोल: \"रात के दो बजे की शिकागो की बारिश हर राज़ को अपने आगोश में समेट लेती है।\""
        }
      },
      {
        "id": "noir_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_cinema_noir_genuine.mp4",
        "speaker": "Detective Cole",
        "speakerRole": "Film Noir Protagonist",
        "actName": "Act 2: Flickering Gas Streetlamp Shadows",
        "philosophy": "Atmospheric Suspense",
        "text": {
          "ja": "🕵️ COLE: 「路地の街灯がチカチカと点滅し、濡れたアスファルトに怪しい影が伸びる。」",
          "en": "🕵️ COLE: \"The flickering gas lamp hums in the mist, casting long, crooked shadows across the wet bricks.\"",
          "es": "🕵️ COLE: \"La farola parpadea en la niebla, proyectando sombras alargadas sobre los ladrillos húmedos.\"",
          "fr": "🕵️ COLE: « Le réverbère vacille dans la brume, projetant de longues ombres sur les pavés mouillés. »",
          "de": "🕵️ COLE: „Die flackernde Gaslaterne wirft lange Schatten auf das nasse Pflaster.“",
          "hi": "🕵️ कोल: \"स्ट्रीटलाइट की मद्धम रोशनी में भीगी सड़कों पर रहस्यमयी परछाइयां लहराती हैं।\""
        }
      },
      {
        "id": "noir_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_cinema_noir_master.mp4",
        "speaker": "Detective Cole",
        "speakerRole": "Film Noir Protagonist",
        "actName": "Act 3: The Matchstick & Trenchcoat Clue",
        "philosophy": "Cerebral Deduction",
        "text": {
          "ja": "🕵️ COLE: 「マッチの炎が一瞬だけ顔を照らす。探していた証拠は最初からここにあった。」",
          "en": "🕵️ COLE: \"A struck match briefly cuts through the dark. The missing ledger was here all along.\"",
          "es": "🕵️ COLE: \"Un fósforo encendido corta la oscuridad. El libro de cuentas perdido siempre estuvo aquí.\"",
          "fr": "🕵️ COLE: « Une allumette craquée fend l'obscurité. Le registre manquant était là depuis le début. »",
          "de": "🕵️ COLE: „Ein brennendes Streichholz erhellt die Dunkelheit. Die Beweise waren die ganze Zeit hier.“",
          "hi": "🕵️ कोल: \"माचिस की एक तीली अंधेरे को चीरती है और खोया हुआ सुराग सामने आ जाता है।\""
        }
      },
      {
        "id": "noir_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_cinema_noir_genuine.mp4",
        "speaker": "Detective Cole",
        "speakerRole": "Film Noir Protagonist",
        "actName": "Act 4: Disappearing into Midnight Fog",
        "philosophy": "Solitary Resolution",
        "text": {
          "ja": "🕵️ COLE: 「コートの襟を立て、霧深い夜の闇へと姿を消す。事件は終わった。」",
          "en": "🕵️ COLE: \"Collar pulled high against the chill, slipping into the midnight fog. Case closed.\"",
          "es": "🕵️ COLE: \"Cuello alzado contra el frío, desvaneciéndose en la niebla de medianoche. Caso cerrado.\"",
          "fr": "🕵️ COLE: « Col relevé contre le froid, s'effaçant dans le brouillard nocturne. Affaire classée. »",
          "de": "🕵️ COLE: „Kragen hochgeschlagen gegen die Kälte, verschwindend im Mitternachtsnebel. Fall gelöst.“",
          "hi": "🕵️ कोल: \"कोट का कॉलर उठाकर आधी रात के कोहरे में ओझल होते हुए, केस बंद।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x5a1920bc482a1049de8170c1aa3902f8"
    }
  },
  {
    "id": "track_culinary_miyazaki_wagyu",
    "title": "The Art of A5 Miyazaki Wagyu Searing (32s Master)",
    "subtitle": "4-Act 32s Michelin Masterclass on Binchotan Charcoal & 54°C Core Searing",
    "category": "culinary",
    "character": "🍳 Kenji Sato (Michelin Star Chef)",
    "videoSrc": "/assets/video/veo_culinary_wagyu_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "culinary_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_culinary_wagyu_master.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Michelin Executive Chef",
        "actName": "Act 1: A5 Snow Marbling Inspection",
        "philosophy": "Ingredient Reverence",
        "text": {
          "ja": "🍳 SATO: 「見事なA5等級の霜降り。脂の融点は25度、体温で溶け出す極上の肉質です。」",
          "en": "🍳 SATO: \"Pristine A5 BMS 12 marbling. The oleic acid melts at room temperature, pure perfection.\"",
          "es": "🍳 SATO: \"Impecable marmoleado A5 BMS 12. La grasa se funde a temperatura ambiente.\"",
          "fr": "🍳 SATO: « Persillage A5 BMS 12 parfait. Le gras fond à température ambiante, pure excellence. »",
          "de": "🍳 SATO: „Perfekte A5-Marmorierung. Das Fett schmilzt bereits bei Raumtemperatur.“",
          "hi": "🍳 सातो: \"अद्वितीय A5 ग्रेड मार्बलिंग, जो कमरे के तापमान पर ही पिघलने लगती है।\""
        }
      },
      {
        "id": "culinary_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_culinary_wagyu_genuine.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Michelin Executive Chef",
        "actName": "Act 2: The White Binchotan Charcoal Sear",
        "philosophy": "Far-Infrared Precision",
        "text": {
          "ja": "🍳 SATO: 「白炭備長炭の遠赤外線で表面を一気にキャラメリゼ。メイラード反応が芳醇な香りを生む。」",
          "en": "🍳 SATO: \"Seared over white Kishu Binchotan charcoal. Far-infrared heat triggers rapid Maillard caramelization.\"",
          "es": "🍳 SATO: \"Sellado sobre carbón Binchotan. El calor infrarrojo desata la caramelización Maillard.\"",
          "fr": "🍳 SATO: « Saisi au charbon Binchotan blanc. La chaleur infrarouge déclenche la caramélisation de Maillard. »",
          "de": "🍳 SATO: „Scharf angebraten über weißer Binchotan-Kohle für optimale Maillard-Karamellisierung.“",
          "hi": "🍳 सातो: \"चारकोल की आंच पर सतह का सटीक कैरामेलाइजेशन और अनूठा स्वाद।\""
        }
      },
      {
        "id": "culinary_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_culinary_wagyu_master.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Michelin Executive Chef",
        "actName": "Act 3: Core Resting & Internal Juices",
        "philosophy": "Thermal Equilibrium",
        "text": {
          "ja": "🍳 SATO: 「5分間のレストで芯温を54度に均一化。肉汁が繊維全体に再循環します。」",
          "en": "🍳 SATO: \"Five minutes of gentle resting allows the core temperature to stabilize at exactly 54 degrees Celsius.\"",
          "es": "🍳 SATO: \"Cinco minutos de reposo permiten estabilizar la temperatura interna a 54°C.\"",
          "fr": "🍳 SATO: « Cinq minutes de repos permettent d'atteindre une température à cœur idéale de 54°C. »",
          "de": "🍳 SATO: „Fünf Minuten Ruhephase bringen die Kerntemperatur auf exakte 54°C.“",
          "hi": "🍳 सातो: \"पांच मिनट का विश्राम तापमान को सटीक 54 डिग्री पर संतुलित करता है।\""
        }
      },
      {
        "id": "culinary_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_culinary_wagyu_genuine.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Michelin Executive Chef",
        "actName": "Act 4: Maldon Flake Salt & Service",
        "philosophy": "Minimalist Perfection",
        "text": {
          "ja": "🍳 SATO: 「仕上げに結晶塩をひとつまみ。素材本来の旨味が口いっぱいに広がる至高の体験。」",
          "en": "🍳 SATO: \"Finished with hand-harvested sea salt flakes. An ethereal gastronomic harmony.\"",
          "es": "🍳 SATO: \"Finalizado con escamas de sal marina. Una armonía gastronómica inigualable.\"",
          "fr": "🍳 SATO: « Sublimé par une pincée de fleur de sel. Une harmonie gastronomique sublime. »",
          "de": "🍳 SATO: „Veredelt mit Meersalzflocken für vollendete Geschmacksharmonie.“",
          "hi": "🍳 सातो: \"समुद्री नमक के कणों के साथ परोसा गया यह व्यंजन स्वाद का सर्वोच्च अनुभव है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x892a018cbb490192837482a1049de817"
    }
  },
  {
    "id": "track_wellness_advaita_vedanta",
    "title": "Advaita Vedanta: The Observer & The Observed (32s Master)",
    "subtitle": "4-Act 32s Sacred Non-Dual Philosophy & Himalayan Hermitage Sunrise",
    "category": "wellness_faith",
    "character": "🕉️ Priya Sharma (Vedantic Scholar)",
    "videoSrc": "/assets/video/veo_wellness_vedanta_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "vedanta_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_wellness_vedanta_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Vedantic Scholar",
        "actName": "Act 1: Dawn Over the Sacred Ganges",
        "philosophy": "Stillness of Consciousness",
        "text": {
          "ja": "🕉️ PRIYA: 「ヒマラヤの夜明け。川面を渡る静寂の中に、純粋な意識が目覚めます。」",
          "en": "🕉️ PRIYA: \"Dawn breaks over the sacred Himalayan mist. In absolute silence, pure awareness awakens.\"",
          "es": "🕉️ PRIYA: \"Amanece sobre la sagrada niebla del Himalaya. En el silencio absoluto despierta la consciencia pura.\"",
          "fr": "🕉️ PRIYA: « L'aube se lève sur la brume sacrée de l'Himalaya. Dans le silence pur s'éveille la conscience. »",
          "de": "🕉️ PRIYA: „Dämmerung über dem heiligen Himalaya-Nebel. In vollkommener Stille erwacht reines Bewusstsein.“",
          "hi": "🕉️ प्रिया: \"हिमालय के पावन शिखर पर भोर की पहली किरण शुद्ध चेतना को जागृत करती है।\""
        }
      },
      {
        "id": "vedanta_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_wellness_vedanta_genuine.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Vedantic Scholar",
        "actName": "Act 2: The Flame of Unwavering Attention",
        "philosophy": "Single-Pointed Focus (Ekagrata)",
        "text": {
          "ja": "🕉️ PRIYA: 「揺らぐことのない一筋の灯火。観る者と観られるものの境界が溶け合っていく。」",
          "en": "🕉️ PRIYA: \"Like an unmoving flame in a windless place, the division between observer and observed dissolves.\"",
          "es": "🕉️ PRIYA: \"Como una llama inmóvil sin viento, la división entre observador y observado se disuelve.\"",
          "fr": "🕉️ PRIYA: « Telle une flamme immobile dans le calme, la frontière entre l'observateur et l'observé s'efface. »",
          "de": "🕉️ PRIYA: „Wie eine unbewegte Flamme im windstillen Raum löst sich die Trennung von Beobachter und Beobachtetem auf.“",
          "hi": "🕉️ प्रिया: \"अविचल दीपक की भांति दृष्टा और दृश्य का भेद मिट जाता है।\""
        }
      },
      {
        "id": "vedanta_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_wellness_vedanta_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Vedantic Scholar",
        "actName": "Act 3: Tat Tvam Asi (That Thou Art)",
        "philosophy": "The Great Non-Dual Truth",
        "text": {
          "ja": "🕉️ PRIYA: 「『汝はそれなり』。無限の空間と自己がひとつであるという究極の理解。」",
          "en": "🕉️ PRIYA: \"Tat Tvam Asi — 'That Thou Art'. The realization that the boundless cosmos and the self are one.\"",
          "es": "🕉️ PRIYA: \"Tat Tvam Asi: 'Tú eres eso'. La realización de que el cosmos infinito y el ser son uno.\"",
          "fr": "🕉️ PRIYA: « Tat Tvam Asi : 'Tu es cela'. La prise de conscience que l'univers infini et le soi ne font qu'un. »",
          "de": "🕉️ PRIYA: „Tat Tvam Asi – ‚Das bist Du‘. Die Erkenntnis, dass der unendliche Kosmos und das Selbst eins sind.“",
          "hi": "🕉️ प्रिया: \"तत्त्वमसि — 'वह तुम ही हो'। अनंत ब्रह्मांड और स्वयं के एक होने का दिव्य बोध।\""
        }
      },
      {
        "id": "vedanta_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_wellness_vedanta_genuine.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Vedantic Scholar",
        "actName": "Act 4: Infinite Peace (Shanti)",
        "philosophy": "Abidance in the Absolute",
        "text": {
          "ja": "🕉️ PRIYA: 「シャンティ、シャンティ、シャンティ。永遠の平安が心を満たします。」",
          "en": "🕉️ PRIYA: \"Om Shanti, Shanti, Shanti. Eternal peace pervades every realm of existence.\"",
          "es": "🕉️ PRIYA: \"Om Shanti, Shanti, Shanti. La paz eterna inunda toda la existencia.\"",
          "fr": "🕉️ PRIYA: « Om Shanti, Shanti, Shanti. La paix éternelle emplit chaque recoin de l'existence. »",
          "de": "🕉️ PRIYA: „Om Shanti, Shanti, Shanti. Ewiger Friede erfüllt das gesamte Dasein.“",
          "hi": "🕉️ प्रिया: \"ॐ शांति, शांति, शांति। शाश्वत शांति समस्त अस्तित्व में व्याप्त हो जाती है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x918cbb490192837482a1049de8170c1a"
    }
  },
  {
    "id": "track_music_synthwave_2099",
    "title": "2099 Cyberpunk Synthwave Beat Lab (32s Master)",
    "subtitle": "4-Act 32s 128 BPM Analog Modular Session with Holographic Synthesizers in Neo-Tokyo",
    "category": "music",
    "character": "🎹 Kenji Sato (Sound Architect)",
    "videoSrc": "/assets/video/veo_music_synthwave_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "music_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_music_synthwave_master.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Electronic Music Producer",
        "actName": "Act 1: Patching the Analog Moog",
        "philosophy": "Raw Voltage & Harmonic Resonance",
        "text": {
          "ja": "🎵 KENJI: 「モジュラーシンセのパッチケーブルが接続され、128BPMのアナログパルスが響き渡る。」",
          "en": "🎵 KENJI: \"Modular patch cables lock in as the 128 BPM analog pulse resonates through the Tokyo night.\"",
          "es": "🎵 KENJI: \"Los cables modulares se conectan mientras el pulso analógico a 128 BPM resuena.\"",
          "fr": "🎵 KENJI: « Les câbles modulaires se verrouillent alors que la pulsation analogique résonne. »",
          "de": "🎵 KENJI: „Modulare Patchkabel rasten ein, während der analoge 128-BPM-Puls pulsiert.“",
          "hi": "🎵 केनजी: \"मॉड्यूलर सिंथेसाइज़र के सुर 128 बीपीएम की धड़कन के साथ जीवंत हो उठते हैं।\""
        }
      },
      {
        "id": "music_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_music_synthwave_genuine.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Electronic Music Producer",
        "actName": "Act 2: The Holographic Spectrum Drop",
        "philosophy": "Kinetic Bass Architecture",
        "text": {
          "ja": "🎵 KENJI: 「低周波のサブベースが炸裂し、ホログラフィックスペクトラムが夜空に光を描く。」",
          "en": "🎵 KENJI: \"The sub-bass drops into pure harmonic overdrive, lighting up the holographic spectrum analyzers.\"",
          "es": "🎵 KENJI: \"El subgrave desciende en sobremarcha armónica, iluminando el espectro holográfico.\"",
          "fr": "🎵 KENJI: « Les basses profondes explosent en harmonie, illuminant les analyseurs holographiques. »",
          "de": "🎵 KENJI: „Der Subbass fällt in reine harmonische Verzerrung und erhellt das Frequenzspektrum.“",
          "hi": "🎵 केनजी: \"गहरा बेस गूंजता है और होलोग्राम तरंगों में प्रकाश बिखेरता है।\""
        }
      },
      {
        "id": "music_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_music_synthwave_master.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Electronic Music Producer",
        "actName": "Act 3: Arpeggiator Resonance Build",
        "philosophy": "Frequency Modulation",
        "text": {
          "ja": "🎵 KENJI: 「16分音符のアルペジオがビルドアップし、フィルターレゾナンスがピークに達する。」",
          "en": "🎵 KENJI: \"The 16th-note arpeggio ramps up as the resonance peak sweeps across the stereo field.\"",
          "es": "🎵 KENJI: \"El arpegio de semicorcheas aumenta mientras la resonancia barre el campo estéreo.\"",
          "fr": "🎵 KENJI: « L'arpège en doubles-croches s'intensifie alors que la résonance balaie l'espace stéréo. »",
          "de": "🎵 KENJI: „Das 16tel-Arpeggio baut sich auf und der Resonanzfilter öffnet das Stereofeld.“",
          "hi": "🎵 केनजी: \"तेज धुन के साथ संगीत की ऊर्जा अपने चरम पर पहुंचती है।\""
        }
      },
      {
        "id": "music_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_music_synthwave_genuine.mp4",
        "speaker": "Kenji Sato",
        "speakerRole": "Electronic Music Producer",
        "actName": "Act 4: Master Track Outro & Spatial Decay",
        "philosophy": "Infinite Acoustic Space",
        "text": {
          "ja": "🎵 KENJI: 「無限のリバーブテールが静寂に溶け込み、32秒のマスターセッションが完成する。」",
          "en": "🎵 KENJI: \"An infinite spatial reverb tail fades into silence as the 32-second master synthesis completes.\"",
          "es": "🎵 KENJI: \"Una reverberación espacial infinita se desvanece en silencio completando la síntesis maestra de 32 segundos.\"",
          "fr": "🎵 KENJI: « Une réverbération spatiale infinie s'éteint dans le silence alors que la session de 32s s'achève. »",
          "de": "🎵 KENJI: „Ein unendlicher Hall verklingt in der Stille und vollendet die 32-Sekunden-Mastersynthese.“",
          "hi": "🎵 केनजी: \"अनंत गूंज शांत होकर 32 सेकंड की मास्टर रिकॉर्डिंग को पूर्णता प्रदान करती है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x3d7a8f1920bc482a1049de8170c1aa39"
    }
  },
  {
    "id": "track_science_alphafold_cures",
    "title": "AlphaFold 3: Designing Atomic Targeted Medicines (32s Master)",
    "subtitle": "4-Act 32s Molecular 4K Simulation on Synthetic Protein Binding & Neutralization",
    "category": "science_space",
    "character": "🔬 Elena Rostova (Computational Biologist)",
    "videoSrc": "/assets/video/veo_science_alphafold_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "science_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_science_alphafold_master.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Computational Biologist",
        "actName": "Act 1: Quantum Amino Acid Folding",
        "philosophy": "Molecular Energy Minimization",
        "text": {
          "ja": "🔬 ELENA: 「AlphaFold 3のニューラルネットワークが、数億個のアミノ酸配列の立体構造を原子レベルで予測します。」",
          "en": "🔬 ELENA: \"AlphaFold 3 predicts atomic-resolution tertiary protein conformations in sub-second inference.\"",
          "es": "🔬 ELENA: \"AlphaFold 3 predice la estructura terciaria de proteínas a resolución atómica en milisegundos.\"",
          "fr": "🔬 ELENA: « AlphaFold 3 prédit les conformations protéiques tertiaires à l'échelle atomique en quelques millisecondes. »",
          "de": "🔬 ELENA: „AlphaFold 3 berechnet atomgenaue Proteinfaltungen in subsekundenschneller Inferenz.“",
          "hi": "🔬 एलेना: \"अल्फाफोल्ड 3 आणविक स्तर पर प्रोटीन की सटीक 3D संरचना की गणना करता है।\""
        }
      },
      {
        "id": "science_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_science_alphafold_master.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Computational Biologist",
        "actName": "Act 2: Targeted Epitope Binding",
        "philosophy": "Nanoscale Precision Docking",
        "text": {
          "ja": "🔬 ELENA: 「設計された合成抗体が、がん細胞の標的受容体にピコモル濃度の親和性で完璧に結合。」",
          "en": "🔬 ELENA: \"The synthetic antibody locks into the oncogenic epitope with picomolar binding affinity.\"",
          "es": "🔬 ELENA: \"El anticuerpo sintético se acopla al receptor oncológico con afinidad picomolar.\"",
          "fr": "🔬 ELENA: « L'anticorps de synthèse se verrouille sur l'épitope oncogénique avec une affinité picomolaire. »",
          "de": "🔬 ELENA: „Der synthetische Antikörper bindet mit pikomolarer Affinität an das Onkoprotein.“",
          "hi": "🔬 एलेना: \"सिंथेटिक एंटीबॉडी कैंसर कोशिकाओं के रिसेप्टर से सटीक रूप से जुड़ जाती है।\""
        }
      },
      {
        "id": "science_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_science_alphafold_master.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Computational Biologist",
        "actName": "Act 3: Cellular Pathway Neutralization",
        "philosophy": "Cascade Inactivation",
        "text": {
          "ja": "🔬 ELENA: 「変異シグナル伝達経路が遮断され、健全な細胞分裂リズムが回復します。」",
          "en": "🔬 ELENA: \"Pathological signaling cascades are deactivated, restoring healthy homeostasis.\"",
          "es": "🔬 ELENA: \"Las cascadas de señalización patológicas se desactivan, restaurando la homeostasis.\"",
          "fr": "🔬 ELENA: « Les cascades de signalisation pathologiques sont neutralisées, rétablissant l'homéostasie. »",
          "de": "🔬 ELENA: „Pathologische Signalkaskaden werden blockiert und die gesunde Zellbalance wiederhergestellt.“",
          "hi": "🔬 एलेना: \"रोगजनक सिग्नल रुक जाते हैं और स्वस्थ जैविक संतुलन बहाल हो जाता है।\""
        }
      },
      {
        "id": "science_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_science_alphafold_master.mp4",
        "speaker": "Elena Rostova",
        "speakerRole": "Computational Biologist",
        "actName": "Act 4: The Frontier of Personalized Oncology",
        "philosophy": "Zero Side-Effect Therapeutics",
        "text": {
          "ja": "🔬 ELENA: 「副作用ゼロの完全個別化がん治療薬へ。バイオロジーのフロンティアがここに。」",
          "en": "🔬 ELENA: \"Zero-toxicity bespoke biotherapeutics. The dawn of generative molecular medicine.\"",
          "es": "🔬 ELENA: \"Bioterapéuticos personalizados sin toxicidad. El amanecer de la medicina molecular generativa.\"",
          "fr": "🔬 ELENA: « Des biothérapies sur mesure sans toxicité. L'aube de la médecine moléculaire générative. »",
          "de": "🔬 ELENA: „Maßgeschneiderte Biotherapeutika ohne Nebenwirkungen. Die Zukunft der molekularen Medizin.“",
          "hi": "🔬 एलेना: \"बिना किसी दुष्प्रभाव के सटीक व्यक्तिगत चिकित्सा का नया स्वर्णिम युग।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x4f1920bc482a1049de8170c1aa3902b1"
    }
  },
  {
    "id": "track_history_mohenjo_daro",
    "title": "Mohenjo-Daro: The Bronze Age Urban Utopia (32s Master)",
    "subtitle": "4-Act 32s 4K Archaeological Reconstruction of 2500 BCE Indus Valley City Planning",
    "category": "history_geopolitics",
    "character": "🏺 Priya Sharma (Archaeological Historian)",
    "videoSrc": "/assets/video/veo_history_mohenjodaro_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "history_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_history_mohenjodaro_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Archaeological Historian",
        "actName": "Act 1: The Standardized Brick Grid",
        "philosophy": "Bronze Age Urban Engineering",
        "text": {
          "ja": "🏺 PRIYA: 「紀元前2500年、インダス川流域。精密な焼成レンガの格子状都市計画が広がる。」",
          "en": "🏺 PRIYA: \"2500 BCE in the Indus Valley. Sophisticated orthogonal brick urban planning with covered drainage systems.\"",
          "es": "🏺 PRIYA: \"2500 a.C. en el Valle del Indo. Planificación urbana ortogonal con avanzados sistemas de drenaje.\"",
          "fr": "🏺 PRIYA: « 2500 av. J.-C. dans la vallée de l'Indus. Un urbanisme orthogonal d'une ingénierie remarquable. »",
          "de": "🏺 PRIYA: „2500 v. Chr. im Industal. Hochentwickelte rechtwinklige Stadtplanung mit Backsteinkanälen.“",
          "hi": "🏺 प्रिया: \"ईसा पूर्व 2500 में सिंधु घाटी सभ्यता का बेजोड़ नगर नियोजन और पक्की ईंटों की सड़कें।\""
        }
      },
      {
        "id": "history_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_history_mohenjodaro_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Archaeological Historian",
        "actName": "Act 2: The Great Bath & Sacred Waterworks",
        "philosophy": "Ritual Purity & Hydraulic Science",
        "text": {
          "ja": "🏺 PRIYA: 「天然タールで防水された大浴場。水と調和した高度な衛生文明の証。」",
          "en": "🏺 PRIYA: \"The Great Bath, waterproofed with natural bitumen. A testament to hydraulic engineering and civic sanitation.\"",
          "es": "🏺 PRIYA: \"El Gran Baño, impermeabilizado con betún natural. Testimonio de ingeniería hidráulica y saneamiento cívico.\"",
          "fr": "🏺 PRIYA: « Le Grand Bain, étanchéifié au bitume naturel. Témoignage d'ingénierie hydraulique civique avancée. »",
          "de": "🏺 PRIYA: „Das Große Bad, versiegelt mit natürlichem Bitumen – ein Meisterwerk antiker Wasserbaukunst.“",
          "hi": "🏺 प्रिया: \"विशाल स्नानागार, जो प्राचीन जल संरक्षण और स्वच्छता के उच्च मानकों का प्रतीक है।\""
        }
      },
      {
        "id": "history_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_history_mohenjodaro_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Archaeological Historian",
        "actName": "Act 3: Steatite Seals & Maritime Trade",
        "philosophy": "Egalitarian Commerce",
        "text": {
          "ja": "🏺 PRIYA: 「一角獣が刻まれた滑石の印章。メソポタミアまで届いた平和な交易ネットワーク。」",
          "en": "🏺 PRIYA: \"Carved unicorn steatite seals that marked shipments destined for Mesopotamian sea ports.\"",
          "es": "🏺 PRIYA: \"Sellos de esteatita grabados con unicornios que marcaban envíos a puertos de Mesopotamia.\"",
          "fr": "🏺 PRIYA: « Sceaux en stéatite gravés marquant les cargaisons destinées aux ports mésopotamiens. »",
          "de": "🏺 PRIYA: „Geschnitzte Steatit-Siegel kennzeichneten Handelsgüter für mesopotamische Seehäfen.“",
          "hi": "🏺 प्रिया: \"बारीक नक्काशीदार मुहरें जो मेसोपोटामिया तक फैले समृद्ध समुद्री व्यापार की साक्षी हैं।\""
        }
      },
      {
        "id": "history_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_history_mohenjodaro_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Archaeological Historian",
        "actName": "Act 4: The Legacy of a Peaceful Civilization",
        "philosophy": "Civilization Without Monarchy",
        "text": {
          "ja": "🏺 PRIYA: 「宮殿も軍隊の記念碑もない、平和と調和を愛した偉大な都市文明の記憶。」",
          "en": "🏺 PRIYA: \"A civilization devoid of royal palaces or warfare monuments. Pure urban harmony preserved for five millennia.\"",
          "es": "🏺 PRIYA: \"Una civilización sin palacios reales ni monumentos de guerra. Armonía urbana intacta por cinco milenios.\"",
          "fr": "🏺 PRIYA: « Une civilisation sans palais royaux ni monuments de guerre. L'harmonie civique pure à travers les âges. »",
          "de": "🏺 PRIYA: „Eine Zivilisation ohne Königspaläste oder Kriegsmonumente – fünf Jahrtausende städtischer Harmonie.“",
          "hi": "🏺 प्रिया: \"बिना किसी युद्ध या महलों की यह सभ्यता शांति और नागरिक व्यवस्था की अमर गाथा है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x892a018cbb490192837482a1049de878"
    }
  },
  {
    "id": "track_finance_sovereign_liquidity",
    "title": "Central Bank Sovereign Liquidity & Gold Reserves (32s Master)",
    "subtitle": "4-Act 32s Institutional Macro Breakdown of Cross-Border Settlement & Yield Curves",
    "category": "finance_wealth",
    "character": "📈 Marcus Vance (Macro Strategist)",
    "videoSrc": "/assets/video/veo_finance_macro_master.mp4",
    "duration": 32,
    "acts": [
      {
        "id": "finance_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/veo_finance_macro_master.mp4",
        "speaker": "Marcus Vance",
        "speakerRole": "Global Macro Strategist",
        "actName": "Act 1: The Global Inversion of Yield Curves",
        "philosophy": "Macro Regime Shift",
        "text": {
          "ja": "📈 MARCUS: 「国債イールドカーブが逆転。世界の中央銀行が金準備の積み増しを加速させています。」",
          "en": "📈 MARCUS: \"Sovereign yield curves invert across G10 economies as central banks accelerate bullion accumulation.\"",
          "es": "📈 MARCUS: \"Las curvas de rendimiento soberano se invierten mientras los bancos centrales acumulan oro.\"",
          "fr": "📈 MARCUS: « Les courbes de taux souverains s'inversent alors que les banques centrales accumulent de l'or. »",
          "de": "📈 MARCUS: „Invertierte Zinskurven in den G10-Märkten treiben die weltweite Goldakkumulation an.“",
          "hi": "📈 मार्कस: \"वैश्विक स्तर पर बॉन्ड यील्ड में बदलाव और केंद्रीय बैंकों द्वारा स्वर्ण भंडार में भारी वृद्धि।\""
        }
      },
      {
        "id": "finance_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/veo_finance_macro_master.mp4",
        "speaker": "Marcus Vance",
        "speakerRole": "Global Macro Strategist",
        "actName": "Act 2: Cross-Border Liquidity Swaps",
        "philosophy": "Bilateral Settlement Rails",
        "text": {
          "ja": "📈 MARCUS: 「ドル依存から分散型決済回線へ。二国間通貨スワップが劇的に拡大。」",
          "en": "📈 MARCUS: \"Transitioning from single-currency dependence to decentralized cross-border liquidity swap lines.\"",
          "es": "📈 MARCUS: \"Transición de la dependencia de una sola moneda hacia líneas de liquidez bilaterales descentralizadas.\"",
          "fr": "📈 MARCUS: « Transition d'un modèle unidevise vers des lignes de swap de liquidité bilatérales décentralisées. »",
          "de": "📈 MARCUS: „Übergang von Eindevisen-Abhängigkeit zu bilateralen Devisen-Swaplinien.“",
          "hi": "📈 मार्कस: \"एकल मुद्रा पर निर्भरता घटाकर द्विपक्षीय मुद्रा विनिमय नेटवर्क का विस्तार।\""
        }
      },
      {
        "id": "finance_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_finance_macro_master.mp4",
        "speaker": "Marcus Vance",
        "speakerRole": "Global Macro Strategist",
        "actName": "Act 3: Physical Vault Settlement & Basel III",
        "philosophy": "Tier 1 Unencumbered Capital",
        "text": {
          "ja": "📈 MARCUS: 「バーゼルIII規制下で現物ゴールドは最高格付けのリスクフリー資産として再評価。」",
          "en": "📈 MARCUS: \"Under Basel III framework, allocated physical gold reasserts its status as pristine Tier 1 unencumbered capital.\"",
          "es": "📈 MARCUS: \"Bajo Basilea III, el oro físico revalida su estatus como capital Tier 1 sin pasivos asociados.\"",
          "fr": "📈 MARCUS: « Sous Bâle III, l'or physique réaffirme son statut d'actif Tier 1 sans risque de contrepartie. »",
          "de": "📈 MARCUS: „Unter Basel III bestätigt physisches Gold seinen Status als erstklassiges Tier-1-Kernkapital.“",
          "hi": "📈 मार्कस: \"बेसल III के तहत भौतिक स्वर्ण को शीर्ष श्रेणी की जोखिम-मुक्त संपत्ति के रूप में मान्यता।\""
        }
      },
      {
        "id": "finance_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/veo_finance_macro_master.mp4",
        "speaker": "Marcus Vance",
        "speakerRole": "Global Macro Strategist",
        "actName": "Act 4: The 2030 Sovereign Balance Sheet",
        "philosophy": "Multipolar Financial Architecture",
        "text": {
          "ja": "📈 MARCUS: 「2030年に向けた多極化金融システム。強固なバランスシートが国家の主権を守る。」",
          "en": "📈 MARCUS: \"The emerging multipolar financial order. Sovereign resilience anchored by tangible asset balance sheets.\"",
          "es": "📈 MARCUS: \"El nuevo orden financiero multipolar. Resiliencia soberana anclada en activos tangibles.\"",
          "fr": "📈 MARCUS: « Le nouvel ordre financier multipolaire. La résilience souveraine ancrée dans les actifs tangibles. »",
          "de": "📈 MARCUS: „Die neue multipolare Finanzarchitektur – souveräne Stärke durch sachwertgedeckte Bilanzen.“",
          "hi": "📈 मार्कस: \"2030 का नया वित्तीय ढांचा जहां वास्तविक संपत्तियां आर्थिक संप्रभुता की नींव बनती हैं।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x12837482a1049de8170c1aa3902b892a"
    }
  },
  {
    "id": "track_music_human_live_30s",
    "title": "Neon Horizons: Live Shibuya Rooftop Concert (30s Master)",
    "subtitle": "4-Act 30s Live Human Vocals & Cyberpunk Band Performance overlooking Tokyo Skyline",
    "category": "music",
    "character": "🎤 Maya Lin (Lead Vocalist & Songwriter)",
    "videoSrc": "/assets/video/veo_music_human_live_master.mp4",
    "duration": 30,
    "acts": [
      {
        "id": "human_music_act_1",
        "startTime": 0,
        "endTime": 7.5,
        "videoUrl": "/assets/video/veo_music_human_live_master.mp4",
        "speaker": "Maya Lin",
        "speakerRole": "Lead Vocalist",
        "actName": "Act 1: Rain Over Shibuya & The Opening Chord",
        "philosophy": "Live Raw Acoustic Emotion",
        "text": {
          "ja": "🎤 MAYA: 「（歌声）雨に濡れた渋谷の夜空へ、最初のコードが鳴り響く。心の奥底の鼓動を解き放て。」",
          "en": "🎤 MAYA: \"(Singing) Through the rain above Shibuya's neon glow, the opening guitar chord rings out — wake up your heartbeat.\"",
          "es": "🎤 MAYA: \"(Cantando) A través de la lluvia y las luces de neón de Shibuya, el primer acorde despierta tu corazón.\"",
          "fr": "🎤 MAYA: « (Chant) Sous la pluie et les néons de Shibuya, le premier accord de guitare résonne — libère ton énergie. »",
          "de": "🎤 MAYA: „(Gesang) Durch den Regen über Shibuyas Neonlichtern erklingt der erste Gitarrenakkord.“",
          "hi": "🎤 माया: \"(गाते हुए) टोक्यो की बारिश और नियॉन रोशनियों के बीच, गिटार की पहली धुन दिल को छू जाती है।\""
        },
        "audioUrl": "/assets/audio/audio_human_music_act1.wav"
      },
      {
        "id": "human_music_act_2",
        "startTime": 7.5,
        "endTime": 15,
        "videoUrl": "/assets/video/veo_music_human_act2.mp4",
        "speaker": "Maya Lin",
        "speakerRole": "Lead Vocalist",
        "actName": "Act 2: The Bass Drop & Live Crowd Energy",
        "philosophy": "Kinetic Synchrony & Overdrive",
        "text": {
          "ja": "🎤 MAYA: 「（歌声）重低音のベースが夜風を揺らし、ルーフトップの歓声が一斉に湧き上がる！」",
          "en": "🎤 MAYA: \"(Singing) Feel the bassline shake the midnight sky! Every hand is in the air as the city sings along!\"",
          "es": "🎤 MAYA: \"(Cantando) ¡Siente el bajo retumbar en el cielo nocturno! ¡Toda la multitud canta al unísono!\"",
          "fr": "🎤 MAYA: « (Chant) Ressens la basse faire vibrer le ciel nocturne ! Toute la foule chante d'une seule voix ! »",
          "de": "🎤 MAYA: „(Gesang) Spüre den Bass durch den Nachthimmel dröhnen, während die Menge mitsingt!“",
          "hi": "🎤 माया: \"(गाते हुए) भारी बेस की गूंज रात की खामोशी को चीरती है और पूरा शहर झूम उठता है!\""
        },
        "audioUrl": "/assets/audio/audio_human_music_act2.wav"
      },
      {
        "id": "human_music_act_3",
        "startTime": 15,
        "endTime": 22.5,
        "videoUrl": "/assets/video/veo_music_human_act3.mp4",
        "speaker": "Maya Lin",
        "speakerRole": "Lead Vocalist",
        "actName": "Act 3: High Voltage Guitar Solo in Purple Light",
        "philosophy": "Electric Climax & Harmonic Resonance",
        "text": {
          "ja": "🎤 MAYA: 「（歌声）紫のスポットライトを浴びて炸裂するエレクトリックギターソロ！限界を超えて駆け抜けろ！」",
          "en": "🎤 MAYA: \"(Singing) Purple spotlight catches the blazing guitar solo! We're breaking every boundary tonight!\"",
          "es": "🎤 MAYA: \"(Cantando) ¡El reflector morado ilumina el solo de guitarra! ¡Esta noche rompemos todos los límites!\"",
          "fr": "🎤 MAYA: « (Chant) Le projecteur violet éclaire le solo de guitare flamboyant ! Nous repoussons toutes les limites ! »",
          "de": "🎤 MAYA: „(Gesang) Das violette Scheinwerferlicht fängt das feurige Gitarrensolo ein! Keine Grenzen heute Nacht!“",
          "hi": "🎤 माया: \"(गाते हुए) बैंगनी रोशनी में गिटार का सोलो गूंजता है! आज रात कोई सीमा हमें नहीं रोक सकती!\""
        },
        "audioUrl": "/assets/audio/audio_human_music_act3.wav"
      },
      {
        "id": "human_music_act_4",
        "startTime": 22.5,
        "endTime": 30,
        "videoUrl": "/assets/video/veo_music_human_act4.mp4",
        "speaker": "Maya Lin",
        "speakerRole": "Lead Vocalist",
        "actName": "Act 4: Final High Note & City Lights Outro",
        "philosophy": "Euphoric Transcendence",
        "text": {
          "ja": "🎤 MAYA: 「（歌声）夜明け前のスカイラインに響き渡るラストトーン。ありがとう渋谷！」",
          "en": "🎤 MAYA: \"(Singing) Holding the final high note over the dawn horizon. Thank you Tokyo, we will never fade!\"",
          "es": "🎤 MAYA: \"(Cantando) Sosteniendo la nota final sobre el horizonte del amanecer. ¡Gracias Tokio, somos eternos!\"",
          "fr": "🎤 MAYA: « (Chant) Tenir la dernière note éclatante sur l'horizon de l'aube. Merci Tokyo, nous sommes éternels ! »",
          "de": "🎤 MAYA: „(Gesang) Der letzte hohe Ton hallt über den Horizont. Danke Tokio, wir bleiben unvergessen!“",
          "hi": "🎤 माया: \"(गाते हुए) भोर की पहली किरण के साथ अंतिम सुर गूंजता है। शुक्रिया टोक्यो, हमारी धुन हमेशा अमर रहेगी!\""
        },
        "audioUrl": "/assets/audio/audio_human_music_act4.wav"
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x8a920bc482a1049de8170c1aa3902f99"
    },
    "audioSrc": "/assets/audio/audio_human_music_act1.wav"
  },
  {
    "id": "track_music_anime_idol_30s",
    "title": "Starlight Symphony: Cosmic Anime Idol Concert (30s Master)",
    "subtitle": "4-Act 30s Studio Trigger-Style Stylized Anime Pop Performance & Floating Crystals",
    "category": "anime",
    "character": "🌟 Hoshino Aria (Cosmic Cyber Idol)",
    "videoSrc": "/assets/video/veo_music_anime_idol_master.mp4",
    "duration": 30,
    "acts": [
      {
        "id": "anime_music_act_1",
        "startTime": 0,
        "endTime": 7.5,
        "videoUrl": "/assets/video/veo_music_anime_idol_master.mp4",
        "speaker": "Hoshino Aria",
        "speakerRole": "Cyber Anime Idol",
        "actName": "Act 1: Holographic Portal Ignition",
        "philosophy": "Anime Speed Lines & Energy Charge",
        "text": {
          "ja": "🌟 ARIA: 「（アニメボイス）星屑のステージへようこそ！ホログラムマイク起動、いくよっ！」",
          "en": "🌟 ARIA: \"(Anime Vocal) Welcome to the starlight cosmic stage! Dual energy microphones online, let's shine!\"",
          "es": "🌟 ARIA: \"(Voz Anime) ¡Bienvenidos al escenario cósmico de estrellas! ¡Micrófonos de energía listos, a brillar!\"",
          "fr": "🌟 ARIA: « (Voix Anime) Bienvenue sur la scène cosmique étoilée ! Micros d'énergie activés, illuminons l'univers ! »",
          "de": "🌟 ARIA: „(Anime-Gesang) Willkommen auf der kosmischen Sternenbühne! Energiemikrofone bereit, lasst uns strahlen!“",
          "hi": "🌟 आरिया: \"(एनिमे गायन) तारों से सजे ब्रह्मांडीय मंच पर स्वागत है! ऊर्जावान माइक तैयार है, चमकने का समय आ गया है!\""
        },
        "audioUrl": "/assets/audio/audio_anime_music_act1.wav"
      },
      {
        "id": "anime_music_act_2",
        "startTime": 7.5,
        "endTime": 15,
        "videoUrl": "/assets/video/veo_music_anime_act2.mp4",
        "speaker": "Hoshino Aria",
        "speakerRole": "Cyber Anime Idol",
        "actName": "Act 2: Prism Crystal Dance Choreography",
        "philosophy": "Sakuga Fluid Animation",
        "text": {
          "ja": "🌟 ARIA: 「（歌声）七色に輝くプリズムクリスタルに乗って、銀河中のみんなに笑顔を届けるよ！」",
          "en": "🌟 ARIA: \"(Singing) Dancing across seven prismatic starlight crystals, sending pure smiles across the entire galaxy!\"",
          "es": "🌟 ARIA: \"(Cantando) ¡Bailando sobre cristales prismáticos, enviando sonrisas a través de toda la galaxia!\"",
          "fr": "🌟 ARIA: « (Chant) Dansant sur sept cristaux prismatiques, envoyant des sourires à travers toute la galaxie ! »",
          "de": "🌟 ARIA: „(Gesang) Wir tanzen über sieben Prismenkristalle und senden Freude durch die ganze Galaxie!“",
          "hi": "🌟 आरिया: \"(गाते हुए) सतरंगी क्रिस्टलों पर थिरकते हुए पूरी आकाशगंगा में खुशियों के रंग बिखेरते हैं!\""
        },
        "audioUrl": "/assets/audio/audio_anime_music_act2.wav"
      },
      {
        "id": "anime_music_act_3",
        "startTime": 15,
        "endTime": 22.5,
        "videoUrl": "/assets/video/veo_music_anime_act3.mp4",
        "speaker": "Hoshino Aria",
        "speakerRole": "Cyber Anime Idol",
        "actName": "Act 3: Supernova Burst & Confetti Explosions",
        "philosophy": "Peak Anime Climax Energy",
        "text": {
          "ja": "🌟 ARIA: 「（歌声）超新星バースト！きらめく光の雨を浴びて、私たちの絆は無限大になる！」",
          "en": "🌟 ARIA: \"(Singing) Supernova burst! Under the shower of starlight confetti, our bond becomes truly infinite!\"",
          "es": "🌟 ARIA: \"(Cantando) ¡Estallido de supernova! ¡Bajo la lluvia de confeti estelar, nuestra unión es infinita!\"",
          "fr": "🌟 ARIA: « (Chant) Explosion de supernova ! Sous la pluie de confettis stellaires, notre lien devient infini ! »",
          "de": "🌟 ARIA: „(Gesang) Supernova-Explosion! Im Sternenkonfetti-Regen wird unsere Verbindung unendlich!“",
          "hi": "🌟 आरिया: \"(गाते हुए) सुपरनोवा का दिव्य प्रकाश! तारों की आतिशबाजी में हमारा यह अटूट बंधन हमेशा अमर रहेगा!\""
        },
        "audioUrl": "/assets/audio/audio_anime_music_act3.wav"
      },
      {
        "id": "anime_music_act_4",
        "startTime": 22.5,
        "endTime": 30,
        "videoUrl": "/assets/video/veo_music_anime_act4.mp4",
        "speaker": "Hoshino Aria",
        "speakerRole": "Cyber Anime Idol",
        "actName": "Act 4: Cosmic Wink & Final Heart Pose",
        "philosophy": "Signature Idol Outro",
        "text": {
          "ja": "🌟 ARIA: 「（アニメボイス）みんな大好き！アリアの歌声は永遠に響き続けるよ！バーイバーイ☆」",
          "en": "🌟 ARIA: \"(Anime Vocal) I love you all! Aria's starlight song will echo in your hearts forever! Bye bye☆\"",
          "es": "🌟 ARIA: \"(Voz Anime) ¡Los quiero a todos! ¡La canción de Aria resonará en sus corazones por siempre! ¡Adiós☆!\"",
          "fr": "🌟 ARIA: « (Voix Anime) Je vous aime tous ! La chanson d'Aria résonnera dans vos cœurs pour toujours ! Bye bye☆ »",
          "de": "🌟 ARIA: „(Anime-Gesang) Ich liebe euch alle! Arias Lied wird für immer in euren Herzen klingen! Bye bye☆“",
          "hi": "🌟 आरिया: \"(एनिमे स्वर) आप सभी को ढेर सारा प्यार! आरिया का यह गीत आपके दिलों में सदा गूंजता रहेगा! बाय बाय☆!\""
        },
        "audioUrl": "/assets/audio/audio_anime_music_act4.wav"
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x7c1920bc482a1049de8170c1aa3902a7"
    },
    "audioSrc": "/assets/audio/audio_anime_music_act1.wav"
  },
  {
    "id": "track_hindi_sufi_romantic_60s",
    "title": "Kesariya Raaste: Sufi Soul in Old Delhi (1-Min Master)",
    "subtitle": "4-Act 60s (1-Minute) Bollywood Romantic Sufi-Pop Master · Haveli Courtyard & Sitar Harmony",
    "category": "music",
    "character": "🎤 Aarav Sharma & Meera Sen (Playback Singer & Classical Vocalist)",
    "videoSrc": "/assets/video/veo_hindi_sufi_song_master.mp4",
    "duration": 60,
    "acts": [
      {
        "id": "hindi_sufi_act_1",
        "startTime": 0,
        "endTime": 15,
        "videoUrl": "/assets/video/veo_hindi_sufi_song_master.mp4",
        "speaker": "Aarav Sharma",
        "speakerRole": "Lead Male Playback Singer",
        "actName": "Act 1: Sunset Over Haveli & Sitar Alap (0s - 15s)",
        "philosophy": "Sufi Devotional Longing",
        "text": {
          "ja": "🎤 AARAV: 「（ヒンディー語歌唱）オールドデリーの夕暮れ、シタールの調べが古都の風に乗って君の元へ届く。」",
          "en": "🎤 AARAV: \"(Singing in Hindi) As the golden sun dips behind the Mughal arches of Old Delhi, the gentle sitar notes carry my soul to you.\"",
          "es": "🎤 AARAV: \"(Cantando en Hindi) Mientras el sol dorado se oculta tras los arcos de Delhi, las notas de sitar llevan mi alma hacia ti.\"",
          "fr": "🎤 AARAV: « (Chant en Hindi) Alors que le soleil d'or se couche sur les arches de Delhi, les notes de sitar guident mon âme vers toi. »",
          "de": "🎤 AARAV: „(Gesang auf Hindi) Wenn die goldene Sonne hinter den Bögen Delhis versinkt, tragen die Sitarklänge meine Seele zu dir.“",
          "hi": "🎤 आरव: \"(गाते हुए) केसरिया रास्तों पर जब शाम ढले, तेरी यादों की महक हवा में घुले... दिल की हर धड़कन बस तेरा नाम ले।\""
        },
        "audioUrl": "/assets/audio/audio_hindi_sufi_act1.wav"
      },
      {
        "id": "hindi_sufi_act_2",
        "startTime": 15,
        "endTime": 30,
        "videoUrl": "/assets/video/veo_hindi_sufi_act2.mp4",
        "speaker": "Meera Sen",
        "speakerRole": "Classical Female Vocalist",
        "actName": "Act 2: Marigold Rain & Silk Dupatta Swirl (15s - 30s)",
        "philosophy": "Harmonic Duet & Romantic Resonance",
        "text": {
          "ja": "🎤 MEERA: 「（ヒンディー語歌唱）舞い散るマリーゴールドの花びら。君の瞳に映る光が私の世界を照らす。」",
          "en": "🎤 MEERA: \"(Singing in Hindi) Showers of orange marigolds fall like blessings as our eyes meet across the marble courtyard.\"",
          "es": "🎤 MEERA: \"(Cantando en Hindi) La lluvia de flores de cempasúchil cae como bendición cuando nuestras miradas se encuentran.\"",
          "fr": "🎤 MEERA: « (Chant en Hindi) Une pluie de fleurs dorées tombe comme une bénédiction quand nos regards s'unissent. »",
          "de": "🎤 MEERA: „(Gesang auf Hindi) Ein Regen aus goldenen Blütenblättern fällt herab, wenn unsere Blicke sich treffen.“",
          "hi": "🎤 मीरा: \"(गाते हुए) गेंदे के फूलों सी महके यह जहां, तेरे संग बीते यह खुशियों का समां... तू है मेरा आसमां, तू ही मेरा कारवां।\""
        },
        "audioUrl": "/assets/audio/audio_hindi_sufi_act2.wav"
      },
      {
        "id": "hindi_sufi_act_3",
        "startTime": 30,
        "endTime": 45,
        "videoUrl": "/assets/video/veo_hindi_sufi_act3.mp4",
        "speaker": "Aarav & Meera",
        "speakerRole": "Duet Playback Duo",
        "actName": "Act 3: The High Octave Sufi Crescendo (30s - 45s)",
        "philosophy": "Ecstatic Spiritual Union",
        "text": {
          "ja": "🎤 AARAV & MEERA: 「（重唱）タブラのリズムが高鳴り、二人の声が重なり合って夜空へ昇華する！」",
          "en": "🎤 AARAV & MEERA: \"(Duet) The tabla tempo accelerates into pure ecstasy as our harmonies soar together beneath the stars!\"",
          "es": "🎤 AARAV & MEERA: \"(Dúo) ¡El ritmo de la tabla acelera en éxtasis puro mientras nuestras armonías se elevan bajo las estrellas!\"",
          "fr": "🎤 AARAV & MEERA: « (Duo) Le rythme du tabla s'accélère en pure extase tandis que nos voix s'élèvent sous les étoiles ! »",
          "de": "🎤 AARAV & MEERA: „(Duett) Der Rhythmus der Tablas steigert sich zur Ekstase, während unsere Stimmen in den Sternenhimmel steigen!“",
          "hi": "🎤 आरव और मीरा: \"(युगलबंदी) मौला मेरे मौला, यह कैसा असर है... तेरे बिना अब तो सूना यह सफर है! इश्क़ का यह रंग कभी ना छूटेगा।\""
        },
        "audioUrl": "/assets/audio/audio_hindi_sufi_act3.wav"
      },
      {
        "id": "hindi_sufi_act_4",
        "startTime": 45,
        "endTime": 60,
        "videoUrl": "/assets/video/veo_hindi_sufi_act4.mp4",
        "speaker": "Aarav Sharma",
        "speakerRole": "Lead Male Playback Singer",
        "actName": "Act 4: Brass Lantern Glow & Final Fade (45s - 60s)",
        "philosophy": "Eternal Melodic Reverberation",
        "text": {
          "ja": "🎤 AARAV: 「（ヒンディー語歌唱）真鍮のランプの灯火が揺れる中、愛の余韻が永遠に響き続ける。」",
          "en": "🎤 AARAV: \"(Singing in Hindi) In the warm golden glow of antique brass lanterns, this melody remains sealed in our hearts forever.\"",
          "es": "🎤 AARAV: \"(Cantando en Hindi) Bajo el cálido resplandor de las linternas de bronce, esta melodía queda sellada para siempre.\"",
          "fr": "🎤 AARAV: « (Chant en Hindi) Sous la lueur dorée des lanternes de cuivre, cette mélodie demeure scellée pour l'éternité. »",
          "de": "🎤 AARAV: „(Gesang auf Hindi) Im warmen Glanz der Messinglaternen bleibt diese Melodie für immer versiegelt.“",
          "hi": "🎤 आरव: \"(गाते हुए) रूह से रूह का यह बंधन कभी ना टूटेगा... ओ सनम, तेरा साथ ही मेरी इबादत है।\""
        },
        "audioUrl": "/assets/audio/audio_hindi_sufi_act4.wav"
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x6f1920bc482a1049de8170c1aa3902f66"
    },
    "audioSrc": "/assets/audio/audio_hindi_sufi_act1.wav"
  },
  {
    "id": "track_hindi_desi_hiphop_60s",
    "title": "Gully Raftaar: Mumbai Monsoon Beats (1-Min Master)",
    "subtitle": "4-Act 60s (1-Minute) High-Energy Desi Hip-Hop & Street Dance in Monsoon Mumbai",
    "category": "music",
    "character": "🎤 Kabir 'Raftaar' Verma (Desi Hip-Hop MC & Producer)",
    "videoSrc": "/assets/video/veo_hindi_desi_hiphop_master.mp4",
    "duration": 60,
    "acts": [
      {
        "id": "hindi_hiphop_act_1",
        "startTime": 0,
        "endTime": 15,
        "videoUrl": "/assets/video/veo_hindi_desi_hiphop_master.mp4",
        "speaker": "Kabir Verma",
        "speakerRole": "Desi Hip-Hop MC",
        "actName": "Act 1: Marine Drive Monsoon Rain & Mic Check (0s - 15s)",
        "philosophy": "Authentic Street Cadence",
        "text": {
          "ja": "🎤 KABIR: 「（ヒンディー語ラップ）ムンバイの雨がアスファルトを叩く。路地裏から世界を揺るがすビートが始まる。」",
          "en": "🎤 KABIR: \"(Rapping in Hindi) Rain lashes Marine Drive as the 808 sub-bass drops. From the gully to the world, listen up!\"",
          "es": "🎤 KABIR: \"(Rapeando en Hindi) La lluvia azota Mumbai mientras el bajo 808 desciende. ¡De las calles para el mundo!\"",
          "fr": "🎤 KABIR: « (Rap en Hindi) La pluie frappe les rues de Mumbai au rythme des basses 808. De la rue au monde entier ! »",
          "de": "🎤 KABIR: „(Rap auf Hindi) Der Regen peitscht über Mumbai, während der 808-Bass einsetzt. Aus den Straßen in die Welt!“",
          "hi": "🎤 कबीर: \"(रैप) मुंबई की बारिश में भीगा यह शहर, मेरे शब्दों का देखो यह कैसा कहर! गली से निकले हैं, दुनिया हिलाएंगे!\""
        },
        "audioUrl": "/assets/audio/audio_hindi_hiphop_act1.wav"
      },
      {
        "id": "hindi_hiphop_act_2",
        "startTime": 15,
        "endTime": 30,
        "videoUrl": "/assets/video/veo_hindi_hiphop_act2.mp4",
        "speaker": "Kabir Verma",
        "speakerRole": "Desi Hip-Hop MC",
        "actName": "Act 2: Premier Padmini Cabs & Smoke Flare Flow (15s - 30s)",
        "philosophy": "Fast-Paced Desi Rhyme Schemes",
        "text": {
          "ja": "🎤 KABIR: 「（ヒンディー語ラップ）黄色のタクシーとカラフルなスモーク。止まることのない超高速のフロウ！」",
          "en": "🎤 KABIR: \"(Rapping in Hindi) Premier Padmini cabs with neon flares lighting the road — unstoppable rapid-fire Hindi cadence!\"",
          "es": "🎤 KABIR: \"(Rapeando en Hindi) Taxis amarillos y humo de colores iluminando la vía — ¡cadencia rápida e imparable!\"",
          "fr": "🎤 KABIR: « (Rap en Hindi) Taxis jaunes et fumigènes éclairant la route — un débit ultra-rapide et implacable ! »",
          "de": "🎤 KABIR: „(Rap auf Hindi) Gelbe Taxis und bunte Rauchfackeln – ein unaufhaltsamer, rasanter Flow!“",
          "hi": "🎤 कबीर: \"(रैप) काली-पीली टैक्सी, नियॉन की बत्ती, मेहनत की कमाई से पाई यह गद्दी! रुकना नहीं आता, रफ्तार हमारी है!\""
        },
        "audioUrl": "/assets/audio/audio_hindi_hiphop_act2.wav"
      },
      {
        "id": "hindi_hiphop_act_3",
        "startTime": 30,
        "endTime": 45,
        "videoUrl": "/assets/video/veo_hindi_hiphop_act3.mp4",
        "speaker": "Kabir Verma",
        "speakerRole": "Desi Hip-Hop MC",
        "actName": "Act 3: Street Crew B-Boy Battle Climax (30s - 45s)",
        "philosophy": "Kinetic Street Synchronization",
        "text": {
          "ja": "🎤 KABIR: 「（ヒンディー語ラップ）クルー全員のブレイクダンス！地面を蹴り上げ、歓声が雨を吹き飛ばす！」",
          "en": "🎤 KABIR: \"(Rapping in Hindi) The entire crew locks into synchrony! B-boys spinning in the puddle reflections under streetlights!\"",
          "es": "🎤 KABIR: \"(Rapeando en Hindi) ¡Toda la banda sincronizada! ¡B-boys girando sobre los charcos bajo las farolas!\"",
          "fr": "🎤 KABIR: « (Rap en Hindi) Tout le groupe en parfaite synchronisation ! B-boys virevoltant sous les projecteurs ! »",
          "de": "🎤 KABIR: „(Rap auf Hindi) Die gesamte Crew tanzt synchron im Regen unter den Straßenlaternen!“",
          "hi": "🎤 कबीर: \"(रैप) बी-बॉयज का डांस और बीट्स का यह संगम, जो भी सुनेगा वो झूम उठेगा हरदम! असली हिप-हॉप का यह नया दौर है!\""
        },
        "audioUrl": "/assets/audio/audio_hindi_hiphop_act3.wav"
      },
      {
        "id": "hindi_hiphop_act_4",
        "startTime": 45,
        "endTime": 60,
        "videoUrl": "/assets/video/veo_hindi_hiphop_act4.mp4",
        "speaker": "Kabir Verma",
        "speakerRole": "Desi Hip-Hop MC",
        "actName": "Act 4: Mic Drop & Sea Link Silhouette Outro (45s - 60s)",
        "philosophy": "Triumphant Urban Identity",
        "text": {
          "ja": "🎤 KABIR: 「（ヒンディー語ラップ）シーリンク橋を背にマイクドロップ。これが我らの街、ムンバイの魂だ！」",
          "en": "🎤 KABIR: \"(Rapping in Hindi) Mic drop framed against the glowing Bandra-Worli Sea Link. This is Mumbai, this is our legacy!\"",
          "es": "🎤 KABIR: \"(Rapeando en Hindi) Suelto el micrófono frente al puente Sea Link. ¡Esta es nuestra ciudad, nuestro legado!\"",
          "fr": "🎤 KABIR: « (Rap en Hindi) Lâcher de micro devant le pont Sea Link. C'est notre ville, notre héritage ! »",
          "de": "🎤 KABIR: „(Rap auf Hindi) Mic Drop vor der Kulisse der Sea Link Bridge. Das ist Mumbai, das ist unser Erbe!“",
          "hi": "🎤 कबीर: \"(रैप) सी-लिंक के सामने गिराया यह माइक, असली मेहनत से पाया सबका यह लाइक! जय हिंद, जय मुंबई!\""
        },
        "audioUrl": "/assets/audio/audio_hindi_hiphop_act4.wav"
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x5e1920bc482a1049de8170c1aa3902e55"
    },
    "audioSrc": "/assets/audio/audio_hindi_hiphop_act1.wav"
  }
];
