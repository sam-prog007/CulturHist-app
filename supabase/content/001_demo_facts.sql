-- Demo facts: 10 historical facts so the UI has something to show.
--
-- Content files are upserts keyed on `slug`: re-running one updates the rows
-- it owns and never creates duplicates or touches users' progress.
-- Run each file on its own in the Supabase SQL editor, after the migrations.
-- (Wrapped in a DO block because the SQL editor fails on bare multi-row
-- INSERTs with: relation "a" does not exist.)
--
-- Images: real photos, paintings or illustrations only, with their credit.
-- Each is the lead image of the fact's French Wikipedia article; author and
-- license were read from the Wikimedia Commons API.

DO $$
BEGIN
  -- Facts inserted by the first version of this file had no slug: claim them.
  UPDATE public.historical_facts AS f
  SET slug = v.slug
  FROM (VALUES
    ('The Great Pyramid of Giza', 'grande-pyramide-gizeh'),
    ('The Ziggurat of Ur', 'ziggourat-ur'),
    ('The Colosseum opens', 'inauguration-colisee'),
    ('The Great Wall unified', 'unification-grande-muraille'),
    ('Mansa Musa''s pilgrimage', 'pelerinage-mansa-moussa'),
    ('The rise of the samurai', 'essor-samourais'),
    ('Gutenberg''s printing press', 'imprimerie-gutenberg'),
    ('Machu Picchu', 'machu-picchu'),
    ('The storming of the Bastille', 'prise-bastille'),
    ('The first powered flight', 'premier-vol-motorise')
  ) AS v(title, slug)
  WHERE f.slug IS NULL AND f.title = v.title;

  INSERT INTO public.historical_facts
    (slug, period_id, title, title_fr, description, description_fr, date_text, date_text_fr,
     year, month, day, region, region_fr, countries, difficulty, tags, tags_fr, points_reward,
     source_url, image_url, image_credit, image_source_url)
  VALUES
    ('grande-pyramide-gizeh', (SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Great Pyramid of Giza', 'La Grande Pyramide de Gizeh',
     'Built around 2560 BCE for Pharaoh Khufu, it remained the tallest man-made structure for nearly 3,800 years.',
     'Construite vers 2560 av. J.-C. pour le pharaon Khéops, elle est restée la plus haute construction humaine pendant près de 3 800 ans.',
     '2560 BCE', 'Vers 2560 av. J.-C.', -2560, NULL, NULL, 'africa', 'Afrique', ARRAY['EG'], 'easy',
     ARRAY['architecture', 'egypt'], ARRAY['architecture', 'égypte'], 10,
     'https://fr.wikipedia.org/wiki/Pyramide_de_Kh%C3%A9ops',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Great_Pyramid_of_Giza.jpg/1280px-Great_Pyramid_of_Giza.jpg',
     'kallerna, CC BY-SA 3.0, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Great_Pyramid_of_Giza.jpg'),

    ('ziggourat-ur', (SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Ziggurat of Ur', 'La ziggourat d''Ur',
     'This stepped temple was built in Mesopotamia around 2100 BCE to honour the moon god Nanna.',
     'Ce temple à étages fut érigé en Mésopotamie vers 2100 av. J.-C. en l''honneur du dieu-lune Nanna.',
     '2100 BCE', 'Vers 2100 av. J.-C.', -2100, NULL, NULL, 'middle-east', 'Moyen-Orient', ARRAY['IQ'], 'medium',
     ARRAY['religion', 'mesopotamia'], ARRAY['religion', 'mésopotamie'], 15,
     'https://fr.wikipedia.org/wiki/Ziggurat_d%27Ur',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Ziggarat_of_Ur_001.jpg/1280px-Ziggarat_of_Ur_001.jpg',
     'Tla2006 at English Wikipedia, domaine public, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Ziggarat_of_Ur_001.jpg'),

    ('inauguration-colisee', (SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Colosseum opens', 'L''inauguration du Colisée',
     'Inaugurated in 80 CE with 100 days of games, the Colosseum could hold around 50,000 spectators.',
     'Inauguré en 80 apr. J.-C. par cent jours de jeux, le Colisée pouvait accueillir environ 50 000 spectateurs.',
     '80 CE', '80 apr. J.-C.', 80, NULL, NULL, 'europe', 'Europe', ARRAY['IT'], 'easy',
     ARRAY['rome', 'architecture'], ARRAY['rome', 'architecture'], 10,
     'https://fr.wikipedia.org/wiki/Colis%C3%A9e',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg',
     'FeaturedPics, CC BY-SA 4.0, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Colosseo_2020.jpg'),

    ('unification-grande-muraille', (SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Great Wall unified', 'L''unification de la Grande Muraille',
     'Qin Shi Huang, the first emperor of China, linked older walls into a single defensive line around 220 BCE.',
     'Qin Shi Huang, premier empereur de Chine, relia d''anciens murs en une seule ligne défensive vers 220 av. J.-C.',
     '220 BCE', 'Vers 220 av. J.-C.', -220, NULL, NULL, 'asia', 'Asie', ARRAY['CN'], 'medium',
     ARRAY['china', 'military'], ARRAY['chine', 'militaire'], 15,
     'https://fr.wikipedia.org/wiki/Grande_Muraille',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Great_Wall_of_China_July_2006.JPG/1280px-Great_Wall_of_China_July_2006.JPG',
     'Velatrix, CC0, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Great_Wall_of_China_July_2006.JPG'),

    ('pelerinage-mansa-moussa', (SELECT id FROM public.historical_periods WHERE name = 'Moyen Âge'),
     'Mansa Musa''s pilgrimage', 'Le pèlerinage de Mansa Moussa',
     'In 1324 the emperor of Mali travelled to Mecca with so much gold that he disrupted prices in Cairo for years.',
     'En 1324, l''empereur du Mali se rendit à La Mecque avec tant d''or qu''il fit chuter son cours au Caire pendant des années.',
     '1324', '1324', 1324, NULL, NULL, 'africa', 'Afrique', ARRAY['ML', 'EG'], 'hard',
     ARRAY['mali', 'trade'], ARRAY['mali', 'commerce'], 20,
     'https://fr.wikipedia.org/wiki/Mansa_Moussa',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Kanga_Moussa_Atlas_Catalan.jpg/1280px-Kanga_Moussa_Atlas_Catalan.jpg',
     'Cresques Abraham, domaine public, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Kanga_Moussa_Atlas_Catalan.jpg'),

    ('essor-samourais', (SELECT id FROM public.historical_periods WHERE name = 'Moyen Âge'),
     'The rise of the samurai', 'L''essor des samouraïs',
     'In 1192 Minamoto no Yoritomo became shogun, starting nearly 700 years of rule by the warrior class in Japan.',
     'En 1192, Minamoto no Yoritomo devint shogun, ouvrant près de 700 ans de domination de la classe guerrière au Japon.',
     '1192', '1192', 1192, NULL, NULL, 'asia', 'Asie', ARRAY['JP'], 'hard',
     ARRAY['japan', 'military'], ARRAY['japon', 'militaire'], 20,
     'https://fr.wikipedia.org/wiki/Minamoto_no_Yoritomo',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Minamoto_no_Yoritomo.jpg/1280px-Minamoto_no_Yoritomo.jpg',
     'Fujiwara no Takanobu, domaine public, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Minamoto_no_Yoritomo.jpg'),

    ('imprimerie-gutenberg', (SELECT id FROM public.historical_periods WHERE name = 'Renaissance'),
     'Gutenberg''s printing press', 'L''imprimerie de Gutenberg',
     'Around 1455 Johannes Gutenberg printed the first major book with movable type in Europe: the Bible.',
     'Vers 1455, Johannes Gutenberg imprima le premier grand livre européen à caractères mobiles : la Bible.',
     'c. 1455', 'Vers 1455', 1455, NULL, NULL, 'europe', 'Europe', ARRAY['DE'], 'easy',
     ARRAY['invention', 'books'], ARRAY['invention', 'livres'], 10,
     'https://fr.wikipedia.org/wiki/Bible_de_Gutenberg',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/1280px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg',
     'NYC Wanderer (Kevin Eng), CC BY-SA 2.0, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Gutenberg_Bible,_Lenox_Copy,_New_York_Public_Library,_2009._Pic_01.jpg'),

    ('machu-picchu', (SELECT id FROM public.historical_periods WHERE name = 'Renaissance'),
     'Machu Picchu', 'Le Machu Picchu',
     'Built around 1450 for the Inca emperor Pachacuti, the citadel was never found by the Spanish conquerors.',
     'Construite vers 1450 pour l''empereur inca Pachacutec, la citadelle ne fut jamais découverte par les conquistadors.',
     'c. 1450', 'Vers 1450', 1450, NULL, NULL, 'americas', 'Amériques', ARRAY['PE'], 'medium',
     ARRAY['inca', 'architecture'], ARRAY['incas', 'architecture'], 15,
     'https://fr.wikipedia.org/wiki/Machu_Picchu',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Before_Machu_Picchu.jpg/1280px-Before_Machu_Picchu.jpg',
     'icelight from Boston, MA, US, CC BY 2.0, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Before_Machu_Picchu.jpg'),

    ('prise-bastille', (SELECT id FROM public.historical_periods WHERE name = 'Époque contemporaine'),
     'The storming of the Bastille', 'La prise de la Bastille',
     'On 14 July 1789 Parisians stormed the royal fortress-prison, a founding moment of the French Revolution.',
     'Le 14 juillet 1789, les Parisiens prirent d''assaut la forteresse royale, moment fondateur de la Révolution française.',
     '14 July 1789', '14 juillet 1789', 1789, 7, 14, 'europe', 'Europe', ARRAY['FR'], 'easy',
     ARRAY['revolution', 'france'], ARRAY['révolution', 'france'], 10,
     'https://fr.wikipedia.org/wiki/Prise_de_la_Bastille',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Prise_de_la_Bastille.jpg/1280px-Prise_de_la_Bastille.jpg',
     'Jean-Pierre Houël, domaine public, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:Prise_de_la_Bastille.jpg'),

    ('premier-vol-motorise', (SELECT id FROM public.historical_periods WHERE name = 'Époque contemporaine'),
     'The first powered flight', 'Le premier vol motorisé',
     'On 17 December 1903 the Wright brothers flew for 12 seconds at Kitty Hawk, North Carolina.',
     'Le 17 décembre 1903, les frères Wright volèrent 12 secondes à Kitty Hawk, en Caroline du Nord.',
     '17 December 1903', '17 décembre 1903', 1903, 12, 17, 'americas', 'Amériques', ARRAY['US'], 'medium',
     ARRAY['invention', 'aviation'], ARRAY['invention', 'aviation'], 15,
     'https://fr.wikipedia.org/wiki/Wright_Flyer',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/First_flight2.jpg/1280px-First_flight2.jpg',
     'John T. Daniels, domaine public, via Wikimedia Commons',
     'https://commons.wikimedia.org/wiki/File:First_flight2.jpg')
  ON CONFLICT (slug) DO UPDATE SET
    period_id = EXCLUDED.period_id,
    title = EXCLUDED.title,
    title_fr = EXCLUDED.title_fr,
    description = EXCLUDED.description,
    description_fr = EXCLUDED.description_fr,
    date_text = EXCLUDED.date_text,
    date_text_fr = EXCLUDED.date_text_fr,
    year = EXCLUDED.year,
    month = EXCLUDED.month,
    day = EXCLUDED.day,
    region = EXCLUDED.region,
    region_fr = EXCLUDED.region_fr,
    countries = EXCLUDED.countries,
    difficulty = EXCLUDED.difficulty,
    tags = EXCLUDED.tags,
    tags_fr = EXCLUDED.tags_fr,
    points_reward = EXCLUDED.points_reward,
    source_url = EXCLUDED.source_url,
    image_url = EXCLUDED.image_url,
    image_credit = EXCLUDED.image_credit,
    image_source_url = EXCLUDED.image_source_url;
END
$$;
