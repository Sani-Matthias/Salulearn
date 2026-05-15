// First Aid lesson content for SaluLearn

export type LessonStep =
  | { type: 'intro'; emoji: string; title: string; subtitle: string }
  | { type: 'text'; emoji?: string; title: string; content: string; style?: 'default' | 'info' | 'warning' }
  | { type: 'multiple-choice'; question: string; options: string[]; correctIndex: number; explanation: string }
  | { type: 'true-false'; statement: string; correct: boolean; explanation: string }
  | { type: 'ordering'; question: string; items: string[]; correctOrder: number[]; explanation: string }
  | { type: 'complete'; xpEarned: number }

export type Lesson = {
  id: string
  title: string
  subtitle: string
  emoji: string
  color: string
  xpReward: number
  estimatedMin: number
  steps: LessonStep[]
}

export type Module = {
  id: string
  title: string
  description: string
  color: string
  colorDark: string
  emoji: string
  lessons: Lesson[]
}

// ─────────────────────────────────────────
// MODULE 1 – Notfall-Grundlagen
// ─────────────────────────────────────────
const module1: Module = {
  id: 'mod1',
  title: 'Notfall-Grundlagen',
  description: 'Erste Schritte im Notfall',
  color: '#FF4B4B',
  colorDark: '#CC3333',
  emoji: '🚨',
  lessons: [
    {
      id: 'l1',
      title: 'Der Notruf',
      subtitle: '112 – Die Lebensretter-Nummer',
      emoji: '📞',
      color: '#FF4B4B',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '📞', title: 'Der Notruf', subtitle: 'Lerne, wie du im Notfall richtig Hilfe rufst und Leben rettest' },
        { type: 'text', emoji: '⛓️', title: 'Die österreichische Rettungskette', content: '1. Erkennen – Notfall feststellen\n2. Notruf absetzen (144 / 112)\n3. Erste Hilfe leisten\n4. Rettungsdienst übernimmt\n\nJedes Glied der Kette ist entscheidend – du als Ersthelfer bist das erste und wichtigste Glied!', style: 'info' },
        { type: 'text', emoji: '🇦🇹', title: 'Die Notrufnummern in Österreich', content: '144 – Rettung & Notarzt\n122 – Feuerwehr\n133 – Polizei\n112 – Europäischer Notruf (gilt überall!)\n\nAlle Nummern sind kostenlos, 24 Stunden am Tag erreichbar. In Österreich ist 144 die wichtigste Nummer für medizinische Notfälle!', style: 'info' },
        { type: 'multiple-choice', question: 'Welche Notrufnummer rufst du in Österreich bei einem medizinischen Notfall?', options: ['133', '122', '144', '911'], correctIndex: 2, explanation: '144 ist die österreichische Notrufnummer für Rettung und Notarzt. Die 112 funktioniert in Österreich ebenfalls – sie leitet direkt zur 144 weiter.' },
        { type: 'text', emoji: '❓', title: 'Die 5 W-Fragen', content: '✅ WER ruft an?\n✅ WO ist der Notfall?\n✅ WAS ist passiert?\n✅ WIE VIELE Personen sind betroffen?\n✅ WARTEN auf Rückfragen!\n\nMerke dir: Lege nie zuerst auf!', style: 'warning' },
        { type: 'multiple-choice', question: 'Was ist KEIN "W" der 5 W-Fragen beim Notruf?', options: ['Wer ruft an?', 'Wo ist der Notfall?', 'Warum ist er allein?', 'Wie viele Verletzte?'], correctIndex: 2, explanation: '"Warum" gehört nicht zu den 5 Ws. Die 5 Ws sind: Wer, Wo, Was, Wie viele, Warten.' },
        { type: 'true-false', statement: 'Beim Notruf sollst du immer warten, bis die Leitstelle das Gespräch beendet.', correct: true, explanation: 'Richtig! Die Leitstelle kann dir noch wichtige Anweisungen geben – lege nie zuerst auf!' },
        { type: 'multiple-choice', question: 'Was gibst du beim Notruf als erstes an?', options: ['Deine Telefonnummer', 'Den genauen Unfallort', 'Dein Alter', 'Die Uhrzeit'], correctIndex: 1, explanation: 'Der Unfallort ist das Wichtigste – damit können Sanitäter sofort starten. Ohne Ort keine Hilfe!' },
        { type: 'multiple-choice', question: 'Welche Notrufnummer ist in Österreich für die Feuerwehr zuständig?', options: ['144', '133', '122', '112'], correctIndex: 2, explanation: '122 ist die Feuerwehr-Nummer in Österreich. 144 = Rettung, 133 = Polizei, 112 = Europäischer Notruf.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l2',
      title: 'Unfallstelle sichern',
      subtitle: 'Eigenschutz & Absicherung',
      emoji: '⚠️',
      color: '#FF9600',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '⚠️', title: 'Unfallstelle sichern', subtitle: 'Deine Sicherheit kommt zuerst – nur so kannst du wirklich helfen' },
        { type: 'text', emoji: '🦺', title: 'Eigenschutz geht vor!', content: 'Bevor du hilfst, muss die Unfallstelle sicher sein.\n\nBei einem Autounfall in Österreich:\n1. Warnblinker einschalten\n2. Warnweste anlegen (in Österreich Pflicht im Auto!)\n3. Warndreieck aufstellen\n4. Rettungsgasse bilden (auf mehrspurigen Straßen)\n5. Dann erst helfen!\n\nDie Rettungsgasse ist in Österreich gesetzlich vorgeschrieben!', style: 'warning' },
        { type: 'multiple-choice', question: 'Was ist das Erste, was du bei einem Verkehrsunfall tust?', options: ['Sofort zum Verletzten rennen', 'Fotos machen', 'Sich selbst sichern und Unfallstelle absichern', 'Auf die Polizei warten'], correctIndex: 2, explanation: 'Eigenschutz ist das Wichtigste! Nur wer selbst sicher ist, kann anderen helfen.' },
        { type: 'multiple-choice', question: 'Wie weit vor dem Unfallort stellst du auf der Autobahn das Warndreieck auf?', options: ['15 Meter', '25 Meter', '50 Meter', '100 Meter'], correctIndex: 3, explanation: 'Auf der Autobahn mindestens 100 m Abstand. Auf Freilandstraßen 50–100 m, innerorts mindestens 50 m.' },
        { type: 'true-false', statement: 'Eine Warnweste musst du nur nachts tragen.', correct: false, explanation: 'Falsch! Die Warnweste ist bei JEDEM Unfall zu tragen – egal ob Tag oder Nacht!' },
        { type: 'multiple-choice', question: 'Warum parkst du dein Auto hinter dem Warndreieck, nicht direkt hinter dem Unfall?', options: ['Es sieht ordentlicher aus', 'Damit du besser sehen kannst', 'Um einen Pufferschutz für die Verletzten zu schaffen', 'Das ist egal'], correctIndex: 2, explanation: 'Dein Fahrzeug bildet einen Schutzpuffer zwischen fließendem Verkehr und der Unfallstelle.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l3',
      title: 'Bewusstsein prüfen',
      subtitle: 'Ist die Person ansprechbar?',
      emoji: '🤔',
      color: '#CE82FF',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🤔', title: 'Bewusstsein prüfen', subtitle: 'So erkennst du, ob jemand ansprechbar ist und was als nächstes zu tun ist' },
        { type: 'text', emoji: '👋', title: 'Ansprechen & Berühren', content: 'Geh sicher zur Person und prüfe:\n\n1. Laut ansprechen: „Hallo! Können Sie mich hören?"\n2. Schultern sanft schütteln\n3. Keine Reaktion → Person ist bewusstlos → Notruf 112!', style: 'info' },
        { type: 'multiple-choice', question: 'Wie prüfst du, ob jemand noch bei Bewusstsein ist?', options: ['Ins Ohr schreien und Arme schütteln', 'Laut ansprechen und Schultern sanft schütteln', 'Kaltes Wasser ins Gesicht', 'Puls messen'], correctIndex: 1, explanation: 'Laut ansprechen + Schultern schütteln ist korrekt. Kein heftiges Schütteln – das kann Verletzungen verschlimmern!' },
        { type: 'text', emoji: '🔤', title: 'Das DRÄB-Schema (Österreich)', content: '🅳 – DANGER (Gefahr beseitigen)\n🆁 – RESPONSE (Reaktion prüfen)\n🅰 – AIRWAY (Atemwege öffnen)\n🅱 – BREATHING (Atmung prüfen)\n\nDieses Schema entspricht den ERC-Richtlinien und wird in Österreich in der Ersthelfer-Ausbildung (Rotes Kreuz, ÖJRK) verwendet!', style: 'default' },
        { type: 'multiple-choice', question: 'Was bedeutet das "A" in DRÄB?', options: ['Alarmstufe Rot', 'Atemwege öffnen und prüfen', 'Arzt holen', 'Aufwachen'], correctIndex: 1, explanation: 'A = AIRWAY – Atemwege freimachen. Kopf überstrecken, Kinn anheben, damit die Luft durchkommt.' },
        { type: 'true-false', statement: 'Wenn jemand auf Ansprechen nicht reagiert, ist das sofort ein Notfall.', correct: true, explanation: 'Richtig! Keine Reaktion = Bewusstlosigkeit = Notruf 112 sofort absetzen!' },
        { type: 'ordering', question: 'Bringe die DRÄB-Schritte in die richtige Reihenfolge:', items: ['Atemwege öffnen (Kopf überstrecken)', 'Gefahr beseitigen', 'Reaktion prüfen (ansprechen, schütteln)', 'Atmung prüfen (schauen, hören, fühlen)'], correctOrder: [1, 2, 0, 3], explanation: 'DRÄB: Erst Gefahr → Reaktion → Atemwege → Atmung. Reihenfolge ist entscheidend!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 2 – Herzstillstand & CPR
// ─────────────────────────────────────────
const module2: Module = {
  id: 'mod2',
  title: 'Herzstillstand & CPR',
  description: 'Reanimation kann Leben retten',
  color: '#FF6B35',
  colorDark: '#CC4411',
  emoji: '❤️',
  lessons: [
    {
      id: 'l4',
      title: 'Herzstillstand erkennen',
      subtitle: 'Schnell handeln, Leben retten',
      emoji: '💔',
      color: '#FF6B35',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '💔', title: 'Herzstillstand erkennen', subtitle: 'Jede Minute zählt – lerne die Zeichen eines Herzstillstands zu erkennen' },
        { type: 'text', emoji: '🚨', title: 'Was ist ein Herzstillstand?', content: 'Ein Herzstillstand tritt auf, wenn das Herz aufhört zu pumpen. Das Gehirn bekommt keinen Sauerstoff mehr.\n\nNach nur 4-6 Minuten beginnen irreversible Hirnschäden!\n\nDeshalb: Sofort handeln!', style: 'warning' },
        { type: 'multiple-choice', question: 'Welches Zeichen deutet NICHT auf einen Herzstillstand hin?', options: ['Person ist bewusstlos', 'Keine normale Atmung', 'Person führt ein Gespräch', 'Keine Reaktion auf Ansprache'], correctIndex: 2, explanation: 'Wenn jemand ein Gespräch führt, ist kein Herzstillstand vorhanden. Zeichen: Bewusstlosigkeit, keine Atmung, keine Reaktion.' },
        { type: 'text', emoji: '⚠️', title: 'Achtung: Schnappatmung!', content: 'Schnappatmung = unregelmäßige, keuchende oder röchelnde Atemzüge.\n\nDas ist KEINE normale Atmung!\n\nWenn du Schnappatmung siehst → Herzstillstand → Sofort CPR beginnen!', style: 'warning' },
        { type: 'true-false', statement: 'Schnappatmung ist eine normale Form der Atmung und kein Notfallzeichen.', correct: false, explanation: 'Falsch! Schnappatmung ist ein Zeichen des Herzstillstands. Sofort mit CPR beginnen und 112 anrufen!' },
        { type: 'multiple-choice', question: 'Was machst du als Erstes bei einer bewusstlosen Person ohne Atmung?', options: ['Ruhig abwarten und beobachten', '112 anrufen und sofort CPR beginnen', 'Essen und Trinken geben', 'Auf die Seite drehen'], correctIndex: 1, explanation: '112 anrufen (oder jemanden schicken) und sofort CPR starten. Jede Sekunde zählt!' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l5',
      title: 'Herzdruckmassage',
      subtitle: 'Du kannst ein Leben retten',
      emoji: '🫀',
      color: '#E8325A',
      xpReward: 30,
      estimatedMin: 4,
      steps: [
        { type: 'intro', emoji: '🫀', title: 'Herzdruckmassage', subtitle: 'Die wichtigste Erste-Hilfe-Maßnahme – einfacher als du denkst!' },
        { type: 'text', emoji: '✋', title: 'Handposition & Technik', content: 'So geht die Herzdruckmassage:\n\n1. Person auf harten Untergrund legen\n2. Handballen auf die MITTE des Brustkorbs\n3. Zweite Hand darüber legen, Finger verschränken\n4. Arme GESTRECKT halten\n5. 5-6 cm tief drücken\n6. Vollständig entlasten zwischen Drücken', style: 'info' },
        { type: 'multiple-choice', question: 'Wie tief muss die Herzdruckmassage mindestens sein?', options: ['2-3 cm', '3-4 cm', '5-6 cm', '8-10 cm'], correctIndex: 2, explanation: 'Mindestens 5 cm, maximal 6 cm bei Erwachsenen. Zu flach = unwirksam, zu tief = Verletzungsgefahr.' },
        { type: 'multiple-choice', question: 'Wie schnell soll die Herzdruckmassage durchgeführt werden?', options: ['60-80 pro Minute', '80-100 pro Minute', '100-120 pro Minute', '140-160 pro Minute'], correctIndex: 2, explanation: '100-120 Kompressionen pro Minute – entspricht dem Rhythmus von "Stayin\' Alive" von den Bee Gees!' },
        { type: 'text', emoji: '🔢', title: 'Der 30:2 Rhythmus (ERC 2021)', content: '30 Kompressionen → 2 Beatmungen → 30 Kompressionen → ...\n\nFür Laien ohne Beatmungs-Training:\nNur Kompressionen kontinuierlich – das ist laut ERC 2021 auch bei Erwachsenen wirksam!\n\nWichtig: Nicht unterbrechen – max. 10 Sekunden Pause.\n\nBei Kindern (1 Jahr bis Pubertät): ebenfalls 30:2 für Laien.', style: 'default' },
        { type: 'true-false', statement: 'Bei der Herzdruckmassage soll man die Arme gebeugt halten.', correct: false, explanation: 'Falsch! Arme immer gestreckt halten. So überträgst du dein Körpergewicht effizient und ermüdest langsamer.' },
        { type: 'multiple-choice', question: 'Was ist der korrekte CPR-Rhythmus für Erwachsene?', options: ['15 Kompressionen : 1 Beatmung', '15 Kompressionen : 2 Beatmungen', '30 Kompressionen : 1 Beatmung', '30 Kompressionen : 2 Beatmungen'], correctIndex: 3, explanation: '30:2 ist der Standardrhythmus für Erwachsene. Bei Kindern gilt 15:2.' },
        { type: 'complete', xpEarned: 30 },
      ],
    },
    {
      id: 'l6',
      title: 'AED & Beatmung',
      subtitle: 'Defibrillator und Atemspende',
      emoji: '⚡',
      color: '#1CB0F6',
      xpReward: 25,
      estimatedMin: 4,
      steps: [
        { type: 'intro', emoji: '⚡', title: 'AED & Beatmung', subtitle: 'Ein AED kann das Herz wieder starten – lerne, wie du ihn benutzt' },
        { type: 'text', emoji: '🤍', title: 'Was ist ein AED?', content: 'AED = Automatisierter Externer Defibrillator.\n\nDas Gerät erkennt automatisch, ob ein Schock nötig ist und gibt Anweisungen. Es kann JEDER bedienen – ohne Ausbildung!\n\nIn Österreich findest du AEDs in Bahnhöfen, Einkaufszentren, Schulen, Sportstätten und vielen öffentlichen Gebäuden. Der Standort steht oft auf dem AED-Finder: aed.roteskreuz.at', style: 'info' },
        { type: 'multiple-choice', question: 'Wofür steht die Abkürzung "AED"?', options: ['Automatisierter Erster Dienst', 'Allgemeiner Erste-Hilfe-Dienst', 'Automatisierter Externer Defibrillator', 'Akuter Einsatz-Defibrillator'], correctIndex: 2, explanation: 'AED = Automatisierter Externer Defibrillator. "Extern" = von außen auf den Körper angewendet.' },
        { type: 'ordering', question: 'In welcher Reihenfolge verwendest du den AED?', items: ['Elektroden auf die Brust kleben', 'AED einschalten (Deckel öffnen)', 'Anweisungen des AED befolgen', 'Sicherstellen, dass niemand die Person berührt, dann Schock auslösen'], correctOrder: [1, 0, 2, 3], explanation: 'Zuerst einschalten, dann Elektroden kleben, dann Anweisungen befolgen, dann ggf. Schock auslösen.' },
        { type: 'true-false', statement: 'Den AED darfst du nur benutzen, wenn du eine spezielle Ausbildung gemacht hast.', correct: false, explanation: 'Falsch! AEDs sind für jeden gemacht. Sie erkennen selbst, ob ein Schock nötig ist. Einfach einschalten und Anweisungen folgen!' },
        { type: 'multiple-choice', question: 'Was machst du, wenn der AED sagt "Kein Schock empfohlen"?', options: ['Sofort aufhören', 'Den AED ausschalten und warten', 'Mit CPR weitermachen', 'Einen anderen AED holen'], correctIndex: 2, explanation: '"Kein Schock" heißt: Weiter CPR machen – der AED analysiert automatisch weiter.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 3 – Bewusstlosigkeit
// ─────────────────────────────────────────
const module3: Module = {
  id: 'mod3',
  title: 'Bewusstlosigkeit',
  description: 'Stabile Seitenlage & Atemwege',
  color: '#58CC02',
  colorDark: '#2E6E00',
  emoji: '💤',
  lessons: [
    {
      id: 'l7',
      title: 'Stabile Seitenlage',
      subtitle: 'Die Rettungsposition',
      emoji: '🛌',
      color: '#58CC02',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🛌', title: 'Stabile Seitenlage', subtitle: 'So lagerst du eine bewusstlose Person sicher' },
        { type: 'text', emoji: '💡', title: 'Wann stabile Seitenlage?', content: 'Bei einer bewusstlosen Person MIT normaler Atmung → stabile Seitenlage!\n\nNicht bei Herzstillstand (keine Atmung) → dort CPR!', style: 'warning' },
        { type: 'multiple-choice', question: 'Wann bringst du eine Person in die stabile Seitenlage?', options: ['Bei Herzstillstand', 'Bei bewusstlos + normaler Atmung', 'Bei leichtem Schwindel', 'Immer als erstes'], correctIndex: 1, explanation: 'Stabile Seitenlage NUR bei bewusstlos + normaler Atmung. Bei Herzstillstand sofort CPR!' },
        { type: 'true-false', statement: 'Bei der stabilen Seitenlage muss der Mund nach oben zeigen.', correct: false, explanation: 'Der Mund zeigt zur Seite oder leicht nach unten – damit Erbrochenes abfließen kann und die Atemwege frei bleiben.' },
        { type: 'multiple-choice', question: 'Was prüfst du nach dem Hindrehen in die stabile Seitenlage?', options: ['Den Blutdruck', 'Ob die Person lächelt', 'Ob die Atemwege frei sind und die Atmung normal ist', 'Die Körpertemperatur'], correctIndex: 2, explanation: 'Nach der Umlagerung sofort prüfen: Atemwege frei? Normale Atmung vorhanden? Regelmäßig kontrollieren!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l8',
      title: 'Atemwege freihalten',
      subtitle: 'Kopf überstrecken & prüfen',
      emoji: '🌬️',
      color: '#76CC02',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🌬️', title: 'Atemwege freihalten', subtitle: 'Freie Atemwege sind lebensnotwendig – so machst du sie frei' },
        { type: 'text', emoji: '↗️', title: 'Kopf überstrecken', content: 'Lege eine Hand auf die Stirn, mit der anderen Hand das Kinn anheben.\n\nSo öffnen sich die Atemwege, weil die Zunge nach vorne kippt.\n\nDann: Schauen, Hören, Fühlen – max. 10 Sekunden!', style: 'info' },
        { type: 'multiple-choice', question: 'Wie öffnest du bei einer bewusstlosen Person die Atemwege?', options: ['Mund aufdrücken', 'Kopf überstrecken und Kinn anheben', 'Auf den Bauch drehen', 'Arme hochheben'], correctIndex: 1, explanation: 'Kopf überstrecken + Kinn anheben öffnet die Atemwege. Die Zunge, die sie blockiert, fällt dabei nach vorne.' },
        { type: 'true-false', statement: 'Du solltest die Atmung einer bewusstlosen Person mehr als 20 Sekunden lang prüfen.', correct: false, explanation: 'Maximal 10 Sekunden! Länger warten = verlorene Zeit. Wenn du unsicher bist: starte CPR.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l9',
      title: 'Krampfanfall',
      subtitle: 'Richtig reagieren',
      emoji: '⚡',
      color: '#9B59B6',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '⚡', title: 'Krampfanfall', subtitle: 'Was tun, wenn jemand einen Anfall bekommt? Ruhe bewahren!' },
        { type: 'text', emoji: '🛡️', title: 'Schutz & Beobachten', content: 'Beim Krampfanfall:\n✅ Umgebung sichern (weiche Unterlage, Verletzungsgefahren entfernen)\n✅ Nicht festhalten!\n✅ Zeit messen (Anfallsdauer)\n✅ Nach dem Anfall: stabile Seitenlage', style: 'warning' },
        { type: 'true-false', statement: 'Du solltest eine Person während eines Krampfanfalls festhalten.', correct: false, explanation: 'Falsch! Festhalten kann zu Verletzungen führen. Sichern, aber nicht festhalten. Den Anfall ablaufen lassen.' },
        { type: 'multiple-choice', question: 'Was steckst du NICHT in den Mund einer Person mit Krampfanfall?', options: ['Nichts – absolut nichts', 'Einen Löffel', 'Ein Tuch', 'Den eigenen Finger'], correctIndex: 0, explanation: 'Niemals etwas in den Mund stecken! Die Person verschluckt die Zunge nicht – das ist ein Mythos.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 4 – Blutungen & Wunden
// ─────────────────────────────────────────
const module4: Module = {
  id: 'mod4',
  title: 'Blutungen & Wunden',
  description: 'Blutungen stoppen und Wunden versorgen',
  color: '#E74C3C',
  colorDark: '#A93226',
  emoji: '🩹',
  lessons: [
    {
      id: 'l10',
      title: 'Blutungen stoppen',
      subtitle: 'Druck ist die beste Medizin',
      emoji: '🩸',
      color: '#E74C3C',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🩸', title: 'Blutungen stoppen', subtitle: 'Mit der richtigen Technik kannst du starke Blutungen kontrollieren' },
        { type: 'text', emoji: '👊', title: 'Direkter Druck', content: 'Die wichtigste Methode: DIREKTER DRUCK auf die Wunde!\n\n1. Sterilen Verband oder sauberes Tuch nehmen\n2. Fest auf die Wunde drücken\n3. Nicht loslassen – mindestens 10 Minuten!\n4. Verband wird rot? Einfach weiteren Verband drüber!', style: 'info' },
        { type: 'multiple-choice', question: 'Was machst du, wenn der erste Verband mit Blut durchtränkt ist?', options: ['Verband wechseln und neu anfangen', 'Einen weiteren Verband darüber anlegen', 'Mehr Druck machen ohne Verband', 'Aufhören und warten'], correctIndex: 1, explanation: 'Nie den ersten Verband entfernen! Er hat wichtige Blutgerinnsel gebildet. Einfach einen weiteren Verband darüber legen.' },
        { type: 'true-false', statement: 'Bei einer stark blutenden Wunde solltest du den blutgetränkten Verband entfernen und durch einen frischen ersetzen.', correct: false, explanation: 'Falsch! Verband drüber, nicht wechseln. Das Entfernen würde Gerinnsel zerstören und die Blutung erneut starten.' },
        { type: 'multiple-choice', question: 'Wann ist ein Tourniquet angemessen?', options: ['Bei kleinen Schnittwunden', 'Bei Gliedmaßen mit nicht kontrollierbarer, lebensbedrohlicher Blutung', 'Immer als erstes Mittel', 'Niemals in der Ersten Hilfe'], correctIndex: 1, explanation: 'Tourniquet nur bei extremen Fällen: lebensbedrohliche Blutung an Arm/Bein, die mit direktem Druck nicht zu stoppen ist.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l11',
      title: 'Wunden versorgen',
      subtitle: 'Richtig reinigen & verbinden',
      emoji: '🩹',
      color: '#E67E22',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🩹', title: 'Wunden versorgen', subtitle: 'So behandelst du kleine Wunden richtig – ohne Infektion' },
        { type: 'text', emoji: '💧', title: 'Reinigen & Abdecken', content: 'Schritte bei kleinen Wunden:\n1. Hände waschen!\n2. Wunde unter fließendem Wasser spülen\n3. Vorsichtig trockentupfen\n4. Desinfektion\n5. Steriles Pflaster oder Wundverband', style: 'info' },
        { type: 'true-false', statement: 'Du solltest eine frische Wunde mit einem Wattepad abrubbeln, um sie zu reinigen.', correct: false, explanation: 'Wattefasern bleiben in der Wunde! Benutze sterile Kompressen oder spüle mit Wasser. Tupfen, nicht reiben!' },
        { type: 'multiple-choice', question: 'Was bedeutet es, wenn eine Wunde gerötet, warm und geschwollen ist?', options: ['Normal – heilt gut', 'Zeichen einer Infektion – Arzt aufsuchen', 'Nur ein Bluterguss', 'Der Verband ist zu fest'], correctIndex: 1, explanation: 'Rötung + Wärme + Schwellung + evtl. Eiter = Infektionszeichen. Arzt aufsuchen, da Antibiotika nötig sein können.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l12',
      title: 'Druckverband anlegen',
      subtitle: 'Der Druckverband rettet Leben',
      emoji: '🎗️',
      color: '#C0392B',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🎗️', title: 'Druckverband anlegen', subtitle: 'Ein Druckverband ist deine beste Waffe gegen starke Blutungen' },
        { type: 'text', emoji: '🔄', title: 'Druckverband – Schritt für Schritt', content: '1. Sterile Wundauflage auf die Wunde legen\n2. Druckkörper auf die Wundauflage\n3. Elastische Binde fest darum wickeln\n4. Fest fixieren – Verband soll Druck ausüben\n5. Auf arterielles Bluten prüfen (hellrotes, pulsierendes Blut = 112!)', style: 'info' },
        { type: 'multiple-choice', question: 'Was ist der Unterschied zwischen hellrotem und dunkelrotem Blut?', options: ['Kein Unterschied', 'Hellrot = arteriell (Schlagader), dunkelrot = venös (Vene)', 'Hellrot ist ungefährlich', 'Dunkelrot kommt aus Arterien'], correctIndex: 1, explanation: 'Hellrotes, spritzende Blut kommt aus Arterien (hoher Druck = gefährlich!). Dunkelrotes, fließendes Blut aus Venen.' },
        { type: 'true-false', statement: 'Bei einem Druckverband sollte die Extremität nach Anlegen regelmäßig auf Durchblutung geprüft werden.', correct: true, explanation: 'Richtig! Prüfe alle paar Minuten: Ist die Haut unterhalb des Verbandes warm und hat normale Farbe?' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 5 – Verbrennungen
// ─────────────────────────────────────────
const module5: Module = {
  id: 'mod5',
  title: 'Verbrennungen',
  description: 'Kühlen, schützen, retten',
  color: '#E67E22',
  colorDark: '#A04000',
  emoji: '🔥',
  lessons: [
    {
      id: 'l13',
      title: 'Verbrennungsgrade',
      subtitle: '1°, 2°, 3° – was bedeutet das?',
      emoji: '🌡️',
      color: '#E67E22',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🌡️', title: 'Verbrennungsgrade', subtitle: 'Lerne, wie schwer eine Verbrennung ist – das bestimmt die Behandlung' },
        { type: 'text', emoji: '🔥', title: 'Die 3 Verbrennungsgrade', content: '1. Grad: Rötung, Schmerzen, keine Blasen → Kühlen\n\n2. Grad: Blasenbildung, starke Schmerzen → Kühlen + Arzt!\n\n3. Grad: Weißlich/schwärzlich, kein Schmerz (Nerven zerstört) → NOTFALL → 112!', style: 'warning' },
        { type: 'multiple-choice', question: 'Welches Merkmal ist typisch für eine Verbrennung 2. Grades?', options: ['Nur Rötung', 'Blasenbildung und starke Schmerzen', 'Keine Schmerzen', 'Schwarze Haut'], correctIndex: 1, explanation: 'Grad 2 = Blasen + starke Schmerzen. Grad 3 hat keine Schmerzen (Nerven zerstört) und ist schwarz/weiß.' },
        { type: 'true-false', statement: 'Eine Verbrennung 3. Grades ist oft schmerzlos, weil die Nerven zerstört sind.', correct: true, explanation: 'Richtig! Kein Schmerz bedeutet hier = sehr schwere Verbrennung. Sofort 112 anrufen!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l14',
      title: 'Verbrennungen kühlen',
      subtitle: 'Richtig kühlen spart Haut',
      emoji: '💧',
      color: '#3498DB',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '💧', title: 'Verbrennungen kühlen', subtitle: 'Die richtige Kühlung mindert Schmerzen und verhindert tiefere Schäden' },
        { type: 'text', emoji: '🚿', title: 'So kühlt man richtig', content: 'Verbrennungen sofort kühlen:\n✅ Kühles (nicht eiskaltes!) Wasser: 15-20°C\n✅ Mindestens 10 Minuten kühlen\n✅ Kleidung entfernen falls möglich\n✅ Blasen NICHT aufstechen!\n✅ Bei großen Flächen: Auskühlung verhindern!', style: 'info' },
        { type: 'multiple-choice', question: 'Was ist die ideale Temperatur für Kühlwasser bei Verbrennungen?', options: ['0-5°C (eiskaltes Wasser)', '15-20°C (kühles Leitungswasser)', '35-40°C (körperwarm)', '50°C (heiß)'], correctIndex: 1, explanation: 'Eiskaltes Wasser ist gefährlich! Kühles Leitungswasser 15-20°C für 10-20 Minuten.' },
        { type: 'true-false', statement: 'Verbrennungsblasen solltest du aufstechen, damit die Wunde besser heilt.', correct: false, explanation: 'Blasen NIEMALS aufstechen! Sie sind natürlicher Schutz gegen Infektionen. Aufstechen = Infektionsrisiko!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l15',
      title: 'Chemische Verätzungen',
      subtitle: 'Säuren & Laugen – Vorsicht!',
      emoji: '☠️',
      color: '#27AE60',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '☠️', title: 'Chemische Verätzungen', subtitle: 'Chemikalien können schwere Schäden anrichten – schnelles Handeln ist entscheidend' },
        { type: 'text', emoji: '⚠️', title: 'Erste Maßnahmen', content: 'Bei chemischen Verätzungen:\n1. EIGENSCHUTZ! (Handschuhe)\n2. Kontaminierte Kleidung entfernen\n3. Mit großen Mengen Wasser spülen (min. 15-20 Min.)\n4. 112 anrufen\n5. Chemikalie identifizieren', style: 'warning' },
        { type: 'true-false', statement: 'Bei einer Säureverbrennung solltest du als Gegenmittel Lauge auf die Wunde geben.', correct: false, explanation: 'NIEMALS Neutralisationsversuche! Die Reaktion erzeugt Wärme und verschlimmert die Verletzung. Nur Wasser!' },
        { type: 'multiple-choice', question: 'Wie lange spülst du eine chemische Verätzung mit Wasser?', options: ['1-2 Minuten', '5 Minuten', 'Mindestens 15-20 Minuten', '1 Stunde'], correctIndex: 2, explanation: 'Mindestens 15-20 Minuten spülen! Kurzes Spülen reicht nicht – die Chemikalie muss vollständig verdünnt werden.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 6 – Knochen & Gelenke
// ─────────────────────────────────────────
const module6: Module = {
  id: 'mod6',
  title: 'Knochen & Gelenke',
  description: 'Frakturen erkennen und versorgen',
  color: '#9B59B6',
  colorDark: '#6C3483',
  emoji: '🦴',
  lessons: [
    {
      id: 'l16',
      title: 'Frakturen erkennen',
      subtitle: 'Gebrochen oder nur geschwollen?',
      emoji: '🦴',
      color: '#9B59B6',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🦴', title: 'Frakturen erkennen', subtitle: 'Lerne, wie du einen Knochenbruch von einer Prellung unterscheidest' },
        { type: 'text', emoji: '🔍', title: 'Anzeichen eines Knochenbruchs', content: 'Typische Zeichen:\n• Starke Schmerzen, besonders beim Bewegen\n• Schwellung und Bluterguss\n• Sichtbare Verformung oder Fehlstellung\n• Bewegungseinschränkung\n\n→ Im Zweifel: Behandle es wie eine Fraktur!', style: 'info' },
        { type: 'multiple-choice', question: 'Was ist KEIN typisches Zeichen für einen Knochenbruch?', options: ['Starke lokale Schmerzen', 'Schwellung und Bluterguss', 'Fieber und Schüttelfrost', 'Sichtbare Verformung'], correctIndex: 2, explanation: 'Fieber und Schüttelfrost deuten eher auf eine Infektion hin. Knochenbrüche verursachen lokale Symptome, kein Fieber.' },
        { type: 'true-false', statement: 'Im Zweifel solltest du einen möglichen Knochenbruch immer wie eine echte Fraktur behandeln.', correct: true, explanation: 'Richtig! Wenn du unsicher bist ob Prellung oder Bruch → behandle es als Bruch.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l17',
      title: 'Schienung',
      subtitle: 'Knochen ruhig stellen',
      emoji: '🩼',
      color: '#7F8C8D',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🩼', title: 'Schienung', subtitle: 'Eine gute Schiene verhindert weitere Verletzungen – so geht\'s richtig' },
        { type: 'text', emoji: '📐', title: 'Schiene anlegen', content: 'Grundregeln beim Schienen:\n✅ Gelenk ober- und unterhalb des Bruchs einschließen\n✅ In der Position lassen, in der gefunden\n✅ Polsterung zwischen Schiene und Haut\n✅ Durchblutung nach dem Anlegen prüfen\n❌ Nie versuchen, den Knochen zu richten!', style: 'info' },
        { type: 'true-false', statement: 'Einen Knochen solltest du vor dem Schienen gerade richten.', correct: false, explanation: 'NIEMALS selbst richten! Das kann Gefäße und Nerven verletzen. In der vorgefundenen Position schienen.' },
        { type: 'multiple-choice', question: 'Was prüfst du nach dem Anlegen einer Schiene?', options: ['Ob der Knochen gerade ist', 'Puls, Bewegung und Sensibilität unterhalb der Schiene', 'Die Außentemperatur', 'Den Blutdruck'], correctIndex: 1, explanation: 'Nach dem Schienen: Durchblutung (Puls), Motorik (Bewegung) und Sensibilität (Gefühl) unterhalb prüfen!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l18',
      title: 'Die PECH-Regel',
      subtitle: 'Für Prellungen & Verstauchungen',
      emoji: '🧊',
      color: '#1ABC9C',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🧊', title: 'Die PECH-Regel', subtitle: 'PECH ist ein einfaches Schema für Sportverletzungen und Verstauchungen' },
        { type: 'text', emoji: '❄️', title: 'PECH – Was bedeutet das?', content: 'P – PAUSE (Belastung stoppen)\nE – EIS (Kühlen: Kältebeutel, Kühlpack)\nC – COMPRESSION (elastischen Verband anlegen)\nH – HOCHLAGERN (betroffene Körperstelle hochhalten)\n\nBei: Verstauchungen, Prellungen, Muskelzerrungen', style: 'info' },
        { type: 'ordering', question: 'In welcher Reihenfolge wendest du die PECH-Regel an?', items: ['Hochlagern der betroffenen Extremität', 'Pause – Belastung stoppen', 'Eis auflegen (gekühlt, nicht direkt auf Haut)', 'Compression durch elastischen Verband'], correctOrder: [1, 2, 3, 0], explanation: 'P-E-C-H in dieser Reihenfolge! Pause zuerst, dann Kühlen, dann Kompression, dann Hochlagern.' },
        { type: 'multiple-choice', question: 'Wie lange kannst du Eis bei der PECH-Regel auflegen?', options: ['Kontinuierlich bis der Schmerz weg ist', 'Maximal 20 Minuten, dann Pause', '1 Minute pro Stunde', 'Niemals – Eis ist gefährlich'], correctIndex: 1, explanation: 'Max. 20 Min. Eis, dann mindestens 20 Min. Pause. Direktes Eis auf der Haut kann Erfrierungen verursachen!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 7 – Allergien & Asthma
// ─────────────────────────────────────────
const module7: Module = {
  id: 'mod7',
  title: 'Allergien & Asthma',
  description: 'Anaphylaxie und Atemnotfälle',
  color: '#F39C12',
  colorDark: '#B7770D',
  emoji: '🤧',
  lessons: [
    {
      id: 'l19',
      title: 'Anaphylaxie',
      subtitle: 'Der allergische Schock',
      emoji: '🚨',
      color: '#F39C12',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🚨', title: 'Anaphylaxie', subtitle: 'Eine schwere allergische Reaktion kann lebensbedrohlich sein – handle sofort!' },
        { type: 'text', emoji: '⚠️', title: 'Zeichen der Anaphylaxie', content: 'Anaphylaxie-Zeichen:\n• Hautausschlag, Juckreiz\n• Schwellung (besonders Lippen, Zunge, Hals)\n• Atemnot, pfeifende Atmung\n• Erbrechen, Übelkeit\n• Kreislaufkollaps, Bewusstlosigkeit\n\nBesonders gefährlich: Schwellung der Atemwege!', style: 'warning' },
        { type: 'multiple-choice', question: 'Was ist bei Anaphylaxie das lebensbedrohlichste Symptom?', options: ['Hautjucken', 'Schwellung der Atemwege (Erstickungsgefahr)', 'Übelkeit', 'Schwindel'], correctIndex: 1, explanation: 'Schwellung der Atemwege kann zur vollständigen Blockade führen – das ist das akut lebensbedrohliche Symptom!' },
        { type: 'true-false', statement: 'Bei einem anaphylaktischen Schock solltest du zuerst warten, ob die Symptome von selbst besser werden.', correct: false, explanation: 'NIEMALS warten! Sofort 112 und EpiPen anwenden. Anaphylaxie kann in Minuten tödlich sein.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l20',
      title: 'EpiPen anwenden',
      subtitle: 'Adrenalin rettet Leben',
      emoji: '💉',
      color: '#E74C3C',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '💉', title: 'EpiPen anwenden', subtitle: 'Der EpiPen ist das wichtigste Mittel gegen schwere allergische Reaktionen' },
        { type: 'text', emoji: '📋', title: 'EpiPen – Schritt für Schritt', content: '1. EpiPen aus dem Behälter nehmen\n2. Kappe entfernen (blauer Sicherheitsclip raus)\n3. Fest in den Außenoberschenkel (auch durch Kleidung!)\n4. Ca. 10 Sekunden halten\n5. Massieren\n6. Immer 112 anrufen – EpiPen ist nur erste Hilfe!', style: 'info' },
        { type: 'multiple-choice', question: 'Wo injizierst du den EpiPen?', options: ['In den Arm', 'In den Außenoberschenkel', 'In den Bauch', 'In den Rücken'], correctIndex: 1, explanation: 'Außenoberschenkel – größter Muskel, gut erreichbar, auch durch Kleidung injizierbar.' },
        { type: 'true-false', statement: 'Nach der Anwendung des EpiPens ist der Notfall vorbei und man muss keinen Arzt aufsuchen.', correct: false, explanation: 'Falsch! Der EpiPen wirkt nur 15-20 Minuten. Danach kann die Reaktion zurückkommen. Immer ins Krankenhaus!' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l21',
      title: 'Asthmaanfall',
      subtitle: 'Atemnot richtig behandeln',
      emoji: '🫁',
      color: '#3498DB',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🫁', title: 'Asthmaanfall', subtitle: 'Asthma ist häufig – lerne, wie du bei einem Anfall richtig hilfst' },
        { type: 'text', emoji: '💨', title: 'Sofortmaßnahmen', content: 'Bei einem Asthmaanfall:\n✅ Betroffene Person beruhigen\n✅ Aufrechte Sitzposition (Kutscher-Sitz)\n✅ Atemübungen (Lippenbremse)\n✅ Inhalator (Asthmaspray) benutzen lassen\n✅ Bei schweren Anfällen: 112!', style: 'info' },
        { type: 'multiple-choice', question: 'In welcher Position sollte eine Person mit Asthmaanfall sitzen?', options: ['Flach auf dem Rücken', 'Aufrecht oder leicht nach vorne gebeugt (Kutscher-Sitz)', 'Auf dem Bauch', 'Es ist egal'], correctIndex: 1, explanation: 'Aufrechte Position oder Kutscher-Sitz erleichtert die Atmung erheblich!' },
        { type: 'true-false', statement: 'Du solltest den Betroffenen beim Asthmaanfall zum Hinlegen bringen.', correct: false, explanation: 'Falsch! Hinlegen verschlechtert die Atmung. Aufrecht sitzen oder Kutscher-Sitz ist die richtige Position.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 8 – Herz & Gehirn
// ─────────────────────────────────────────
const module8: Module = {
  id: 'mod8',
  title: 'Herz & Gehirn',
  description: 'Schlaganfall & Herzinfarkt',
  color: '#2C3E50',
  colorDark: '#1A252F',
  emoji: '🧠',
  lessons: [
    {
      id: 'l22',
      title: 'Schlaganfall erkennen',
      subtitle: 'FAST-Test kann Leben retten',
      emoji: '🧠',
      color: '#2C3E50',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🧠', title: 'Schlaganfall erkennen', subtitle: 'Beim Schlaganfall zählt jede Minute – erkenne die Zeichen sofort!' },
        { type: 'text', emoji: '⚡', title: 'Der FAST-Test', content: 'F – FACE: Gesichtshälfte hängend/schief? Lächeln lassen!\nA – ARMS: Arm heben? Ein Arm sackt ab?\nS – SPEECH: Sprechen? Nuscheln, falsche Wörter?\nT – TIME: Sofort 112 anrufen!\n\nEin positiver Test → Verdacht auf Schlaganfall → KEINE Zeit verlieren!', style: 'warning' },
        { type: 'multiple-choice', question: 'Was bedeutet das "A" im FAST-Test?', options: ['Alter des Betroffenen', 'Arme – Können beide Arme gehoben werden?', 'Aufmerksamkeit prüfen', 'Atmung überprüfen'], correctIndex: 1, explanation: 'A = Arms. Bitte die Person, beide Arme zu heben. Sinkt ein Arm ab, ist das ein Schlaganfall-Zeichen.' },
        { type: 'true-false', statement: 'Beim Schlaganfall darf man warten, ob die Symptome von selbst verschwinden.', correct: false, explanation: 'NIEMALS warten! Jede Minute sterben ca. 2 Millionen Nervenzellen. "Time is brain!"' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l23',
      title: 'Herzinfarkt',
      subtitle: 'Zeichen erkennen & handeln',
      emoji: '💗',
      color: '#C0392B',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '💗', title: 'Herzinfarkt', subtitle: 'Ein Herzinfarkt kann jeden treffen – erkenne die Zeichen und rette Leben' },
        { type: 'text', emoji: '💔', title: 'Herzinfarkt-Zeichen', content: 'Typische Zeichen:\n• Heftiger Brustschmerz (dumpf, drückend, wie Stein)\n• Ausstrahlung in Arm, Kiefer, Rücken\n• Atemnot und Schweißausbruch\n• Übelkeit, Todesangst\n\nAtypisch (häufig bei Frauen): nur Oberbauchschmerzen, Übelkeit, Erschöpfung!', style: 'warning' },
        { type: 'multiple-choice', question: 'Wie wird der Brustschmerz beim Herzinfarkt typischerweise beschrieben?', options: ['Stechend wie ein Messer', 'Dumpf, drückend, wie ein Stein auf der Brust', 'Brennend wie Sodbrennen', 'Kurz und blitzartig'], correctIndex: 1, explanation: 'Klassisch: dumpfer, drückender, anhaltender Schmerz. Aber viele Herzinfarkte verlaufen atypisch!' },
        { type: 'true-false', statement: 'Herzinfarkt-Symptome bei Frauen sind oft atypisch und unterscheiden sich von der Lehrbuch-Darstellung.', correct: true, explanation: 'Richtig! Frauen haben oft keine Brustschmerzen – stattdessen Übelkeit, Rückenschmerzen, extreme Müdigkeit.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l24',
      title: 'FAST-Test üben',
      subtitle: 'Teste dein Wissen!',
      emoji: '⏱️',
      color: '#16A085',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '⏱️', title: 'FAST üben', subtitle: 'Festige dein Wissen über den FAST-Test mit praktischen Übungen' },
        { type: 'multiple-choice', question: 'Dein Freund lächelt schief und ein Mundwinkel hängt herunter. Was tust du?', options: ['Er macht einen Witz', 'Verdacht auf Schlaganfall – FAST-Test durchführen!', 'Wahrscheinlich ein Zahnproblem', 'Nicht schlimm, beobachten'], correctIndex: 1, explanation: 'Gesichtshälfte hängt = klassisches Schlaganfall-Zeichen (F in FAST). Sofort weitertesten und ggf. 112!' },
        { type: 'ordering', question: 'Führe den FAST-Test in der richtigen Reihenfolge durch:', items: ['SPEECH – Sprechen/Nuscheln prüfen', 'TIME – Sofort 112 anrufen', 'FACE – Gesicht prüfen (Lächeln lassen)', 'ARMS – Arme heben lassen'], correctOrder: [2, 3, 0, 1], explanation: 'F-A-S-T: Face → Arms → Speech → Time (112!). Wenn auch nur ein Test positiv: Schlaganfall-Verdacht!' },
        { type: 'true-false', statement: 'Nur wenn ALLE FAST-Tests positiv sind, rufst du 112 an.', correct: false, explanation: 'Falsch! SCHON EIN positiver Test reicht aus für den Notruf. Im Zweifel anrufen!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 9 – Ersticken & Ertrinken
// ─────────────────────────────────────────
const module9: Module = {
  id: 'mod9',
  title: 'Ersticken & Ertrinken',
  description: 'Schnell reagieren rettet Leben',
  color: '#2980B9',
  colorDark: '#1A5276',
  emoji: '🌊',
  lessons: [
    {
      id: 'l25',
      title: 'Ersticken beim Erwachsenen',
      subtitle: 'Heimlich-Manöver',
      emoji: '😮‍💨',
      color: '#2980B9',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '😮‍💨', title: 'Ersticken', subtitle: 'Ein Fremdkörper in den Atemwegen ist ein Notfall – du kannst helfen!' },
        { type: 'text', emoji: '👊', title: 'Rückenschläge & Heimlich', content: 'Bei Ersticken (Person kann nicht husten/sprechen):\n1. Aufforderung: kräftig husten!\n2. 5 kräftige Schläge zwischen die Schulterblätter\n3. Hilft nicht? → 5 Heimlich-Stöße:\n   - Hinter die Person stellen\n   - Faust unter Brustbein, Zweite Hand drüber\n   - Kräftig nach innen-oben stoßen', style: 'info' },
        { type: 'multiple-choice', question: 'Bei Verdacht auf Fremdkörper in den Atemwegen: Was machst du zuerst?', options: ['Sofort Heimlich anwenden', '112 anrufen und warten', 'Auffordern zu husten', 'Finger in den Mund stecken'], correctIndex: 2, explanation: 'Zuerst: Kräftiger Husten ist das effektivste Mittel! Erst wenn das nicht hilft → Rückenschläge → Heimlich.' },
        { type: 'true-false', statement: 'Das Heimlich-Manöver kann bei Schwangeren genau so angewendet werden wie bei anderen Erwachsenen.', correct: false, explanation: 'Falsch! Bei Schwangeren → Brustdrücke statt Bauchstöße, um das Ungeborene zu schützen.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l26',
      title: 'Säugling erstickt',
      subtitle: 'Kleinkinder brauchen andere Technik',
      emoji: '👶',
      color: '#E74C3C',
      xpReward: 25,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '👶', title: 'Säugling erstickt', subtitle: 'Bei Babys ist eine andere Technik nötig – Heimlich ist falsch!' },
        { type: 'text', emoji: '🍼', title: 'Technik für Säuglinge', content: 'Für Säuglinge (< 1 Jahr):\n1. Baby bäuchlings auf deinen Unterarm legen\n2. 5 Rückenschläge (zwischen Schulterblätter)\n3. Umdrehen, 5 Bruststöße (2 Finger, Mitte Brustbein)\n4. NIEMALS Heimlich-Manöver!\n5. Fremdkörper SICHTBAR? → Entfernen. Nie blind suchen!', style: 'warning' },
        { type: 'true-false', statement: 'Das Heimlich-Manöver (Bauchstöße) ist auch bei Säuglingen anwendbar.', correct: false, explanation: 'NIEMALS bei Säuglingen! Die Bauchstöße können innere Organe verletzen. Bei Babys: Rückenschläge + Bruststöße.' },
        { type: 'multiple-choice', question: 'In welcher Position hältst du den Säugling bei Rückenschlägen?', options: ['Aufrecht stehend', 'Bäuchlings auf deinem Unterarm, Kopf leicht nach unten', 'Auf dem Rücken auf dem Boden', 'Aufrecht auf deiner Schulter'], correctIndex: 1, explanation: 'Bäuchlings auf dem Unterarm, Kopf leicht tiefer als Körper. So nutzt du die Schwerkraft beim Rückenschlag.' },
        { type: 'complete', xpEarned: 25 },
      ],
    },
    {
      id: 'l27',
      title: 'Ertrinken',
      subtitle: 'Retten ohne sich zu gefährden',
      emoji: '🏊',
      color: '#2471A3',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🏊', title: 'Ertrinken', subtitle: 'Beim Ertrinken kommt Eigenschutz zuerst – dann Retten' },
        { type: 'text', emoji: '🪢', title: 'Retten mit Abstand', content: 'Ertrinken-Erste-Hilfe:\n1. Laut um Hilfe rufen / 112\n2. EIGENSCHUTZ! Nicht leichtfertig ins Wasser!\n3. "Reach, Throw, Row, Don\'t Go" (erst aus dem Trockenen retten)\n4. Seil, Ast, Kleidung hinhalten\n5. Nach der Rettung: Bewusstsein & Atmung prüfen, CPR falls nötig', style: 'warning' },
        { type: 'true-false', statement: 'Du solltest sofort ins Wasser springen, um eine ertrinkende Person zu retten.', correct: false, explanation: 'GEFÄHRLICH! Ertrinkende können Retter unter Wasser ziehen. Erst aus dem Trockenen retten!' },
        { type: 'multiple-choice', question: 'Was machst du mit einer geretteten Person aus dem Wasser?', options: ['Wasser aus der Lunge drücken', 'In stabile Seitenlage, wenn sie atmet', 'Sofort CPR beginnen egal was', 'Trocknen und wärmen – sonst nichts'], correctIndex: 1, explanation: 'Wenn die Person atmet → stabile Seitenlage + warmhalten. Wenn sie nicht atmet → CPR!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// MODULE 10 – Schock & Krisen
// ─────────────────────────────────────────
const module10: Module = {
  id: 'mod10',
  title: 'Schock & psychische Erste Hilfe',
  description: 'Krisen bewältigen und Schock behandeln',
  color: '#6C5CE7',
  colorDark: '#4A3AB5',
  emoji: '🧘',
  lessons: [
    {
      id: 'l28',
      title: 'Schock erkennen',
      subtitle: 'Was ist ein Kreislaufschock?',
      emoji: '😰',
      color: '#6C5CE7',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '😰', title: 'Schock erkennen', subtitle: 'Ein Schock ist ein medizinischer Notfall – kein psychisches Erschrecken!' },
        { type: 'text', emoji: '⚡', title: 'Schock-Zeichen', content: 'Beim Kreislaufschock bekommt das Gewebe zu wenig Sauerstoff.\n\nZeichen:\n• Blässe, Kaltschweißigkeit\n• Schneller, schwacher Puls\n• Beschleunigte, flache Atmung\n• Unruhe, Angst, Verwirrtheit\n• Ggf. Bewusstlosigkeit', style: 'warning' },
        { type: 'multiple-choice', question: 'Was ist KEIN typisches Zeichen eines Kreislaufschocks?', options: ['Blässe und Kaltschweißigkeit', 'Roter Kopf und langsamer Puls', 'Schneller, schwacher Puls', 'Unruhe und Verwirrtheit'], correctIndex: 1, explanation: 'Roter Kopf und langsamer Puls passen nicht zum Schock. Schock = blass, kalt, schneller schwacher Puls.' },
        { type: 'true-false', statement: 'Beim Schock solltest du den Betroffenen aufrecht hinsetzen.', correct: false, explanation: 'Falsch! Bei Schock → Schocklagerung: flach hinlegen, Beine 30-45 cm hochlagern.' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l29',
      title: 'Schock behandeln',
      subtitle: 'Richtige Lagerung & Wärme',
      emoji: '🛏️',
      color: '#00B894',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🛏️', title: 'Schock behandeln', subtitle: 'Schocklagerung und Wärme können Leben retten' },
        { type: 'text', emoji: '🦵', title: 'Die Schocklagerung', content: 'Schocklagerung:\n1. Person flach auf den Rücken legen\n2. Beine 30-45 cm hochlagern (Blut zum Herzen)\n3. Warm halten (Decke)\n4. Beruhigen und nicht allein lassen\n5. 112 – Schock ist immer ein Notfall!\n6. Nichts essen/trinken lassen', style: 'info' },
        { type: 'multiple-choice', question: 'Warum werden beim Schock die Beine hochgelagert?', options: ['Um Beinschmerzen zu lindern', 'Damit das Blut zum Herzen und Gehirn fließt', 'Für mehr Komfort', 'Um Thrombosen zu verhindern'], correctIndex: 1, explanation: 'Hochlagern verbessert den venösen Rückfluss – mehr Blut kommt zum Herzen → bessere Versorgung lebenswichtiger Organe.' },
        { type: 'true-false', statement: 'Eine Person im Schock darf Wasser trinken, wenn sie sehr durstig ist.', correct: false, explanation: 'Niemals! Im Schock könnte eine Operation nötig werden. Nichts essen oder trinken – Aspirationsgefahr!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
    {
      id: 'l30',
      title: 'Psychologische Erste Hilfe',
      subtitle: 'Helfen auch ohne Verbandkasten',
      emoji: '🤝',
      color: '#A29BFE',
      xpReward: 20,
      estimatedMin: 3,
      steps: [
        { type: 'intro', emoji: '🤝', title: 'Psychologische Erste Hilfe', subtitle: 'Nach einem Trauma kann emotionale Unterstützung Leben retten' },
        { type: 'text', emoji: '💬', title: 'So hilfst du emotional', content: 'So hilfst du:\n✅ Da sein – nicht allein lassen\n✅ Reden lassen – aktiv zuhören\n✅ Nicht bagatellisieren\n✅ Praktisch helfen (Decke, Wasser, Telefon)\n✅ Professionelle Hilfe organisieren\n❌ Nicht bedrängen oder Ratschläge geben', style: 'info' },
        { type: 'multiple-choice', question: 'Was ist NICHT hilfreich bei der psychologischen Ersten Hilfe?', options: ['Da sein und Zuhören', 'Praktisch helfen', '"Stell dich nicht so an, andere haben Schlimmeres erlebt"', 'Professionelle Hilfe organisieren'], correctIndex: 2, explanation: 'Vergleiche und Bagatellisieren sind schädlich! Zuhören ohne zu bewerten ist das Wichtigste.' },
        { type: 'true-false', statement: 'Nach einem Notfall ist es wichtig, die betroffene Person sofort über alle Details zu befragen.', correct: false, explanation: 'Falsch! Intensives Befragen kann traumatisierend wirken. Nur was die Person von selbst erzählt!' },
        { type: 'complete', xpEarned: 20 },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
export const modules: Module[] = [
  module1, module2, module3, module4, module5,
  module6, module7, module8, module9, module10,
]

export const allLessons: Lesson[] = modules.flatMap(m => m.lessons)

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find(l => l.id === id)
}

export function getModuleForLesson(lessonId: string): Module | undefined {
  return modules.find(m => m.lessons.some(l => l.id === lessonId))
}

export const totalLessons = allLessons.length
