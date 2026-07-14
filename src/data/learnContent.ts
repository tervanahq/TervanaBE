// Tervana Learn: hand-authored lesson content for the Duolingo-style education path.
//
// Factual grounding: terpene/cannabinoid facts mirror the seeded reference data in
// supabase/migrations/20260708090000_seed_reference_data.sql (aromas, sources, reported
// effects, boiling points, psychoactivity flags). Effects language stays in the same
// non-clinical register as the rest of the app ("commonly reported", "associated
// with") — the Layout footer's disclaimer applies to all of this content. NY-specific
// rules (21+, 3 oz public possession, 10 mg/serving edible cap, gifting) follow the
// MRTA / OCM adult-use rules as of 2026.

export interface ChoiceExercise {
  type: 'choice'
  prompt: string
  options: string[]
  /** Index into `options` (pre-shuffle; the player shuffles presentation). */
  correctIndex: number
  explanation: string
  /** Keep options in authored order (True/False, ranked answers). */
  ordered?: boolean
}

export interface MatchExercise {
  type: 'match'
  prompt: string
  /** Right-hand strings must be unique within one exercise — matching is by value. */
  pairs: { left: string; right: string }[]
}

export type Exercise = ChoiceExercise | MatchExercise

export interface Lesson {
  id: string
  title: string
  exercises: Exercise[]
}

export type UnitColor = 'primary' | 'gold' | 'accent'

export interface Unit {
  id: string
  title: string
  tagline: string
  color: UnitColor
  lessons: Lesson[]
}

const TF = ['True', 'False']

