-- Quotes of the day: a first set of well-attributed historical quotes.
-- Upserts keyed on `slug` (see 001_demo_facts.sql). Famous but apocryphal
-- quotes ("L'État, c'est moi", "Qu'ils mangent de la brioche"...) are left out on purpose.

DO $$
BEGIN
  INSERT INTO public.quotes (slug, text_fr, text, original_text, author, context_fr, context, year)
  VALUES
    ('cesar-alea-jacta-est',
     'Le sort en est jeté.', 'The die is cast.', 'Alea iacta est.',
     'Jules César', 'En franchissant le Rubicon, selon Suétone', 'Crossing the Rubicon, according to Suetonius', -49),

    ('cesar-veni-vidi-vici',
     'Je suis venu, j''ai vu, j''ai vaincu.', 'I came, I saw, I conquered.', 'Veni, vidi, vici.',
     'Jules César', 'Message annonçant sa victoire de Zéla, rapporté par Plutarque et Suétone',
     'Message announcing his victory at Zela, as reported by Plutarch and Suetonius', -47),

    ('ciceron-o-tempora',
     'Ô temps, ô mœurs !', 'Oh the times! Oh the customs!', 'O tempora, o mores!',
     'Cicéron', 'Première Catilinaire, discours devant le Sénat romain', 'First Catilinarian, speech to the Roman Senate', -63),

    ('socrate-vie-sans-examen',
     'Une vie sans examen ne vaut pas la peine d''être vécue.', 'The unexamined life is not worth living.', NULL,
     'Socrate', 'Lors de son procès, selon l''Apologie de Socrate de Platon', 'At his trial, according to Plato''s Apology', -399),

    ('montaigne-que-sais-je',
     'Que sais-je ?', 'What do I know?', NULL,
     'Michel de Montaigne', 'Essais, livre II', 'Essays, book II', 1580),

    ('descartes-je-pense-donc-je-suis',
     'Je pense, donc je suis.', 'I think, therefore I am.', NULL,
     'René Descartes', 'Discours de la méthode', 'Discourse on the Method', 1637),

    ('la-fontaine-aide-toi',
     'Aide-toi, le Ciel t''aidera.', 'Help yourself, and Heaven will help you.', NULL,
     'Jean de La Fontaine', 'Fables, « Le Chartier embourbé »', 'Fables, "The Carter in the Mire"', 1668),

    ('pascal-coeur-raisons',
     'Le cœur a ses raisons que la raison ne connaît point.', 'The heart has its reasons which reason knows nothing of.', NULL,
     'Blaise Pascal', 'Pensées', 'Pensées', 1670),

    ('voltaire-cultiver-jardin',
     'Il faut cultiver notre jardin.', 'We must cultivate our garden.', NULL,
     'Voltaire', 'Dernière phrase de Candide', 'Last line of Candide', 1759),

    ('rousseau-ne-libre',
     'L''homme est né libre, et partout il est dans les fers.', 'Man is born free, and everywhere he is in chains.', NULL,
     'Jean-Jacques Rousseau', 'Du contrat social', 'The Social Contract', 1762),

    ('declaration-1789-article-1',
     'Les hommes naissent et demeurent libres et égaux en droits.', 'Men are born and remain free and equal in rights.', NULL,
     'Assemblée nationale constituante', 'Article premier de la Déclaration des droits de l''homme et du citoyen',
     'Article 1 of the Declaration of the Rights of Man and of the Citizen', 1789),

    ('olympe-de-gouges-femme-nait-libre',
     'La femme naît libre et demeure égale à l''homme en droits.', 'Woman is born free and remains equal to man in rights.', NULL,
     'Olympe de Gouges', 'Article premier de la Déclaration des droits de la femme et de la citoyenne',
     'Article 1 of the Declaration of the Rights of Woman and of the Female Citizen', 1791),

    ('pasteur-hasard-esprits-prepares',
     'Dans les champs de l''observation, le hasard ne favorise que les esprits préparés.',
     'In the fields of observation, chance favours only the prepared mind.', NULL,
     'Louis Pasteur', 'Discours inaugural à la faculté des sciences de Lille', 'Inaugural lecture at the Faculty of Sciences in Lille', 1854),

    ('lincoln-gettysburg',
     'Le gouvernement du peuple, par le peuple et pour le peuple ne disparaîtra pas de la surface de la terre.',
     'Government of the people, by the people, for the people, shall not perish from the earth.', NULL,
     'Abraham Lincoln', 'Discours de Gettysburg, pendant la guerre de Sécession', 'Gettysburg Address, during the Civil War', 1863),

    ('zola-verite-en-marche',
     'La vérité est en marche, et rien ne l''arrêtera.', 'Truth is on the march, and nothing will stop it.', NULL,
     'Émile Zola', 'Article dans Le Figaro pendant l''affaire Dreyfus', 'Article in Le Figaro during the Dreyfus affair', 1897),

    ('roosevelt-peur-elle-meme',
     'La seule chose dont nous devons avoir peur, c''est la peur elle-même.', 'The only thing we have to fear is fear itself.', NULL,
     'Franklin D. Roosevelt', 'Discours d''investiture, en pleine Grande Dépression', 'First inaugural address, during the Great Depression', 1933),

    ('churchill-sang-labeur',
     'Je n''ai rien d''autre à offrir que du sang, du labeur, des larmes et de la sueur.',
     'I have nothing to offer but blood, toil, tears and sweat.', NULL,
     'Winston Churchill', 'Premier discours comme Premier ministre devant la Chambre des communes',
     'First speech as Prime Minister to the House of Commons', 1940),

    ('de-gaulle-flamme-resistance',
     'Quoi qu''il arrive, la flamme de la résistance française ne doit pas s''éteindre et ne s''éteindra pas.',
     'Whatever happens, the flame of French resistance must not and shall not die.', NULL,
     'Charles de Gaulle', 'Appel du 18 juin, à la BBC', 'Appeal of 18 June, on the BBC', 1940),

    ('mlk-i-have-a-dream',
     'Je fais le rêve que mes quatre jeunes enfants vivront un jour dans une nation où ils ne seront pas jugés sur la couleur de leur peau, mais sur la valeur de leur caractère.',
     'I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.',
     NULL, 'Martin Luther King Jr.', 'Discours de la marche sur Washington', 'Speech at the March on Washington', 1963),

    ('kennedy-ich-bin-ein-berliner',
     'Je suis un Berlinois.', 'I am a Berliner.', 'Ich bin ein Berliner.',
     'John F. Kennedy', 'Discours à Berlin-Ouest, deux ans après la construction du Mur', 'Speech in West Berlin, two years after the Wall was built', 1963),

    ('mandela-ideal',
     'C''est un idéal pour lequel j''espère vivre et que j''espère accomplir. Mais, s''il le faut, c''est un idéal pour lequel je suis prêt à mourir.',
     'It is an ideal which I hope to live for and to achieve. But if needs be, it is an ideal for which I am prepared to die.',
     NULL, 'Nelson Mandela', 'Déclaration au procès de Rivonia', 'Statement at the Rivonia Trial', 1964),

    ('armstrong-petit-pas',
     'C''est un petit pas pour l''homme, mais un bond de géant pour l''humanité.',
     'That''s one small step for man, one giant leap for mankind.', NULL,
     'Neil Armstrong', 'Premiers pas sur la Lune, mission Apollo 11', 'First steps on the Moon, Apollo 11 mission', 1969)
  ON CONFLICT (slug) DO UPDATE SET
    text_fr = EXCLUDED.text_fr,
    text = EXCLUDED.text,
    original_text = EXCLUDED.original_text,
    author = EXCLUDED.author,
    context_fr = EXCLUDED.context_fr,
    context = EXCLUDED.context,
    year = EXCLUDED.year;
END
$$;
