// Lesson data structure with different question types

export type TextSlide = {
  type: 'text'
  title: string
  content: string
  image?: string
}

export type MultipleChoiceQuestion = {
  type: 'multiple-choice'
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type OrderingQuestion = {
  type: 'ordering'
  question: string
  items: string[]
  correctOrder: number[]
  explanation: string
}

export type RhythmQuestion = {
  type: 'rhythm'
  title: string
  instruction: string
  bpm: number // beats per minute
  duration: number // seconds
  tolerance: number // ms tolerance for correct tap
}

export type TrueFalseQuestion = {
  type: 'true-false'
  statement: string
  correct: boolean
  explanation: string
}

export type LessonStep = TextSlide | MultipleChoiceQuestion | OrderingQuestion | RhythmQuestion | TrueFalseQuestion

export type Lesson = {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  steps: LessonStep[]
}

// Lesson 1: Notruf 112
export const lesson112: Lesson = {
  id: 'notruf-112',
  title: 'Notruf 112',
  description: 'Lerne, wie du richtig den Notruf absetzt',
  icon: '📞',
  xpReward: 50,
  steps: [
    {
      type: 'text',
      title: '112 - Deine Lebensretter-Nummer!',
      content: 'Die 112 funktioniert in ganz Europa, ist kostenlos und sogar ohne SIM-Karte erreichbar!'
    },
    {
      type: 'multiple-choice',
      question: 'Was ist die europaweite Notrufnummer?',
      options: ['110', '112', '118', '911'],
      correctIndex: 1,
      explanation: 'Genau! 112 funktioniert ueberall in Europa.'
    },
    {
      type: 'true-false',
      statement: 'Man kann die 112 auch ohne SIM-Karte anrufen.',
      correct: true,
      explanation: 'Stimmt! Die 112 funktioniert immer - auch ohne SIM-Karte.'
    },
    {
      type: 'text',
      title: 'Die 4 W-Fragen',
      content: 'Bei einem Notruf brauchst du 4 wichtige Infos:\n\n📍 WO ist es passiert?\n❓ WAS ist passiert?\n👥 WIE VIELE Verletzte?\n🩹 WELCHE Verletzungen?'
    },
    {
      type: 'multiple-choice',
      question: 'Welche Info ist am WICHTIGSTEN beim Notruf?',
      options: [
        'Dein Name',
        'Der Ort des Notfalls',
        'Wie viele Verletzte',
        'Die Art der Verletzung'
      ],
      correctIndex: 1,
      explanation: 'Der ORT ist am wichtigsten! Falls das Gespraech abbricht, weiss die Leitstelle wohin sie Hilfe schicken muss.'
    },
    {
      type: 'text',
      title: 'Merke dir: WO!',
      content: 'Sag immer ZUERST wo du bist!\n\nStrasse, Hausnummer, Stadt - oder besondere Merkmale wie "vor dem Supermarkt" oder "am roten Haus".'
    },
    {
      type: 'multiple-choice',
      question: 'Welche gehoeren zu den 4 W-Fragen?',
      options: [
        'WO, WAS, WIE VIELE, WELCHE',
        'WER, WO, WANN, WARUM',
        'WAS, WANN, WER, WELCHE',
        'WARUM, WO, WIE, WER'
      ],
      correctIndex: 0,
      explanation: 'Richtig! WO - WAS - WIE VIELE - WELCHE. Diese 4 Infos braucht die Leitstelle.'
    },
    {
      type: 'true-false',
      statement: 'Nach dem Notruf sollte man sofort auflegen.',
      correct: false,
      explanation: 'Nein! Warte auf Rueckfragen der Leitstelle. Lege NIE selbst auf!'
    },
    {
      type: 'text',
      title: 'Fast geschafft! 🎉',
      content: 'Du kennst jetzt die wichtigsten Regeln:\n\n✅ 112 anrufen\n✅ 4 W-Fragen beantworten\n✅ Nicht auflegen - warten!'
    },
    {
      type: 'multiple-choice',
      question: 'Jemand ist verletzt. Was machst du zuerst?',
      options: [
        'Fotos machen',
        '112 anrufen und den ORT nennen',
        'Freunde informieren',
        'Im Internet nachschauen'
      ],
      correctIndex: 1,
      explanation: 'Perfekt! Sofort 112 anrufen und als erstes sagen WO du bist!'
    }
  ]
}

// Lesson 2: Herzdruckmassage (CPR)
export const lessonCPR: Lesson = {
  id: 'herzdruckmassage',
  title: 'Herzdruckmassage',
  description: 'Lerne die lebensrettende Herzdruckmassage',
  icon: '❤️',
  xpReward: 80,
  steps: [
    {
      type: 'text',
      title: 'Warum Herzdruckmassage?',
      content: 'Bei einem Herzstillstand pumpt das Herz kein Blut mehr. Ohne Sauerstoff stirbt das Gehirn nach 3-5 Minuten ab. Die Herzdruckmassage haelt den Kreislauf aufrecht!'
    },
    {
      type: 'text',
      title: 'Die richtige Position',
      content: 'Druecke auf die Mitte des Brustkorbs (zwischen den Brustwarzen). Druecke 5-6 cm tief mit gestreckten Armen. Lass den Brustkorb nach jedem Druck vollstaendig zurueckkommen.'
    },
    {
      type: 'multiple-choice',
      question: 'Wie tief sollst du bei der Herzdruckmassage druecken?',
      options: ['1-2 cm', '3-4 cm', '5-6 cm', '8-10 cm'],
      correctIndex: 2,
      explanation: 'Die richtige Drucktiefe ist 5-6 cm. Zu wenig Druck ist nicht effektiv, zu viel kann Rippen brechen.'
    },
    {
      type: 'text',
      title: 'Der richtige Rhythmus',
      content: 'Druecke mit 100-120 Schlaegen pro Minute. Das entspricht dem Rhythmus von "Stayin Alive" von den Bee Gees oder "Baby Shark"!'
    },
    {
      type: 'rhythm',
      title: 'Uebe den Rhythmus!',
      instruction: 'Tippe im Rhythmus der Herzdruckmassage (100-120 BPM). Tippe so gleichmaessig wie moeglich!',
      bpm: 110,
      duration: 15,
      tolerance: 150
    },
    {
      type: 'multiple-choice',
      question: 'Welches Lied hat den richtigen Rhythmus fuer die Herzdruckmassage?',
      options: [
        'Yesterday (Beatles)',
        'Stayin Alive (Bee Gees)',
        'Bohemian Rhapsody (Queen)',
        'Hello (Adele)'
      ],
      correctIndex: 1,
      explanation: '"Stayin Alive" hat genau 100 BPM - perfekt fuer die Herzdruckmassage!'
    },
    {
      type: 'true-false',
      statement: 'Man sollte bei der Herzdruckmassage Pausen machen, damit sich der Patient erholen kann.',
      correct: false,
      explanation: 'Falsch! Unterbrechungen sollten so kurz wie moeglich sein. Jede Pause bedeutet, dass kein Blut zum Gehirn gepumpt wird.'
    },
    {
      type: 'ordering',
      question: 'Was ist die richtige Reihenfolge bei einer bewusstlosen Person ohne Atmung?',
      items: [
        'Mit Herzdruckmassage beginnen',
        'Person ansprechen und schuetteln',
        'Notruf 112 anrufen',
        'Atmung pruefen'
      ],
      correctOrder: [1, 3, 2, 0],
      explanation: 'Erst pruefen (ansprechen, Atmung), dann Notruf, dann Herzdruckmassage starten.'
    }
  ]
}

// Lesson 3: Stabile Seitenlage
export const lessonSeitenlage: Lesson = {
  id: 'stabile-seitenlage',
  title: 'Stabile Seitenlage',
  description: 'Lerne die stabile Seitenlage fuer bewusstlose Personen',
  icon: '🛏️',
  xpReward: 70,
  steps: [
    {
      type: 'text',
      title: 'Wann stabile Seitenlage?',
      content: 'Die stabile Seitenlage wendest du bei bewusstlosen Personen an, die noch normal atmen. Sie verhindert, dass die Zunge die Atemwege blockiert oder Erbrochenes eingeatmet wird.'
    },
    {
      type: 'multiple-choice',
      question: 'Wann bringst du jemanden in die stabile Seitenlage?',
      options: [
        'Bei Bewusstlosigkeit MIT normaler Atmung',
        'Bei Bewusstlosigkeit OHNE Atmung',
        'Bei Herzinfarkt',
        'Bei Knochenbruechen'
      ],
      correctIndex: 0,
      explanation: 'Die stabile Seitenlage ist nur fuer bewusstlose Personen mit Atmung! Ohne Atmung musst du mit der Herzdruckmassage beginnen.'
    },
    {
      type: 'text',
      title: 'Die Schritte',
      content: '1. Kniet neben der Person\n2. Arm zur Seite, Handfläche nach oben\n3. Anderen Arm ueber die Brust\n4. Bein anwinkeln\n5. Person zu dir druehen\n6. Kopf ueberstrecken'
    },
    {
      type: 'ordering',
      question: 'Bringe die Schritte der stabilen Seitenlage in die richtige Reihenfolge:',
      items: [
        'Kopf ueberstrecken, Mund oeffnen',
        'Person zu dir herueber rollen',
        'Arm der nahen Seite rechtwinklig ablegen',
        'Fernen Arm ueber die Brust legen',
        'Fernes Bein anwinkeln'
      ],
      correctOrder: [2, 3, 4, 1, 0],
      explanation: 'Erst positionieren (Arm ablegen, Arm ueber Brust, Bein anwinkeln), dann rollen, zuletzt Kopf ueberstrecken.'
    },
    {
      type: 'true-false',
      statement: 'In der stabilen Seitenlage sollte der Mund der Person nach unten zeigen.',
      correct: true,
      explanation: 'Richtig! So kann Erbrochenes oder Blut aus dem Mund fliessen und wird nicht eingeatmet.'
    },
    {
      type: 'multiple-choice',
      question: 'Warum ist das Ueberstrecken des Kopfes wichtig?',
      options: [
        'Es sieht professioneller aus',
        'Es oeffnet die Atemwege',
        'Es ist bequemer fuer die Person',
        'Es verhindert Nackenschmerzen'
      ],
      correctIndex: 1,
      explanation: 'Das Ueberstrecken des Kopfes hebt die Zunge vom Rachenraum und oeffnet so die Atemwege.'
    }
  ]
}

// All lessons
export const lessons: Lesson[] = [lesson112, lessonCPR, lessonSeitenlage]

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(l => l.id === id)
}
