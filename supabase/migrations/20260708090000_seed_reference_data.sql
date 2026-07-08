-- Tervana reference data seed: 20 terpenes + 6 cannabinoids.
-- Values reviewed and corrected in collaboration with the project owner
-- (boiling points for ocimene, bisabolol, valencene, nerolidol, and guaiol
-- were corrected from an initial draft that had mixed up reduced-pressure/
-- melting-point readings with atmospheric boiling points). "reported_effects"
-- reflects common consumer/industry framing, not clinical claims -- the app
-- surfaces a non-medical disclaimer alongside this data (see Footer.tsx).

insert into public.terpenes (name, slug, aroma_profile, reported_effects, boiling_point_c, also_found_in, description) values
('Myrcene', 'myrcene',
  ARRAY['earthy','musky','clove','ripe fruit'],
  ARRAY['relaxing','sedating','calming'],
  167.00,
  ARRAY['mangoes','hops','lemongrass','thyme','bay leaves'],
  'The most abundant terpene in most cannabis cultivars. Commonly cited -- though scientifically debated -- as the terpene behind "couch-lock" in myrcene-dominant strains.'),

('Limonene', 'limonene',
  ARRAY['citrus','lemon','orange'],
  ARRAY['uplifting','stress relief','mood support'],
  176.00,
  ARRAY['citrus rinds','juniper','peppermint'],
  'Bright citrus aroma found in lemon and orange rinds. Widely associated with mood elevation and stress relief in consumer reports.'),

('Beta-Caryophyllene', 'beta-caryophyllene',
  ARRAY['peppery','spicy','woody','clove'],
  ARRAY['calming','stress relief','anti-inflammatory'],
  160.00,
  ARRAY['black pepper','cloves','cinnamon','oregano'],
  'The only terpene known to also bind the body''s CB2 cannabinoid receptor directly -- a genuine overlap with cannabinoid effects, not just aroma.'),

('Alpha-Pinene', 'alpha-pinene',
  ARRAY['pine','fresh forest'],
  ARRAY['alertness','focus','memory support'],
  155.00,
  ARRAY['pine needles','rosemary','basil'],
  'Sharp pine aroma. Often cited anecdotally for promoting alertness and offsetting short-term memory fog some people associate with THC.'),

('Beta-Pinene', 'beta-pinene',
  ARRAY['pine','herbal','woody'],
  ARRAY['alertness','uplifting'],
  164.00,
  ARRAY['pine needles','dill','parsley','basil'],
  'A structural cousin of alpha-pinene with a more herbal, woody edge. Usually found alongside it in the same cultivars.'),

('Linalool', 'linalool',
  ARRAY['floral','lavender'],
  ARRAY['calming','relaxing','sleep support'],
  198.00,
  ARRAY['lavender','birch bark','coriander'],
  'The signature aroma of lavender. Broadly associated with relaxation and calm, and common in aromatherapy products outside cannabis entirely.'),

('Humulene', 'humulene',
  ARRAY['earthy','woody','hoppy'],
  ARRAY['appetite suppression','anti-inflammatory'],
  198.00,
  ARRAY['hops','coriander','cloves','basil'],
  'Shares its name and aroma with hops, giving some cultivars a beer-like edge. Unusual among cannabis terpenes for an appetite-suppressing association rather than stimulating.'),

('Terpinolene', 'terpinolene',
  ARRAY['floral','herbal','piney','light citrus'],
  ARRAY['uplifting','energizing'],
  186.00,
  ARRAY['nutmeg','tea tree','lilac','apples'],
  'A complex aroma that reads as part floral, part piney. Less common as a dominant terpene, but strongly associated with the classic "sativa" scent profile.'),

('Ocimene', 'ocimene',
  ARRAY['sweet','herbal','woody'],
  ARRAY['uplifting','energizing'],
  177.00,
  ARRAY['mint','parsley','orchids','mangoes'],
  'A sweet, herbaceous terpene contributing top-note aroma. Boils in the same range as other monoterpenes like limonene and eucalyptol.'),

('Bisabolol', 'bisabolol',
  ARRAY['floral','chamomile','sweet'],
  ARRAY['calming','skin-soothing'],
  314.00,
  ARRAY['chamomile flowers'],
  'Best known as the primary calming compound in chamomile, and widely used in skincare for its soothing reputation.'),

('Camphene', 'camphene',
  ARRAY['earthy','damp woodlands','faint camphor'],
  ARRAY['antioxidant-associated'],
  159.00,
  ARRAY['nutmeg','ginger','valerian root'],
  'A minor terpene with little consumer-facing effects research compared to myrcene or limonene.'),

