import { Word } from '../types';

const d = '2024-01-01T00:00:00.000Z';

const w = (
  word: string,
  category: Word['category'],
  difficulty: Word['difficulty'],
  partOfSpeech: string,
  pronunciation: string,
  definition: string,
  example: string | undefined,
  synonyms: string[],
  antonyms: string[],
): Word => ({
  id: `${word}-${category}`,
  word,
  category,
  difficulty,
  partOfSpeech,
  pronunciation,
  definition,
  example,
  synonyms,
  antonyms,
  meanings: [{ partOfSpeech, definitions: [{ definition, example }], synonyms, antonyms }],
  isBookmarked: false,
  isLearned: false,
  dateAdded: d,
});

export const FALLBACK_WORDS: Word[] = [
  // ─── EVERYDAY ───────────────────────────────────────────────────────────────
  w('serendipity',   'everyday', 'medium', 'noun',      '/ˌsɛr.ənˈdɪp.ɪ.ti/',  'The occurrence of pleasant events by chance.',                                     'Finding that old letter was pure serendipity.',              ['luck', 'fortune', 'chance'],          ['misfortune', 'design']),
  w('ephemeral',     'everyday', 'medium', 'adjective', '/ɪˈfɛm.ər.əl/',        'Lasting for a very short time.',                                                   'Fame can be ephemeral.',                                     ['fleeting', 'transient', 'brief'],     ['permanent', 'lasting', 'enduring']),
  w('eloquent',      'everyday', 'medium', 'adjective', '/ˈɛl.ə.kwənt/',        'Fluent and persuasive in speaking or writing.',                                    'She gave an eloquent speech that moved the crowd.',          ['articulate', 'expressive', 'fluent'], ['inarticulate', 'mumbling']),
  w('resilient',     'everyday', 'easy',   'adjective', '/rɪˈzɪl.i.ənt/',       'Able to recover quickly from difficult conditions.',                               'Children are often remarkably resilient.',                   ['tough', 'adaptable', 'strong'],       ['fragile', 'weak', 'vulnerable']),
  w('meticulous',    'everyday', 'medium', 'adjective', '/mɪˈtɪk.jʊ.ləs/',      'Showing great attention to detail.',                                               'She was meticulous in her research.',                        ['precise', 'thorough', 'careful'],     ['careless', 'sloppy', 'negligent']),
  w('pragmatic',     'everyday', 'medium', 'adjective', '/præɡˈmæt.ɪk/',        'Dealing with things sensibly and realistically.',                                  'We need a pragmatic approach to solve this.',                ['practical', 'realistic', 'sensible'], ['idealistic', 'impractical']),
  w('empathy',       'everyday', 'easy',   'noun',      '/ˈɛm.pə.θi/',          'The ability to understand and share the feelings of another.',                     'She showed great empathy toward her grieving friend.',        ['compassion', 'understanding'],        ['indifference', 'apathy']),
  w('perseverance',  'everyday', 'easy',   'noun',      '/ˌpɜː.sɪˈvɪər.əns/',   'Persistence in doing something despite difficulty.',                               'Success requires perseverance and dedication.',               ['persistence', 'tenacity', 'resolve'], ['laziness', 'irresolution']),
  w('ambiguous',     'everyday', 'medium', 'adjective', '/æmˈbɪɡ.ju.əs/',       'Open to more than one interpretation.',                                            'The contract contained several ambiguous clauses.',          ['vague', 'unclear', 'uncertain'],      ['clear', 'definite', 'explicit']),
  w('candid',        'everyday', 'easy',   'adjective', '/ˈkæn.dɪd/',           'Truthful and straightforward.',                                                    'I want your candid opinion on this.',                        ['frank', 'honest', 'open'],            ['dishonest', 'evasive', 'guarded']),
  w('diligent',      'everyday', 'easy',   'adjective', '/ˈdɪl.ɪ.dʒənt/',       'Having or showing care and conscientiousness in one\'s work.',                     'She was a diligent student who always completed her work.',   ['hardworking', 'assiduous', 'careful'], ['lazy', 'negligent', 'careless']),
  w('mundane',       'everyday', 'easy',   'adjective', '/mʌnˈdeɪn/',           'Lacking interest or excitement; dull.',                                            'He was tired of his mundane daily routine.',                 ['ordinary', 'routine', 'boring'],      ['extraordinary', 'exciting', 'unusual']),
  w('nostalgic',     'everyday', 'easy',   'adjective', '/nɒˈstæl.dʒɪk/',       'Having a sentimental longing or wistful affection for the past.',                  'Looking at old photos made her feel nostalgic.',             ['wistful', 'sentimental', 'yearning'], ['indifferent', 'forward-looking']),
  w('spontaneous',   'everyday', 'easy',   'adjective', '/spɒnˈteɪ.ni.əs/',     'Performed or occurring without premeditation.',                                    'The spontaneous trip was the best holiday they ever had.',   ['impulsive', 'unplanned', 'natural'],  ['planned', 'deliberate', 'premeditated']),
  w('versatile',     'everyday', 'easy',   'adjective', '/ˈvɜː.sə.taɪl/',       'Able to adapt to many different functions or situations.',                         'A versatile chef who can cook any cuisine.',                 ['adaptable', 'flexible', 'all-around'], ['limited', 'inflexible', 'narrow']),
  w('amiable',       'everyday', 'easy',   'adjective', '/ˈeɪ.mi.ə.bəl/',       'Having a friendly and pleasant manner.',                                           'She was amiable and easy to talk to.',                       ['friendly', 'genial', 'pleasant'],     ['unfriendly', 'hostile', 'disagreeable']),
  w('benevolent',    'everyday', 'medium', 'adjective', '/bɪˈnɛv.ə.lənt/',      'Well-meaning and kindly.',                                                         'The benevolent donor funded the new library.',               ['kind', 'generous', 'charitable'],     ['malevolent', 'unkind', 'selfish']),
  w('integrity',     'everyday', 'easy',   'noun',      '/ɪnˈtɛɡ.rɪ.ti/',       'The quality of being honest and having strong moral principles.',                  'His integrity made him the most trusted person in the office.', ['honesty', 'virtue', 'principle'],  ['dishonesty', 'corruption', 'deceit']),
  w('genuine',       'everyday', 'easy',   'adjective', '/ˈdʒɛn.ju.ɪn/',        'Truly what something is said to be; authentic.',                                   'That was a genuine Picasso painting.',                       ['authentic', 'real', 'true'],          ['fake', 'false', 'counterfeit']),
  w('compassionate', 'everyday', 'easy',   'adjective', '/kəmˈpæʃ.ən.ɪt/',      'Feeling or showing sympathy and concern for others.',                              'A compassionate nurse who cared deeply for her patients.',   ['sympathetic', 'caring', 'empathetic'], ['indifferent', 'heartless', 'cold']),

  // ─── ACADEMIC ───────────────────────────────────────────────────────────────
  w('analysis',      'academic', 'easy',   'noun',      '/əˈnæl.ɪ.sɪs/',        'Detailed examination of the elements or structure of something.',                  'The analysis revealed several important trends.',             ['examination', 'study', 'assessment'], ['synthesis', 'overview']),
  w('hypothesis',    'academic', 'medium', 'noun',      '/haɪˈpɒθ.ɪ.sɪs/',      'A proposed explanation made on the basis of limited evidence.',                    'The scientist tested her hypothesis in the lab.',            ['theory', 'proposition', 'conjecture'], ['fact', 'certainty', 'proof']),
  w('synthesis',     'academic', 'medium', 'noun',      '/ˈsɪn.θɪ.sɪs/',        'The combination of components to form a connected whole.',                         'The essay required synthesis of multiple sources.',          ['combination', 'integration', 'blend'], ['analysis', 'separation']),
  w('paradigm',      'academic', 'hard',   'noun',      '/ˈpær.ə.daɪm/',         'A typical example or pattern; a framework of assumptions.',                       'The discovery caused a paradigm shift in biology.',          ['model', 'framework', 'pattern'],      ['anomaly', 'exception']),
  w('empirical',     'academic', 'medium', 'adjective', '/ɛmˈpɪr.ɪ.kəl/',       'Based on observation or experience rather than theory.',                           'We need empirical evidence to support the claim.',           ['observed', 'experiential', 'factual'], ['theoretical', 'speculative']),
  w('inference',     'academic', 'medium', 'noun',      '/ˈɪn.fər.əns/',         'A conclusion reached on the basis of evidence and reasoning.',                     'From the data we can draw the inference that sales are rising.', ['deduction', 'conclusion', 'reasoning'], ['assumption', 'conjecture']),
  w('objective',     'academic', 'easy',   'adjective', '/əbˈdʒɛk.tɪv/',        'Not influenced by personal feelings or opinions.',                                 'Try to give an objective assessment of the situation.',      ['impartial', 'unbiased', 'neutral'],   ['subjective', 'biased', 'partial']),
  w('subjective',    'academic', 'easy',   'adjective', '/səbˈdʒɛk.tɪv/',       'Based on or influenced by personal feelings or opinions.',                         'Beauty is subjective and means different things to everyone.', ['personal', 'individual', 'biased'],  ['objective', 'impartial', 'neutral']),
  w('coherent',      'academic', 'easy',   'adjective', '/kəʊˈhɪər.ənt/',       'Logical and consistent.',                                                          'Please present a coherent argument.',                        ['logical', 'consistent', 'clear'],     ['incoherent', 'illogical', 'confused']),
  w('concise',       'academic', 'easy',   'adjective', '/kənˈsaɪs/',           'Giving a lot of information clearly and in a few words.',                           'Keep your answer concise and to the point.',                 ['brief', 'succinct', 'terse'],         ['verbose', 'wordy', 'lengthy']),
  w('critique',      'academic', 'medium', 'noun',      '/krɪˈtiːk/',           'A detailed analysis and assessment of something.',                                  'The professor wrote a thorough critique of the essay.',      ['review', 'analysis', 'evaluation'],   ['praise', 'endorsement']),
  w('explicit',      'academic', 'medium', 'adjective', '/ɪkˈsplɪs.ɪt/',       'Stated clearly and in detail, leaving no room for confusion.',                      'The instructions were explicit and easy to follow.',         ['clear', 'direct', 'specific'],        ['implicit', 'vague', 'ambiguous']),
  w('implicit',      'academic', 'medium', 'adjective', '/ɪmˈplɪs.ɪt/',        'Suggested though not directly expressed.',                                          'There was an implicit threat in his words.',                 ['implied', 'indirect', 'understood'],  ['explicit', 'direct', 'stated']),
  w('abstract',      'academic', 'medium', 'adjective', '/ˈæb.strækt/',         'Existing in thought or as an idea but not having a physical existence.',            'Love is an abstract concept that is hard to define.',        ['theoretical', 'conceptual', 'notional'], ['concrete', 'tangible', 'physical']),
  w('methodology',   'academic', 'medium', 'noun',      '/ˌmɛθ.əˈdɒl.ə.dʒi/',  'A system of methods used in a particular area of study.',                          'The research methodology was clearly explained in the paper.', ['approach', 'procedure', 'system'],   ['result', 'finding']),

  // ─── BUSINESS ───────────────────────────────────────────────────────────────
  w('entrepreneur',  'business', 'easy',   'noun',      '/ˌɒn.trə.prəˈnɜː/',    'A person who organizes and operates a business, taking on financial risk.',         'She became an entrepreneur at twenty-five.',                 ['founder', 'businessperson', 'innovator'], ['employee', 'worker']),
  w('leverage',      'business', 'medium', 'noun',      '/ˈliː.vər.ɪdʒ/',       'The power to influence a situation or person.',                                     'Use your leverage in the negotiation to get a better deal.',  ['influence', 'power', 'advantage'],    ['weakness', 'disadvantage']),
  w('revenue',       'business', 'easy',   'noun',      '/ˈrɛv.ɪ.njuː/',        'Income generated from normal business operations.',                                  'The company\'s revenue grew by twenty percent this year.',   ['income', 'earnings', 'receipts'],     ['expenditure', 'cost', 'loss']),
  w('innovation',    'business', 'easy',   'noun',      '/ˌɪn.əˈveɪ.ʃən/',      'A new method, idea, product, or process.',                                          'Innovation drives growth in competitive markets.',           ['invention', 'novelty', 'breakthrough'], ['tradition', 'convention']),
  w('scalable',      'business', 'medium', 'adjective', '/ˈskeɪ.lə.bəl/',       'Able to be changed in size or scale to suit different conditions.',                  'We need a scalable solution that can grow with the company.', ['expandable', 'flexible', 'adaptable'], ['fixed', 'rigid', 'limited']),
  w('stakeholder',   'business', 'medium', 'noun',      '/ˈsteɪkˌhəʊl.dər/',    'A person or group with an interest in an organization or project.',                  'All stakeholders were invited to the annual meeting.',        ['investor', 'shareholder', 'partner'], ['outsider', 'bystander']),
  w('synergy',       'business', 'medium', 'noun',      '/ˈsɪn.ə.dʒi/',         'The combined effect that is greater than the sum of individual effects.',            'The merger created synergy between the two companies.',      ['collaboration', 'cooperation'],       ['conflict', 'competition']),
  w('acquisition',   'business', 'medium', 'noun',      '/ˌæk.wɪˈzɪʃ.ən/',      'The buying of one company by another.',                                             'The acquisition doubled the firm\'s market share.',          ['purchase', 'buyout', 'takeover'],     ['sale', 'divestiture']),
  w('liability',     'business', 'medium', 'noun',      '/ˌlaɪ.əˈbɪl.ɪ.ti/',    'Something for which a person or organization is legally responsible.',               'The company\'s liabilities exceeded its assets.',            ['debt', 'obligation', 'responsibility'], ['asset', 'advantage']),
  w('negotiation',   'business', 'easy',   'noun',      '/nɪˌɡəʊ.ʃiˈeɪ.ʃən/', 'Discussion aimed at reaching an agreement.',                                         'The negotiation lasted three days before a deal was reached.', ['discussion', 'bargaining', 'mediation'], ['ultimatum', 'demand']),
  w('productivity',  'business', 'easy',   'noun',      '/ˌprɒd.ʌkˈtɪv.ɪ.ti/', 'The effectiveness of productive effort.',                                            'Remote work increased the team\'s productivity.',            ['efficiency', 'output', 'performance'], ['laziness', 'inefficiency']),
  w('portfolio',     'business', 'medium', 'noun',      '/pɔːtˈfəʊ.li.əʊ/',    'A range of investments or products held by a person or organization.',               'The fund manager balanced his portfolio carefully.',          ['collection', 'holdings', 'investments'], []),
  w('benchmark',     'business', 'medium', 'noun',      '/ˈbɛntʃ.mɑːk/',        'A standard or point of reference against which things may be compared.',             'Set clear benchmarks before starting the project.',          ['standard', 'measure', 'yardstick'],   []),
  w('dividend',      'business', 'medium', 'noun',      '/ˈdɪv.ɪ.dɛnd/',        'A sum of money paid to shareholders from a company\'s profits.',                     'The company paid a generous dividend this quarter.',          ['payout', 'return', 'yield'],          []),
  w('strategic',     'business', 'easy',   'adjective', '/strəˈtiː.dʒɪk/',      'Relating to long-term goals or overall plans.',                                     'They made a strategic decision to enter the Asian market.',  ['planned', 'calculated', 'deliberate'], ['impulsive', 'reactive', 'tactical']),

  // ─── LITERATURE ─────────────────────────────────────────────────────────────
  w('allegory',      'literature', 'medium', 'noun',    '/ˈæl.ɪ.ɡər.i/',        'A story in which characters and events represent abstract ideas or moral qualities.', 'Animal Farm is a famous allegory about political power.',   ['parable', 'fable', 'symbol'],         []),
  w('metaphor',      'literature', 'easy',   'noun',    '/ˈmɛt.ə.fɔːr/',        'A figure of speech that applies a concept to an object or action it cannot literally denote.', 'Life is a journey is a common metaphor.',       ['analogy', 'comparison', 'symbol'],    ['literal', 'fact']),
  w('protagonist',   'literature', 'easy',   'noun',    '/prəˈtæɡ.ə.nɪst/',     'The leading character or one of the major characters in a story.',                   'Harry Potter is the protagonist of the series.',             ['hero', 'lead', 'main character'],     ['antagonist', 'villain']),
  w('narrative',     'literature', 'easy',   'noun',    '/ˈnær.ə.tɪv/',         'A spoken or written account of connected events.',                                   'The narrative kept readers engaged from start to finish.',   ['story', 'account', 'tale'],           []),
  w('soliloquy',     'literature', 'hard',   'noun',    '/səˈlɪl.ə.kwi/',       'An act of speaking one\'s thoughts aloud when alone, especially in a play.',          'Hamlet\'s soliloquy is one of the most famous in theatre.',  ['monologue', 'aside', 'speech'],       ['dialogue', 'conversation']),
  w('irony',         'literature', 'easy',   'noun',    '/ˈaɪ.rə.ni/',          'The expression of meaning using language that normally signifies the opposite.',      'It was ironic that the fire station burned down.',           ['sarcasm', 'paradox', 'wit'],          ['sincerity', 'literal']),
  w('catharsis',     'literature', 'hard',   'noun',    '/kəˈθɑː.sɪs/',         'The process of releasing strong emotions through art.',                              'The tragic ending provided catharsis for the audience.',     ['purging', 'release', 'cleansing'],    []),
  w('poignant',      'literature', 'medium', 'adjective', '/ˈpɔɪ.njənt/',       'Evoking a keen sense of sadness or regret.',                                         'The film ended on a poignant note.',                         ['moving', 'touching', 'emotional'],    ['unemotional', 'indifferent']),
  w('foreshadowing', 'literature', 'medium', 'noun',    '/fɔːˈʃæd.əʊ.ɪŋ/',     'A warning or indication of a future event in a narrative.',                          'The dark clouds were a foreshadowing of the tragedy ahead.', ['hint', 'omen', 'portent'],            []),
  w('motif',         'literature', 'medium', 'noun',    '/məʊˈtiːf/',           'A recurring image, symbol, or theme in a work of literature.',                       'The motif of water appears throughout the novel.',           ['theme', 'pattern', 'symbol'],         []),
  w('paradox',       'literature', 'medium', 'noun',    '/ˈpær.ə.dɒks/',        'A statement that contradicts itself but may nonetheless be true.',                   '"Less is more" is a famous paradox.',                        ['contradiction', 'irony', 'anomaly'],  ['consistency', 'certainty']),
  w('rhetoric',      'literature', 'medium', 'noun',    '/ˈrɛt.ər.ɪk/',         'The art of effective or persuasive speaking or writing.',                            'His speech was filled with powerful rhetoric.',              ['oratory', 'eloquence', 'persuasion'], []),
  w('satire',        'literature', 'medium', 'noun',    '/ˈsæt.aɪər/',          'The use of humor, irony, or exaggeration to criticize people or ideas.',              'Swift\'s Gulliver\'s Travels is a brilliant satire.',        ['parody', 'lampoon', 'mockery'],       ['sincerity', 'praise']),
  w('ambivalence',   'literature', 'hard',   'noun',    '/æmˈbɪv.ə.ləns/',      'The state of having mixed feelings or contradictory ideas about something.',          'The character\'s ambivalence about leaving was clear.',      ['uncertainty', 'indecision', 'conflict'], ['certainty', 'decisiveness']),
  w('prolific',      'literature', 'medium', 'adjective', '/prəˈlɪf.ɪk/',       'Producing many works, results, or offspring.',                                        'Shakespeare was a prolific writer throughout his life.',     ['productive', 'fertile', 'creative'],  ['unproductive', 'barren']),

  // ─── SCIENCE ────────────────────────────────────────────────────────────────
  w('catalyst',      'science', 'medium', 'noun',       '/ˈkæt.ə.lɪst/',        'A substance that increases the rate of a chemical reaction without being consumed.',  'Enzymes act as catalysts in biological reactions.',          ['accelerator', 'agent', 'trigger'],    ['inhibitor', 'suppressant']),
  w('equilibrium',   'science', 'medium', 'noun',       '/ˌiː.kwɪˈlɪb.ri.əm/', 'A state in which opposing forces or influences are balanced.',                        'The system reached a state of equilibrium.',                 ['balance', 'stability', 'parity'],     ['imbalance', 'instability']),
  w('osmosis',       'science', 'medium', 'noun',       '/ɒzˈməʊ.sɪs/',         'The process by which molecules pass through a membrane from a dilute to a concentrated solution.', 'Water enters plant roots via osmosis.',         ['diffusion', 'absorption'],            []),
  w('photosynthesis','science', 'easy',   'noun',       '/ˌfəʊ.təˈsɪn.θɪ.sɪs/', 'The process by which plants convert sunlight into food.',                            'Without photosynthesis, there would be no oxygen on Earth.', ['carbon fixation'],                    []),
  w('momentum',      'science', 'easy',   'noun',       '/məˈmɛn.təm/',          'The quantity of motion of a moving body, equal to mass times velocity.',              'The rolling ball gained momentum as it went downhill.',      ['force', 'impetus', 'drive'],          ['inertia', 'stillness']),
  w('entropy',       'science', 'hard',   'noun',       '/ˈɛn.trə.pi/',          'A measure of the disorder or randomness in a closed system.',                         'Entropy increases over time in an isolated system.',         ['disorder', 'chaos', 'randomness'],    ['order', 'structure']),
  w('phenomenon',    'science', 'medium', 'noun',       '/fɪˈnɒm.ɪ.nɒn/',       'A fact or situation that is observed to exist or happen.',                            'The Northern Lights are a stunning natural phenomenon.',     ['occurrence', 'event', 'fact'],        []),
  w('symbiosis',     'science', 'medium', 'noun',       '/ˌsɪm.baɪˈəʊ.sɪs/',    'Interaction between two organisms living in close physical association.',              'Bees and flowers have a symbiotic relationship.',            ['mutualism', 'cooperation'],           ['parasitism', 'competition']),
  w('velocity',      'science', 'easy',   'noun',       '/vɪˈlɒs.ɪ.ti/',        'The speed of something in a given direction.',                                        'The velocity of light is approximately 300,000 km per second.', ['speed', 'rate', 'pace'],            ['stillness', 'rest']),
  w('mutation',      'science', 'medium', 'noun',       '/mjuːˈteɪ.ʃən/',        'A change in the genetic material of a cell.',                                         'Some mutations can lead to new traits in a species.',        ['change', 'alteration', 'variation'],  []),

  // ─── TECHNOLOGY ─────────────────────────────────────────────────────────────
  w('algorithm',     'technology', 'medium', 'noun',    '/ˈæl.ɡə.rɪ.ðəm/',     'A process or set of rules followed in calculations or problem-solving.',               'The search algorithm returns results in milliseconds.',      ['procedure', 'process', 'formula'],    []),
  w('encryption',    'technology', 'medium', 'noun',    '/ɪnˈkrɪp.ʃən/',        'The process of converting data to prevent unauthorized access.',                       'End-to-end encryption keeps your messages private.',         ['encoding', 'ciphering', 'scrambling'], ['decryption', 'decoding']),
  w('bandwidth',     'technology', 'easy',   'noun',    '/ˈbænd.wɪdθ/',         'The maximum rate of data transfer across a given network path.',                       'Streaming HD video requires a lot of bandwidth.',            ['capacity', 'throughput', 'speed'],    []),
  w('interface',     'technology', 'easy',   'noun',    '/ˈɪn.tə.feɪs/',        'A point where two systems or subjects meet and interact.',                             'The user interface was intuitive and easy to navigate.',     ['connection', 'interaction', 'bridge'], []),
  w('iteration',     'technology', 'medium', 'noun',    '/ˌɪt.əˈreɪ.ʃən/',      'The repetition of a process to generate a sequence of outcomes.',                      'Each iteration of the software fixed more bugs.',            ['repetition', 'cycle', 'loop'],        []),
  w('protocol',      'technology', 'medium', 'noun',    '/ˈprəʊ.tə.kɒl/',       'A set of rules governing the exchange of data between devices.',                       'HTTP is the protocol used to transfer data on the web.',     ['standard', 'specification', 'format'], []),
  w('repository',    'technology', 'medium', 'noun',    '/rɪˈpɒz.ɪ.tər.i/',     'A place where code or data is stored and managed.',                                    'Push your changes to the repository before the deadline.',   ['storage', 'archive', 'database'],     []),
  w('syntax',        'technology', 'easy',   'noun',    '/ˈsɪn.tæks/',           'The rules that define the combinations of symbols in a programming language.',         'A syntax error caused the program to crash.',                ['grammar', 'structure', 'format'],     ['semantics']),
  w('debugging',     'technology', 'easy',   'noun',    '/diːˈbʌɡ.ɪŋ/',         'The process of identifying and removing errors from software.',                         'Debugging took longer than writing the original code.',      ['testing', 'fixing', 'troubleshooting'], []),
  w('latency',       'technology', 'medium', 'noun',    '/ˈleɪ.tən.si/',         'The delay before a transfer of data begins following an instruction.',                  'High latency makes online gaming frustrating.',              ['delay', 'lag', 'response time'],      ['speed', 'throughput']),

  // ─── ARTS ───────────────────────────────────────────────────────────────────
  w('aesthetic',     'arts', 'medium', 'adjective',    '/iːsˈθɛt.ɪk/',          'Concerned with beauty or the appreciation of beauty.',                                 'The architect had a distinctive aesthetic style.',           ['artistic', 'beautiful', 'tasteful'],  ['ugly', 'unattractive']),
  w('composition',   'arts', 'easy',   'noun',         '/ˌkɒm.pəˈzɪʃ.ən/',      'The way in which a whole or mixture is made up.',                                       'The composition of the painting drew the eye to the center.', ['arrangement', 'structure', 'design'], ['disorder', 'chaos']),
  w('perspective',   'arts', 'easy',   'noun',         '/pəˈspɛk.tɪv/',          'A particular attitude toward something; a point of view.',                             'The artist captured the scene from an unusual perspective.', ['viewpoint', 'standpoint', 'angle'],   []),
  w('texture',       'arts', 'easy',   'noun',         '/ˈtɛks.tʃər/',           'The feel, appearance, or consistency of a surface or substance.',                       'The painting has a rich texture achieved with thick paint.', ['surface', 'feel', 'grain'],           ['smoothness', 'flatness']),
  w('contrast',      'arts', 'easy',   'noun',         '/ˈkɒn.trɑːst/',          'The state of being strikingly different from something else.',                          'The stark contrast between light and shadow gave depth.',    ['difference', 'opposition', 'distinction'], ['similarity', 'uniformity']),
  w('harmony',       'arts', 'easy',   'noun',         '/ˈhɑː.mə.ni/',           'The combination of simultaneously sounded musical notes to produce a pleasing effect.', 'The choir sang in perfect harmony.',                         ['accord', 'consonance', 'balance'],    ['discord', 'dissonance', 'conflict']),
  w('rhythm',        'arts', 'easy',   'noun',         '/ˈrɪð.əm/',              'A strong, regular repeated pattern of movement or sound.',                              'The drummer kept a steady rhythm throughout the song.',      ['beat', 'tempo', 'cadence'],           ['arrhythmia', 'disorder']),
  w('symbolism',     'arts', 'medium', 'noun',         '/ˈsɪm.bəl.ɪ.zəm/',      'The use of symbols to represent ideas or qualities.',                                    'The dove is often used as symbolism for peace.',            ['representation', 'imagery', 'allegory'], []),
  w('improvisation', 'arts', 'medium', 'noun',         '/ɪmˌprɒv.ɪˈzeɪ.ʃən/', 'Creating or performing spontaneously without preparation.',                               'The jazz musician was known for his brilliant improvisation.', ['spontaneity', 'invention'],          ['rehearsal', 'preparation']),
  w('motif',         'arts', 'medium', 'noun',         '/məʊˈtiːf/',             'A decorative design or pattern used in music, art, or literature.',                     'The floral motif appears throughout the tapestry.',          ['design', 'pattern', 'theme'],         []),

  // ─── HISTORY ────────────────────────────────────────────────────────────────
  w('civilization',  'history', 'easy',   'noun',      '/ˌsɪv.ɪ.laɪˈzeɪ.ʃən/', 'The stage of human social and cultural development and organization.',                  'Ancient Egypt was one of the earliest civilizations.',       ['culture', 'society', 'culture'],      ['barbarism', 'savagery']),
  w('revolution',    'history', 'easy',   'noun',      '/ˌrɛv.əˈluː.ʃən/',      'A dramatic and far-reaching change in conditions, attitudes, or operation.',            'The Industrial Revolution transformed the economy.',         ['uprising', 'transformation', 'change'], ['status quo', 'stability']),
  w('ideology',      'history', 'medium', 'noun',      '/ˌaɪ.diˈɒl.ə.dʒi/',     'A system of ideas and ideals forming the basis of a policy.',                           'Communism and capitalism are opposing ideologies.',          ['doctrine', 'belief system', 'philosophy'], []),
  w('sovereignty',   'history', 'medium', 'noun',      '/ˈsɒv.rɪn.ti/',         'Supreme power or authority, especially of a state.',                                    'The country declared its sovereignty after independence.',   ['authority', 'supremacy', 'dominion'], ['subjugation', 'dependence']),
  w('diplomacy',     'history', 'medium', 'noun',      '/dɪˈpləʊ.mə.si/',       'The profession or skill of managing international relations.',                           'Successful diplomacy prevented the war from escalating.',   ['negotiation', 'tact', 'statecraft'],  ['aggression', 'hostility']),
  w('imperialism',   'history', 'medium', 'noun',      '/ɪmˈpɪər.i.ə.lɪ.zəm/', 'The policy of extending a country\'s power through territorial gain.',                   'European imperialism shaped the modern world.',              ['colonialism', 'expansionism'],        ['decolonization', 'independence']),
  w('propaganda',    'history', 'medium', 'noun',      '/ˌprɒp.əˈɡæn.də/',      'Information used to promote a particular political cause or point of view.',             'Wartime propaganda influenced public opinion greatly.',      ['misinformation', 'indoctrination'],   ['truth', 'fact']),
  w('democracy',     'history', 'easy',   'noun',      '/dɪˈmɒk.rə.si/',        'A system of government by the whole population through elected representatives.',        'The country transitioned to democracy after years of rule.',  ['republic', 'self-governance'],        ['autocracy', 'dictatorship', 'tyranny']),
  w('aristocracy',   'history', 'medium', 'noun',      '/ˌær.ɪˈstɒk.rə.si/',   'Government by a privileged class; the highest class in certain societies.',              'The aristocracy held most of the land in medieval England.', ['nobility', 'elite', 'ruling class'],  ['democracy', 'egalitarianism']),
  w('reformation',   'history', 'medium', 'noun',      '/ˌrɛf.əˈmeɪ.ʃən/',     'The action or process of reforming an institution or practice.',                         'The Protestant Reformation changed the religious landscape.', ['reform', 'change', 'transformation'], ['stagnation', 'conservatism']),
];

const FALLBACK_MAP = new Map<string, Word>(
  FALLBACK_WORDS.map(word => [word.word.toLowerCase(), word])
);

export function getFallbackWord(
  word: string,
  category?: Word['category'],
  difficulty?: Word['difficulty'],
): Word | null {
  const match = FALLBACK_MAP.get(word.toLowerCase());
  if (!match) return null;
  return {
    ...match,
    ...(category && { category, id: `${match.word}-${category}` }),
    ...(difficulty && { difficulty }),
  };
}
