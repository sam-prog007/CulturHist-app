-- Demo content: 10 historical facts so the UI has something to show.
-- Run it once, AFTER the baseline migration, on its own in the SQL editor.
-- Wrapped in a DO block because the Supabase SQL editor fails on the bare
-- multi-row INSERT with: relation "a" does not exist.
-- image_url values are keys from src/assets/factsImages.ts.

DO $$
BEGIN
  INSERT INTO public.historical_facts
    (period_id, title, title_fr, description, description_fr, date_text, date_text_fr,
     region, region_fr, difficulty, tags, tags_fr, points_reward, image_url)
  VALUES
    ((SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Great Pyramid of Giza', 'La Grande Pyramide de Gizeh',
     'Built around 2560 BCE for Pharaoh Khufu, it remained the tallest man-made structure for nearly 3,800 years.',
     'Construite vers 2560 av. J.-C. pour le pharaon Khéops, elle est restée la plus haute construction humaine pendant près de 3 800 ans.',
     '2560 BCE', 'Vers 2560 av. J.-C.', 'africa', 'Afrique', 'easy',
     ARRAY['architecture', 'egypt'], ARRAY['architecture', 'égypte'], 10, 'pyramids-egypt'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Ziggurat of Ur', 'La ziggourat d''Ur',
     'This stepped temple was built in Mesopotamia around 2100 BCE to honour the moon god Nanna.',
     'Ce temple à étages fut érigé en Mésopotamie vers 2100 av. J.-C. en l''honneur du dieu-lune Nanna.',
     '2100 BCE', 'Vers 2100 av. J.-C.', 'middle-east', 'Moyen-Orient', 'medium',
     ARRAY['religion', 'mesopotamia'], ARRAY['religion', 'mésopotamie'], 15, 'mesopotamia-ziggurat'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Colosseum opens', 'L''inauguration du Colisée',
     'Inaugurated in 80 CE with 100 days of games, the Colosseum could hold around 50,000 spectators.',
     'Inauguré en 80 apr. J.-C. par cent jours de jeux, le Colisée pouvait accueillir environ 50 000 spectateurs.',
     '80 CE', '80 apr. J.-C.', 'europe', 'Europe', 'easy',
     ARRAY['rome', 'architecture'], ARRAY['rome', 'architecture'], 10, 'roman-colosseum'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Antiquité'),
     'The Great Wall unified', 'L''unification de la Grande Muraille',
     'Qin Shi Huang, the first emperor of China, linked older walls into a single defensive line around 220 BCE.',
     'Qin Shi Huang, premier empereur de Chine, relia d''anciens murs en une seule ligne défensive vers 220 av. J.-C.',
     '220 BCE', 'Vers 220 av. J.-C.', 'asia', 'Asie', 'medium',
     ARRAY['china', 'military'], ARRAY['chine', 'militaire'], 15, 'great-wall-china'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Moyen Âge'),
     'Mansa Musa''s pilgrimage', 'Le pèlerinage de Mansa Moussa',
     'In 1324 the emperor of Mali travelled to Mecca with so much gold that he disrupted prices in Cairo for years.',
     'En 1324, l''empereur du Mali se rendit à La Mecque avec tant d''or qu''il fit chuter son cours au Caire pendant des années.',
     '1324', '1324', 'africa', 'Afrique', 'hard',
     ARRAY['mali', 'trade'], ARRAY['mali', 'commerce'], 20, 'mali-kingdom'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Moyen Âge'),
     'The rise of the samurai', 'L''essor des samouraïs',
     'In 1192 Minamoto no Yoritomo became shogun, starting nearly 700 years of rule by the warrior class in Japan.',
     'En 1192, Minamoto no Yoritomo devint shogun, ouvrant près de 700 ans de domination de la classe guerrière au Japon.',
     '1192', '1192', 'asia', 'Asie', 'hard',
     ARRAY['japan', 'military'], ARRAY['japon', 'militaire'], 20, 'japanese-samurai'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Renaissance'),
     'Gutenberg''s printing press', 'L''imprimerie de Gutenberg',
     'Around 1455 Johannes Gutenberg printed the first major book with movable type in Europe: the Bible.',
     'Vers 1455, Johannes Gutenberg imprima le premier grand livre européen à caractères mobiles : la Bible.',
     'c. 1455', 'Vers 1455', 'europe', 'Europe', 'easy',
     ARRAY['invention', 'books'], ARRAY['invention', 'livres'], 10, 'gutenberg-press'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Renaissance'),
     'Machu Picchu', 'Le Machu Picchu',
     'Built around 1450 for the Inca emperor Pachacuti, the citadel was never found by the Spanish conquerors.',
     'Construite vers 1450 pour l''empereur inca Pachacutec, la citadelle ne fut jamais découverte par les conquistadors.',
     'c. 1450', 'Vers 1450', 'americas', 'Amériques', 'medium',
     ARRAY['inca', 'architecture'], ARRAY['incas', 'architecture'], 15, 'machu-picchu'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Époque contemporaine'),
     'The storming of the Bastille', 'La prise de la Bastille',
     'On 14 July 1789 Parisians stormed the royal fortress-prison, a founding moment of the French Revolution.',
     'Le 14 juillet 1789, les Parisiens prirent d''assaut la forteresse royale, moment fondateur de la Révolution française.',
     '14 July 1789', '14 juillet 1789', 'europe', 'Europe', 'easy',
     ARRAY['revolution', 'france'], ARRAY['révolution', 'france'], 10, 'french-revolution'),

    ((SELECT id FROM public.historical_periods WHERE name = 'Époque contemporaine'),
     'The first powered flight', 'Le premier vol motorisé',
     'On 17 December 1903 the Wright brothers flew for 12 seconds at Kitty Hawk, North Carolina.',
     'Le 17 décembre 1903, les frères Wright volèrent 12 secondes à Kitty Hawk, en Caroline du Nord.',
     '17 December 1903', '17 décembre 1903', 'americas', 'Amériques', 'medium',
     ARRAY['invention', 'aviation'], ARRAY['invention', 'aviation'], 15, 'wright-brothers');
END
$$;