('Valencene', 'valencene',
  ARRAY['sweet citrus','orange'],
  ARRAY['uplifting'],
  255.00,
  ARRAY['valencia oranges','tangerines'],
  'Named for Valencia oranges, where it''s a signature aromatic. A minor cannabis terpene, most notable for its sweet citrus scent.'),

('Geraniol', 'geraniol',
  ARRAY['floral','rose','sweet'],
  ARRAY['calming','mood support'],
  231.00,
  ARRAY['geraniums','roses','lemongrass'],
  'A rose-like floral terpene also widely used in the fragrance industry. Adds a sweet, floral note where present.'),

('Nerolidol', 'nerolidol',
  ARRAY['woody','floral','citrus','tropical'],
  ARRAY['sedating','sleep support'],
  276.00,
  ARRAY['jasmine','tea tree','ginger','citrus peel'],
  'A woody, floral terpene with a hint of fresh citrus. Often mentioned alongside linalool for sleep-oriented cultivars.'),

('Eucalyptol', 'eucalyptol',
  ARRAY['minty','cooling','medicinal'],
  ARRAY['focus','alertness','decongestant'],
  176.00,
  ARRAY['eucalyptus','bay leaves','tea tree','rosemary'],
  'A cooling, minty aroma familiar from eucalyptus and cold-relief products. One of the rarer cannabis terpenes, usually only in trace amounts.'),

('Guaiol', 'guaiol',
  ARRAY['woody','rose','pine'],
  ARRAY['calming'],
  280.00,
  ARRAY['guaiacum wood','cypress pine'],
  'An uncommon woody terpene with a faint rose-like undertone. Appears in only a small subset of cultivars, usually in trace amounts.'),

('Isopulegol', 'isopulegol',
  ARRAY['minty','fresh','floral'],
  ARRAY['calming','relaxing'],
  207.00,
  ARRAY['lemongrass','eucalyptus'],
  'A minty, fresh terpene chemically related to menthol. Considered a precursor note in some mint-forward cultivars.'),

('Fenchol', 'fenchol',
  ARRAY['camphor','herbal','damp forest'],
  ARRAY['antioxidant-associated'],
  202.00,
  ARRAY['basil','ginger'],
  'A camphor-like, herbal terpene most familiar from basil. A minor contributor found in only a subset of cultivars.'),

('Borneol', 'borneol',
  ARRAY['camphor','minty','herbal'],
  ARRAY['calming','stress relief'],
  210.00,
  ARRAY['mint','camphor trees','rosemary'],
  'A crisp, camphor-like terpene used for centuries in traditional herbal remedies across Asia. Adds herbal sharpness where it appears.'),

('Terpineol', 'terpineol',
  ARRAY['lilac','floral','mint'],
  ARRAY['relaxing','calming'],
  219.00,
  ARRAY['lilac','pine','eucalyptus','cajuput oil'],
  'A floral terpene with lilac-like sweetness, often appearing alongside myrcene. Frequently described as smoothing out a cultivar''s overall aroma.');

insert into public.cannabinoids (name, abbreviation, slug, description, reported_effects, is_psychoactive) values
('Tetrahydrocannabinol', 'THC', 'thc',
  'The primary intoxicating cannabinoid in cannabis and the main driver of the "high" it produces. Also widely reported for pain relief and appetite stimulation.',
  ARRAY['euphoric','relaxing','appetite stimulation'],
  true),

('Cannabidiol', 'CBD', 'cbd',
  'Commonly used to offset THC''s psychoactivity. Widely associated with calm and relaxation, without the intoxicating high associated with THC.',
  ARRAY['calming','anti-inflammatory','stress relief'],
  false),

('Cannabigerol', 'CBG', 'cbg',
  'Known as the "mother cannabinoid" -- THC and CBD are synthesized from its acidic form (CBGA) as the plant matures. Commonly associated with focus and mild energy.',
  ARRAY['focus','mood support','anti-inflammatory'],
  false),

('Cannabinol', 'CBN', 'cbn',
  'Forms as THC degrades and oxidizes over time, so it''s more concentrated in aged cannabis. Most commonly associated with sedation and sleep support.',
  ARRAY['sedating','sleep support','calming'],
  true),

('Cannabichromene', 'CBC', 'cbc',
  'Shares a chemical starting point with THC and CBD. Commonly reported as contributing to mood support and working synergistically with other cannabinoids.',
  ARRAY['mood support','anti-inflammatory'],
  false),

('Tetrahydrocannabivarin', 'THCV', 'thcv',
  'Chemically similar to THC but distinct -- often described as a clearer, more energizing high with shorter duration. Notably linked to appetite suppression, the opposite of THC''s typical effect.',
  ARRAY['energizing','focus','appetite suppression'],
  true);