export const units: Unit[] = [
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'basics',
    title: 'Cannabis 101',
    tagline: 'What the plant makes, and how to read a legal NY label.',
    color: 'primary',
    lessons: [
      {
        id: 'basics-whats-in-the-plant',
        title: "What's in the plant?",
        exercises: [
          {
            type: 'choice',
            prompt:
              'Cannabis effects come mostly from compounds made in tiny resin glands on the flower. What are those glands called?',
            options: ['Trichomes', 'Stomata', 'Follicles', 'Root nodes'],
            correctIndex: 0,
            explanation:
              'Trichomes are the frosty, crystal-like glands coating cannabis flower — the factories for both cannabinoids and terpenes.',
          },
          {
            type: 'choice',
            prompt: 'Which two families of compounds does Tervana profile on every product?',
            options: [
              'Cannabinoids and terpenes',
              'Proteins and sugars',
              'Vitamins and minerals',
              'Dyes and preservatives',
            ],
            correctIndex: 0,
            explanation:
              'Cannabinoids (like THC and CBD) and terpenes (the aroma compounds) are the two families most tied to how a product feels and tastes.',
          },
          {
            type: 'choice',
            prompt: 'True or false: THC is the only compound in cannabis that shapes how a product feels.',
            options: TF,
            correctIndex: 1,
            ordered: true,
            explanation:
              'THC matters, but other cannabinoids like CBD — and aroma compounds called terpenes — are widely reported to shape the experience too.',
          },
          {
            type: 'choice',
            prompt:
              'Cannabinoids interact with a signaling network your body already has. What is it called?',
            options: [
              'The endocannabinoid system',
              'The lymphatic system',
              'The vestibular system',
              'The circadian system',
            ],
            correctIndex: 0,
            explanation:
              'The endocannabinoid system (ECS) includes CB1 and CB2 receptors found throughout the body — cannabinoids plug into it.',
          },
          {
            type: 'choice',
            prompt: 'Terpenes are best described as…',
            options: [
              'Aroma compounds found across the plant kingdom',
              'Synthetic additives unique to cannabis',
              'A type of cannabinoid',
              'A measure of potency',
            ],
            correctIndex: 0,
            explanation:
              'Terpenes give pine forests, citrus rinds, and lavender their smells. Cannabis just produces an unusually wide range of them.',
          },
          {
            type: 'choice',
            prompt:
              'The idea that cannabinoids and terpenes may work together to shape effects is called the ____ effect.',
            options: ['entourage', 'domino', 'placebo', 'halo'],
            correctIndex: 0,
            explanation:
              'The "entourage effect" is a popular hypothesis. Early research is suggestive, but it is not settled science.',
          },
          {
            type: 'match',
            prompt: 'Match each term to its role.',
            pairs: [
              { left: 'Cannabinoids', right: 'Interact with CB1/CB2 receptors' },
              { left: 'Terpenes', right: 'Drive aroma and flavor' },
              { left: 'Trichomes', right: 'Glands that produce both' },
              { left: 'THC', right: 'The main intoxicating cannabinoid' },
            ],
          },
        ],
      },
      {
        id: 'basics-reading-the-label',
        title: 'Reading the label',
        exercises: [
          {
            type: 'choice',
            prompt: 'On NY adult-use flower, THC content is usually listed as…',
            options: [
              'A percentage of weight',
              'Milligrams per serving',
              'A star rating',
              'A color code',
            ],
            correctIndex: 0,
            explanation:
              'Flower and vapes list percentages; edibles and beverages use milligrams per serving instead.',
          },
          {
            type: 'choice',
            prompt: 'Edible potency is measured in…',
            options: [
              'Milligrams of THC per serving',
              'Percent of total weight',
              'Calories',
              'Proof, like liquor',
            ],
            correctIndex: 0,
            explanation:
              'NY adult-use edibles are capped at 10 mg THC per serving and 100 mg per package, so the label tells you exactly how much is in each piece.',
          },
          {
            type: 'choice',
            prompt: 'What is Metrc?',
            options: [
              "New York's seed-to-sale tracking system",
              'A cannabis brand',
              'A type of vaporizer',
              'A federal agency',
            ],
            correctIndex: 0,
            explanation:
              "Every legal NY product is tagged in Metrc, the state's track-and-trace system — that's what the QR code on the package connects to.",
          },
          {
            type: 'choice',
            prompt:
              'True or false: the QR code on a legal NY package links to lab-test information for that product.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              "True — and that's the same code Tervana scans to show you the terpene profile instead of a raw compliance page.",
          },
          {
            type: 'choice',
            prompt: 'A COA (Certificate of Analysis) tells you…',
            options: [
              'Lab-measured potency and safety results',
              "The grower's business license",
              'Suggested retail price',
              'The harvest playlist',
            ],
            correctIndex: 0,
            explanation:
              'A COA is the lab report: cannabinoid and terpene levels plus safety screens like pesticides and heavy metals.',
          },
          {
            type: 'choice',
            prompt:
              'Which of these is a red flag that a product may NOT be from a licensed NY dispensary?',
            options: [
              'No QR code or lab info on the package',
              'Child-resistant packaging',
              'A batch number',
              'The OCM universal symbol',
            ],
            correctIndex: 0,
            explanation:
              'Licensed products carry the OCM symbol, lab info, and a scannable tag. Unlicensed products usually skip all of that.',
          },
          {
            type: 'match',
            prompt: 'Match the label element to what it tells you.',
            pairs: [
              { left: 'THC %', right: 'Potency by weight' },
              { left: 'mg per serving', right: 'Edible dose size' },
              { left: 'COA', right: 'Lab test results' },
              { left: 'Batch number', right: 'Which production run it came from' },
            ],
          },
        ],
      },
      {
        id: 'basics-indica-sativa',
        title: 'Indica, sativa & the hybrid truth',
        exercises: [
          {
            type: 'choice',
            prompt: "'Indica' and 'sativa' originally described…",
            options: [
              'Plant shape and growing origin',
              'Guaranteed effects',
              'THC potency tiers',
              'Flavor categories',
            ],
            correctIndex: 0,
            explanation:
              'They are botanical labels — short, broad-leaf plants vs. tall, narrow-leaf plants — not effect guarantees.',
          },
          {
            type: 'choice',
            prompt: "True or false: a product labeled 'indica' is guaranteed to be relaxing.",
            options: TF,
            correctIndex: 1,
            ordered: true,
            explanation:
              "Studies of commercial cannabis find the labels only loosely track chemistry. Two 'indicas' can have very different terpene profiles.",
          },
          {
            type: 'choice',
            prompt: 'Most cannabis sold today is genetically…',
            options: ['A hybrid', 'Pure indica', 'Pure sativa', 'A wild landrace'],
            correctIndex: 0,
            explanation:
              'Decades of crossbreeding mean nearly everything on a dispensary shelf is a hybrid, whatever the label says.',
          },
          {
            type: 'choice',
            prompt:
              'According to the chemistry-first view Tervana is built on, the best predictor of how a product feels is…',
            options: [
              'Its cannabinoid and terpene profile',
              'Its strain name',
              'Its price',
              'The color of the packaging',
            ],
            correctIndex: 0,
            explanation:
              'Names and packaging are marketing. The measured profile is what actually varies — and what people report responding to.',
          },
          {
            type: 'choice',
            prompt:
              'Two products with the same strain name can feel different because effects track the actual ____, which varies batch to batch.',
            options: ['chemical profile', 'logo', 'harvest month', 'package size'],
            correctIndex: 0,
            explanation:
              'Genetics and growing conditions shift the terpene and cannabinoid mix, even within one strain name.',
          },
          {
            type: 'choice',
            prompt: 'Which is the most reliable habit when shopping?',
            options: [
              'Check the terpene + cannabinoid profile, not just the name',
              'Pick the highest THC % every time',
              'Choose by strain name alone',
              'Choose by packaging design',
            ],
            correctIndex: 0,
            explanation:
              "Higher THC isn't 'better' — the full profile is a much stronger guide to the experience people report.",
          },
          {
            type: 'match',
            prompt: 'Match the term to the reality.',
            pairs: [
              { left: 'Indica', right: 'A plant-shape label, not an effect promise' },
              { left: 'Sativa', right: 'Historically: tall, narrow-leaf plants' },
              { left: 'Hybrid', right: 'What almost everything is today' },
              { left: 'Chemovar', right: 'A plant classified by its chemistry' },
            ],
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'cannabinoids',
    title: 'Meet the cannabinoids',
    tagline: 'THC, CBD, and the minor players — who does what.',
    color: 'gold',
    lessons: [
      {
        id: 'cannabinoids-thc-cbd',
        title: 'THC & CBD: the big two',
        exercises: [
          {
            type: 'choice',
            prompt: "Which cannabinoid is the main driver of cannabis's intoxicating 'high'?",
            options: ['THC', 'CBD', 'CBG', 'CBC'],
            correctIndex: 0,
            explanation:
              'Tetrahydrocannabinol (THC) is the primary intoxicating cannabinoid — the main reason cannabis feels like cannabis.',
          },
          {
            type: 'choice',
            prompt: 'CBD is best described as…',
            options: [
              'Non-intoxicating and commonly associated with calm',
              'More intoxicating than THC',
              'A synthetic additive',
              'A terpene',
            ],
            correctIndex: 0,
            explanation:
              'Cannabidiol (CBD) does not produce a high. It is widely associated with calm and relaxation in consumer reports.',
          },
          {
            type: 'choice',
            prompt: "True or false: CBD is commonly used to take the edge off THC's intensity.",
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              'Balanced THC:CBD products are popular with people who find pure THC too intense — a common consumer report, not a medical claim.',
          },
          {
            type: 'choice',
            prompt: 'Commonly reported effects of THC include…',
            options: [
              'Euphoria, relaxation, and appetite stimulation',
              'Appetite suppression only',
              'No noticeable effects',
              'Improved night vision',
            ],
            correctIndex: 0,
            explanation:
              "Euphoria, relaxation, and the classic 'munchies' are the effects most commonly reported for THC.",
          },
          {
            type: 'choice',
            prompt:
              "A label reading 'THC 22% / CBD <1%' means the experience will be shaped almost entirely by ____.",
            options: ['THC', 'CBD', 'neither', 'the packaging'],
            correctIndex: 0,
            explanation:
              'With CBD near zero, THC dominates. THC-dominant products are the strongest-feeling and the easiest to overdo for newcomers.',
          },
          {
            type: 'choice',
            prompt: 'Which shopper most likely wants a balanced (1:1) THC:CBD product?',
            options: [
              'Someone newer who wants a gentler experience',
              'Someone chasing maximum intensity',
              'Someone avoiding cannabinoids entirely',
              'Someone shopping for terpenes only',
            ],
            correctIndex: 0,
            explanation:
              'Balanced products are the common recommendation for a moderated, gentler experience.',
          },
          {
            type: 'match',
            prompt: 'Match the product to its character.',
            pairs: [
              { left: 'THC', right: 'The main intoxicating cannabinoid' },
              { left: 'CBD', right: 'Calm-associated, no high' },
              { left: '22% THC / <1% CBD', right: 'THC-dominant product' },
              { left: '1:1 THC:CBD', right: 'Balanced, gentler profile' },
            ],
          },
        ],
      },
      {
        id: 'cannabinoids-minors',
        title: 'The minor cannabinoids',
        exercises: [
          {
            type: 'choice',
            prompt: "CBG is nicknamed the 'mother cannabinoid' because…",
            options: [
              'THC and CBD are synthesized from its acidic form as the plant matures',
              'It is the most abundant cannabinoid in dried flower',
              'It was discovered first',
              'It only appears in mother plants',
            ],
            correctIndex: 0,
            explanation:
              'CBGA, the acidic form of CBG, is the chemical starting point the plant converts into THC and CBD.',
          },
          {
            type: 'choice',
            prompt: 'CBN becomes more concentrated in cannabis that is…',
            options: [
              'Aged — it forms as THC degrades',
              'Freshly harvested',
              'Grown indoors',
              'High in CBD',
            ],
            correctIndex: 0,
            explanation:
              'CBN is an oxidation product of THC, so older flower tends to carry more of it.',
          },
          {
            type: 'choice',
            prompt: 'Which minor cannabinoid is most commonly associated with sleep support?',
            options: ['CBN', 'CBG', 'CBC', 'THCV'],
            correctIndex: 0,
            explanation:
              'CBN is the one most associated with sedation and sleep support in consumer and industry reports.',
          },
          {
            type: 'choice',
            prompt: 'THCV stands out because it is often linked to…',
            options: [
              "Appetite suppression — the opposite of THC's munchies",
              'Stronger appetite stimulation than THC',
              'No psychoactivity at all',
              'Turning flower purple',
            ],
            correctIndex: 0,
            explanation:
              'THCV is chemically similar to THC but often described as a clearer, shorter, more energizing experience — with an appetite-suppressing association.',
          },
          {
            type: 'choice',
            prompt: 'CBC is commonly described as…',
            options: [
              'Non-intoxicating, associated with mood support and synergy',
              'The strongest psychoactive cannabinoid',
              'An artificial flavoring',
              'A terpene',
            ],
            correctIndex: 0,
            explanation:
              'CBC shares a chemical starting point with THC and CBD and is commonly reported as working synergistically with other cannabinoids.',
          },
          {
            type: 'choice',
            prompt: 'As cannabis ages, THC slowly oxidizes into ____.',
            options: ['CBN', 'CBG', 'CBD', 'limonene'],
            correctIndex: 0,
            explanation:
              "That's why aged flower is often described as sleepier — and why storage away from heat, light, and air matters.",
          },
          {
            type: 'match',
            prompt: 'Match the minor cannabinoid to its claim to fame.',
            pairs: [
              { left: 'CBG', right: "The 'mother cannabinoid'" },
              { left: 'CBN', right: 'Forms as THC ages; linked to sleep' },
              { left: 'THCV', right: 'Energizing; appetite-suppressing association' },
              { left: 'CBC', right: 'Mood support and synergy' },
            ],
          },
        ],
      },
      {
        id: 'cannabinoids-psychoactive',
        title: 'Psychoactive or not?',
        exercises: [
          {
            type: 'choice',
            prompt: 'True or false: THC is intoxicating.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation: 'THC is the classic cannabis high — the benchmark all the others get compared to.',
          },
          {
            type: 'choice',
            prompt: 'Which of these cannabinoids is NOT considered intoxicating?',
            options: ['CBD', 'THC', 'CBN', 'THCV'],
            correctIndex: 0,
            explanation:
              'CBD (along with CBG and CBC) does not produce a high. THC, CBN, and THCV are the psychoactive ones.',
          },
          {
            type: 'choice',
            prompt: 'True or false: CBN — the one found in aged cannabis — is mildly psychoactive.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              "It's much weaker than THC, but CBN is classed as psychoactive — one reason aged flower can still feel sedating.",
          },
          {
            type: 'choice',
            prompt: 'Which trio is psychoactive?',
            options: [
              'THC, CBN, THCV',
              'CBD, CBG, CBC',
              'CBD, THC, CBG',
              'CBC, CBG, THCV',
            ],
            correctIndex: 0,
            explanation:
              'THC, CBN, and THCV are the intoxicating three; CBD, CBG, and CBC are the non-intoxicating three.',
          },
          {
            type: 'choice',
            prompt: "'Non-intoxicating' means a cannabinoid…",
            options: [
              "Doesn't produce a high, though people may still report effects on how they feel",
              'Has zero interaction with your body',
              'Is illegal in New York',
              'Is synthetic',
            ],
            correctIndex: 0,
            explanation:
              'CBD, CBG, and CBC do not get you high, but calming, focus, and mood effects are still commonly reported.',
          },
          {
            type: 'match',
            prompt: 'Match each cannabinoid to its character.',
            pairs: [
              { left: 'THC', right: 'The classic high' },
              { left: 'CBN', right: 'Mildly psychoactive, sleepy' },
              { left: 'CBD', right: 'No high; reported calm' },
              { left: 'CBG', right: 'No high; reported focus' },
            ],
          },
          {
            type: 'choice',
            prompt:
              "A friend picks up a CBG-forward product and asks if it will get them high. What's the accurate answer?",
            options: [
              'No — CBG is non-intoxicating, though people report focus and mild energy',
              'Yes, more than THC',
              'Only if refrigerated',
              'CBG is not found in cannabis',
            ],
            correctIndex: 0,
            explanation:
              "CBG won't produce a high. Focus and mild energy are its commonly reported associations.",
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'terpenes',
    title: 'Terpenes: the aroma layer',
    tagline: 'From couch-lock myrcene to lavender linalool — learn them by nose.',
    color: 'accent',
    lessons: [
      {
        id: 'terpenes-what-they-do',
        title: 'What terpenes do',
        exercises: [
          {
            type: 'choice',
            prompt: 'The most abundant terpene in most cannabis cultivars is…',
            options: ['Myrcene', 'Limonene', 'Linalool', 'Guaiol'],
            correctIndex: 0,
            explanation:
              'Myrcene — earthy, musky, with ripe-fruit notes — tops the chart in most cultivars. You also meet it in mangoes and hops.',
          },
          {
            type: 'choice',
            prompt: "Terpenes are responsible for a product's…",
            options: ['Aroma and flavor', 'THC percentage', 'Weight', 'Moisture content'],
            correctIndex: 0,
            explanation:
              'Terpenes are the aroma layer — and, per the entourage-effect hypothesis, possibly a modifier of the experience itself.',
          },
          {
            type: 'choice',
            prompt: 'True or false: terpenes only exist in cannabis.',
            options: TF,
            correctIndex: 1,
            ordered: true,
            explanation:
              'The very same molecules show up in mangoes, black pepper, lavender, and pine trees. Cannabis is just unusually rich in them.',
          },
          {
            type: 'choice',
            prompt: 'Myrcene-dominant strains are commonly — though debatably — linked to…',
            options: ["'Couch-lock' relaxation", 'Racing energy', 'Sneezing fits', 'Improved hearing'],
            correctIndex: 0,
            explanation:
              "The myrcene 'couch-lock' story is popular in the industry but scientifically debated. Treat it as folklore with a grain of truth.",
          },
          {
            type: 'choice',
            prompt:
              "Which terpene is the only one known to bind the body's CB2 cannabinoid receptor directly?",
            options: ['Beta-caryophyllene', 'Myrcene', 'Limonene', 'Alpha-pinene'],
            correctIndex: 0,
            explanation:
              'That makes beta-caryophyllene a genuine chemical overlap between terpenes and cannabinoids — not just an aroma.',
          },
          {
            type: 'choice',
            prompt: 'Beta-caryophyllene gives black pepper its bite. Its aroma reads as ____.',
            options: ['peppery and spicy', 'sweet citrus', 'floral lavender', 'fresh mint'],
            correctIndex: 0,
            explanation:
              'Peppery, spicy, woody, clove-like — if a strain smells like cracked pepper, this is why.',
          },
          {
            type: 'match',
            prompt: 'Match the terpene to where else it shows up in nature.',
            pairs: [
              { left: 'Myrcene', right: 'Mangoes and hops' },
              { left: 'Limonene', right: 'Citrus rinds' },
              { left: 'Beta-caryophyllene', right: 'Black pepper and cloves' },
              { left: 'Linalool', right: 'Lavender' },
            ],
          },
        ],
      },
      {
        id: 'terpenes-citrus-pine',
        title: 'The bright ones: citrus & pine',
        exercises: [
          {
            type: 'choice',
            prompt: 'Limonene smells like…',
            options: ['Lemon and orange', 'Diesel fuel', 'Lavender', 'Damp forest'],
            correctIndex: 0,
            explanation:
              'Bright citrus, straight from lemon and orange rinds. It is widely associated with uplifting, stress-relieving reports.',
          },
          {
            type: 'choice',
            prompt: 'Alpha-pinene is commonly cited for…',
            options: ['Alertness and focus', 'Sedation', 'Appetite stimulation', 'Numbness'],
            correctIndex: 0,
            explanation:
              'It is even anecdotally cited for offsetting the short-term memory fog some people associate with THC.',
          },
          {
            type: 'choice',
            prompt: 'Where would you naturally encounter alpha-pinene?',
            options: ['Pine needles and rosemary', 'Vanilla beans', 'Coffee grounds', 'Sea water'],
            correctIndex: 0,
            explanation: 'Pine needles, rosemary, and basil — the fresh-forest smell is literally the same molecule.',
          },
          {
            type: 'choice',
            prompt: 'Terpinolene — part floral, part piney — is strongly associated with…',
            options: [
              "The classic 'sativa' scent and uplifting reports",
              'Couch-lock',
              'The smell of rain',
              'Bitterness',
            ],
            correctIndex: 0,
            explanation:
              "Terpinolene is rarely dominant, but when it is, you get that complex floral-piney profile people call the 'sativa' smell.",
          },
          {
            type: 'choice',
            prompt:
              'True or false: beta-pinene is a structural cousin of alpha-pinene and usually shows up alongside it.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              'The two pinenes travel together in the same cultivars; beta-pinene reads a bit more herbal and woody.',
          },
          {
            type: 'choice',
            prompt: 'Eucalyptol — the cooling, minty one — is ____ in cannabis.',
            options: [
              'rare, usually only in trace amounts',
              'the most abundant terpene',
              'never found',
              'only in edibles',
            ],
            correctIndex: 0,
            explanation:
              'You know it from eucalyptus and cold-relief products; in cannabis it is one of the rarer terpenes.',
          },
          {
            type: 'match',
            prompt: 'Match the terpene to its aroma.',
            pairs: [
              { left: 'Limonene', right: 'Bright citrus' },
              { left: 'Alpha-pinene', right: 'Fresh pine forest' },
              { left: 'Terpinolene', right: 'Floral-piney, light citrus' },
              { left: 'Eucalyptol', right: 'Cooling mint' },
            ],
          },
        ],
      },
      {
        id: 'terpenes-calming',
        title: 'The calm ones: florals & sleepy notes',
        exercises: [
          {
            type: 'choice',
            prompt: 'Linalool is the signature aroma of…',
            options: ['Lavender', 'Oranges', 'Black pepper', 'Hops'],
            correctIndex: 0,
            explanation:
              'Linalool is why lavender is the calm-down plant — the association carries into aromatherapy far beyond cannabis.',
          },
          {
            type: 'choice',
            prompt: 'Humulene shares its aroma (and its name family) with…',
            options: ['Hops — it can read beer-like', 'Roses', 'Bananas', 'Cinnamon only'],
            correctIndex: 0,
            explanation:
              'Humulene is named for Humulus lupulus — hops. Cultivars rich in it can carry an earthy, hoppy edge.',
          },
          {
            type: 'choice',
            prompt: 'What makes humulene unusual among cannabis terpenes?',
            options: [
              'It is associated with appetite suppression rather than stimulation',
              'It is the sweetest terpene',
              'It is psychoactive',
              'It only appears in edibles',
            ],
            correctIndex: 0,
            explanation:
              "Most cannabis lore is about the munchies; humulene's reported association runs the other way.",
          },
          {
            type: 'choice',
            prompt:
              'Nerolidol — woody, floral, faintly tropical — is often mentioned alongside linalool in cultivars aimed at…',
            options: ['Sleep', 'Morning energy', 'Focus at work', 'Pre-workout hype'],
            correctIndex: 0,
            explanation:
              'Nerolidol carries sedating, sleep-support associations, so it gets paired with linalool in nighttime-oriented profiles.',
          },
          {
            type: 'choice',
            prompt: 'Bisabolol is best known as the calming compound in…',
            options: ['Chamomile', 'Espresso', 'Ginger', 'Garlic'],
            correctIndex: 0,
            explanation:
              'The chamomile-tea terpene. It is also all over skincare products for its skin-soothing reputation.',
          },
          {
            type: 'choice',
            prompt: 'Geraniol adds a ____ note where present.',
            options: ['sweet, rose-like floral', 'burnt rubber', 'sour dairy', 'smoky barbecue'],
            correctIndex: 0,
            explanation:
              'Geraniol is the rose-garden terpene — the fragrance industry uses it constantly.',
          },
          {
            type: 'match',
            prompt: 'Match the calm-leaning terpene to its natural source.',
            pairs: [
              { left: 'Linalool', right: 'Lavender fields' },
              { left: 'Bisabolol', right: 'Chamomile flowers' },
              { left: 'Geraniol', right: 'Roses and geraniums' },
              { left: 'Humulene', right: 'Hop cones' },
            ],
          },
        ],
      },
      {
        id: 'terpenes-sniff-test',
        title: 'Sniff test: name that terpene',
        exercises: [
          {
            type: 'match',
            prompt: 'Warm-up: match the aroma to the terpene.',
            pairs: [
              { left: 'Earthy, musky, ripe fruit', right: 'Myrcene' },
              { left: 'Bright lemon-orange', right: 'Limonene' },
              { left: 'Black-pepper spice', right: 'Beta-caryophyllene' },
              { left: 'Lavender floral', right: 'Linalool' },
            ],
          },
          {
            type: 'choice',
            prompt:
              'You open a jar and smell a fresh pine forest. Which terpene is most likely dominant?',
            options: ['Alpha-pinene', 'Valencene', 'Bisabolol', 'Geraniol'],
            correctIndex: 0,
            explanation: 'Sharp pine = pinene. Its cousin beta-pinene is probably along for the ride.',
          },
          {
            type: 'choice',
            prompt: 'A vape smells strongly of sweet oranges. Valencene is named after…',
            options: [
              'Valencia oranges',
              "The city of Valencia's flag",
              'A chemist named Valence',
              'Valence electrons',
            ],
            correctIndex: 0,
            explanation:
              'Valencene is a signature aromatic of Valencia oranges — a minor cannabis terpene, but unmistakably citrus-sweet.',
          },
          {
            type: 'choice',
            prompt: "A budtender says a strain 'smells like a hop field.' Which terpene?",
            options: ['Humulene', 'Eucalyptol', 'Camphene', 'Linalool'],
            correctIndex: 0,
            explanation: 'Hoppy, earthy, woody — humulene is the beer-adjacent one.',
          },
          {
            type: 'match',
            prompt: "Match the terpene to a plant you'd meet it in.",
            pairs: [
              { left: 'Ocimene', right: 'Mint and orchids' },
              { left: 'Camphene', right: 'Nutmeg and valerian root' },
              { left: 'Borneol', right: 'Camphor trees and rosemary' },
              { left: 'Fenchol', right: 'Basil' },
            ],
          },
          {
            type: 'choice',
            prompt: 'Damp woodland with a faint camphor edge — that reads as…',
            options: ['Camphene', 'Limonene', 'Valencene', 'Geraniol'],
            correctIndex: 0,
            explanation:
              'Camphene is the damp-woodlands terpene, a minor player found in nutmeg, ginger, and valerian root.',
          },
          {
            type: 'choice',
            prompt: 'Which pair both lean minty?',
            options: [
              'Eucalyptol and isopulegol',
              'Myrcene and humulene',
              'Limonene and valencene',
              'Geraniol and nerolidol',
            ],
            correctIndex: 0,
            explanation:
              'Eucalyptol is the cooling-mint terpene, and isopulegol is chemically related to menthol.',
          },
          {
            type: 'match',
            prompt: 'Final round: aroma to terpene.',
            pairs: [
              { left: 'Lilac sweetness', right: 'Terpineol' },
              { left: 'Woody with a rose undertone', right: 'Guaiol' },
              { left: 'Sweet herbal top note', right: 'Ocimene' },
              { left: 'Woody-floral-tropical', right: 'Nerolidol' },
            ],
          },
        ],
      },
    ],
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'smart',
    title: 'Smart consumer',
    tagline: 'Dosing sense, temperature science, and the NY rules that matter.',
    color: 'primary',
    lessons: [
      {
        id: 'smart-start-low',
        title: 'Start low, go slow',
        exercises: [
          {
            type: 'choice',
            prompt: 'A sensible first-time edible amount commonly suggested for adults is…',
            options: ['2.5–5 mg THC', '50 mg THC', '100 mg THC', 'A whole package'],
            correctIndex: 0,
            explanation:
              'NY caps adult-use edibles at 10 mg THC per serving; many people start with half a serving or less. Widely shared guidance, not medical advice.',
          },
          {
            type: 'choice',
            prompt: 'Edibles typically take ____ to kick in.',
            options: ['30 minutes to 2 hours', '10 seconds', '2–3 days', 'They never do'],
            correctIndex: 0,
            explanation:
              'Inhalation is felt within minutes; edibles are slow because THC is processed through digestion first.',
          },
          {
            type: 'choice',
            prompt: 'The classic edible mistake is…',
            options: [
              "Taking a second dose because the first 'isn't working' yet",
              'Drinking water with it',
              'Eating after a meal',
              'Reading the label first',
            ],
            correctIndex: 0,
            explanation:
              "Doubling up before the first dose lands is how most 'way too high' stories start. Give it at least two hours.",
          },
          {
            type: 'choice',
            prompt: 'True or false: edible effects usually last longer than inhaled effects.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              'Edibles can run 4–8 hours versus roughly 1–3 for inhalation. Plan the rest of your day accordingly.',
          },
          {
            type: 'choice',
            prompt: 'If someone feels uncomfortably high, the best move is…',
            options: [
              'A calm space, water, a snack, and time — it passes',
              'More THC',
              'Driving around to clear their head',
              'A stiff drink',
            ],
            correctIndex: 0,
            explanation:
              'Cannabis alone is not known to cause fatal overdose, but too much THC can be genuinely unpleasant. Rest and time are the fix — never driving.',
          },
          {
            type: 'choice',
            prompt: 'Mixing cannabis with alcohol generally…',
            options: [
              'Intensifies impairment unpredictably',
              'Cancels both out',
              'Is recommended for beginners',
              'Makes THC wear off faster',
            ],
            correctIndex: 0,
            explanation:
              "Alcohol can raise THC absorption and stack impairment. If you're new to either, don't combine them.",
          },
          {
            type: 'choice',
            prompt: 'The golden rule for new consumers: start ____, go ____.',
            options: ['low … slow', 'high … fast', 'big … bold', 'late … early'],
            correctIndex: 0,
            explanation:
              'Start low, go slow. You can always take more later; you cannot take less once it has kicked in.',
          },
        ],
      },
      {
        id: 'smart-temperature',
        title: 'Temperature & terpenes',
        exercises: [
          {
            type: 'choice',
            prompt: 'Terpenes are volatile, which means they…',
            options: [
              'Evaporate easily with heat',
              'Explode under pressure',
              'Never degrade',
              'Only form when frozen',
            ],
            correctIndex: 0,
            explanation:
              'Volatility is why flower loses its nose over time — and why temperature control changes what you taste.',
          },
          {
            type: 'choice',
            prompt: 'Of these four, which terpene boils at the LOWEST temperature?',
            options: ['Alpha-pinene', 'Linalool', 'Nerolidol', 'Bisabolol'],
            correctIndex: 0,
            explanation:
              'Alpha-pinene boils around 155°C — versus linalool at ~198°C, nerolidol at ~276°C, and bisabolol at ~314°C.',
          },
          {
            type: 'choice',
            prompt: 'Why do many vaporizer users start at lower temperatures?',
            options: [
              'To taste more of the terpenes before they burn off',
              'To save battery',
              'It is required by law',
              'To make the vapor glow',
            ],
            correctIndex: 0,
            explanation:
              'Low-and-slow preserves the delicate, low-boiling terpenes; cranking the heat trades flavor for density.',
          },
          {
            type: 'choice',
            prompt:
              'True or false: burning (combusting) flower happens at a much higher temperature than vaporizing.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              "A lit flame runs several hundred degrees hotter than a vaporizer's typical 160–220°C range, destroying many aroma compounds outright.",
          },
          {
            type: 'choice',
            prompt:
              'Bisabolol boils near 314°C; beta-caryophyllene near 160°C. Which releases at a lower vape temperature?',
            options: ['Beta-caryophyllene', 'Bisabolol', 'Both the same', 'Neither vaporizes'],
            correctIndex: 0,
            explanation:
              'Lower boiling point = releases earlier. Heavy terpenes like bisabolol need serious heat to show up at all.',
          },
          {
            type: 'choice',
            prompt: 'How should flower be stored to protect its terpenes?',
            options: [
              'Cool, dark, and airtight',
              'On a sunny windowsill',
              'Uncovered in the freezer',
              'Near the stove',
            ],
            correctIndex: 0,
            explanation:
              'Heat, light, and air degrade terpenes — and slowly oxidize THC into sleepy CBN while they are at it.',
          },
          {
            type: 'match',
            prompt: 'Match the approximate boiling point to the terpene.',
            pairs: [
              { left: '~155°C', right: 'Alpha-pinene' },
              { left: '~167°C', right: 'Myrcene' },
              { left: '~198°C', right: 'Linalool' },
              { left: '~314°C', right: 'Bisabolol' },
            ],
          },
        ],
      },
      {
        id: 'smart-ny-rules',
        title: 'NY rules of the road',
        exercises: [
          {
            type: 'choice',
            prompt: 'The minimum age to buy or consume adult-use cannabis in New York is…',
            options: ['21', '18', '25', '16'],
            correctIndex: 0,
            explanation: '21+, no exceptions — the same line the footer of this site draws.',
          },
          {
            type: 'choice',
            prompt: 'Legal NY products are sold at…',
            options: [
              'Licensed dispensaries displaying an OCM license',
              'Any bodega with a leaf sign',
              'Vending machines',
              'Out-of-state websites',
            ],
            correctIndex: 0,
            explanation:
              "The Office of Cannabis Management licenses dispensaries, and the state's dispensary-verification tool lets you confirm a shop is legit.",
          },
          {
            type: 'choice',
            prompt:
              'True or false: it is legal to drive after consuming cannabis as long as you feel fine.',
            options: TF,
            correctIndex: 1,
            ordered: true,
            explanation:
              "Driving while impaired by cannabis is illegal in NY, full stop. 'Feeling fine' is not a measurement.",
          },
          {
            type: 'choice',
            prompt: 'NY adult-use edibles are capped at ____ per serving.',
            options: ['10 mg THC', '100 mg THC', '1 g THC', 'No limit'],
            correctIndex: 0,
            explanation:
              '10 mg per serving and 100 mg per package — the serving line on the label is a regulatory boundary, not a suggestion.',
          },
          {
            type: 'choice',
            prompt: 'The safest way to store cannabis at home is…',
            options: [
              'Locked, in original child-resistant packaging, away from kids and pets',
              'In the fruit bowl',
              'Unlabeled in the fridge',
              'In the glovebox',
            ],
            correctIndex: 0,
            explanation:
              'Edibles especially can look like regular candy. Locked and labeled is the standard.',
          },
          {
            type: 'choice',
            prompt: 'In public, an adult in NY can legally possess up to ____ of flower.',
            options: ['3 ounces', '3 pounds', '1 gram', 'Unlimited'],
            correctIndex: 0,
            explanation:
              'Up to 3 oz of flower and 24 g of concentrate in public. Home limits are higher (up to 5 lbs) but must be stored securely.',
          },
          {
            type: 'choice',
            prompt: 'Where is smoking cannabis generally allowed in NY?',
            options: [
              'Wherever tobacco smoking is allowed, with local exceptions',
              'Anywhere, including schools',
              'Inside any restaurant',
              'In a moving car, if parked later',
            ],
            correctIndex: 0,
            explanation:
              'The baseline rule: where you can smoke tobacco, you can generally smoke cannabis — but never in vehicles, and localities can add restrictions.',
          },
          {
            type: 'choice',
            prompt:
              'True or false: gifting up to 3 oz to another adult 21+ — with nothing of value exchanged — is legal in NY.',
            options: TF,
            correctIndex: 0,
            ordered: true,
            explanation:
              "True, as long as it is a genuine gift. 'Gifting' bundled with a purchase is the classic unlicensed-shop loophole, and it is not legal.",
          },
        ],
      },
    ],
  },
]

/** All lessons in path order, each with its unit (for theming and unlock order). */
export const orderedLessons: { lesson: Lesson; unit: Unit }[] = units.flatMap((unit) =>
  unit.lessons.map((lesson) => ({ lesson, unit })),
)

export function findLesson(lessonId: string): { lesson: Lesson; unit: Unit } | undefined {
  return orderedLessons.find(({ lesson }) => lesson.id === lessonId)
}

export const totalLessonCount = orderedLessons.length
