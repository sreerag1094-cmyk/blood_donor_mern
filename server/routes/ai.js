import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

// Medical knowledge base for blood & organ donation in India (MoHFW / NOTTO / Red Cross standards)
const KNOWLEDGE_BASE = [
  {
    keywords: ['tattoo', 'piercing', 'ink'],
    response:
      'In India, standard National Blood Transfusion Council (NBTC) guidelines require a waiting period of **6 months** (previously 12 months) after getting a tattoo, body piercing, or acupuncture before donating blood, to rule out potential blood-borne infections like Hepatitis B/C.',
  },
  {
    keywords: ['alcohol', 'drinking', 'beer', 'liquor'],
    response:
      'You should avoid donating blood for at least **24 hours** after consuming alcohol. Ensure you are well-hydrated and have had a healthy meal before donation.',
  },
  {
    keywords: ['smoking', 'cigarette', 'nicotine'],
    response:
      'You should refrain from smoking for at least **2 hours before and 2 hours after** blood donation to prevent sudden drops in blood pressure and avoid elevated carbon monoxide levels in the donated unit.',
  },
  {
    keywords: ['weight', 'underweight', 'heavy', 'kg'],
    response:
      'The minimum weight requirement to donate blood in India is **45 kg** for 350 mL whole blood collection, or **50 kg** for 450 mL collection. This ensures donor safety and prevents post-donation dizziness or hypovolemia.',
  },
  {
    keywords: ['age', 'old', 'young', 'minor', 'senior'],
    response:
      'For blood donation, the eligible age in India is **18 to 65 years**. For organ donation through NOTTO, there is **no strict upper age limit** — individuals in their 70s and 80s have successfully donated livers, kidneys, and corneas based on physiological fitness!',
  },
  {
    keywords: ['interval', 'frequency', 'often', 'days between', 'gap'],
    response:
      'Healthy adult males can donate whole blood every **90 days (3 months)**, while females can donate every **120 days (4 months)**. Platelet apheresis donation can be done as frequently as every 15 days (up to 24 times a year).',
  },
  {
    keywords: ['diabetes', 'sugar', 'diabetic', 'insulin'],
    response:
      'Individuals with diabetes whose blood sugar is well-controlled via diet or oral medication (tablets) can donate blood. However, donors requiring daily **insulin injections** are deferred from blood donation for their own safety. Pledging organs via NOTTO is still possible!',
  },
  {
    keywords: ['bp', 'blood pressure', 'hypertension'],
    response:
      'Your blood pressure should be between **Systolic 100–140 mmHg** and **Diastolic 60–90 mmHg** at the time of donation. If your BP is well-controlled on maintenance medication and within range, you are eligible to donate.',
  },
  {
    keywords: ['hemoglobin', 'hb', 'iron', 'anemia'],
    response:
      'The minimum required hemoglobin level for whole blood donation in India is **12.5 g/dL** for both males and females. A quick finger-prick test is performed at the donation camp to verify this before collection.',
  },
  {
    keywords: ['notto', 'pledge', 'form 7', 'government', 'registry'],
    response:
      'NOTTO (National Organ & Tissue Transplant Organization) is the apex Government of India body under MoHFW managing the national organ registry. You can submit your pledge here or at https://notto.mohfw.gov.in/donor-pledge. By Indian law (THOTA Form 7), always inform your next of kin so they can honor your wish.',
  },
  {
    keywords: ['time', 'golden hour', 'preservation', 'viability', 'hours'],
    response:
      'Critical organ preservation times: **Heart: 4–6 hours** | **Lungs: 4–6 hours** | **Liver: 8–15 hours** | **Kidneys: 24–36 hours (up to 48h)** | **Corneas: Retrieve within 6 hrs (kept 14 days)** | **Platelets: 5 days** | **Red Blood Cells: 42 days**.',
  },
  {
    keywords: ['universal', 'o negative', 'o-', 'ab+', 'compatible', 'group'],
    response:
      '**O-Negative (O-)** is the universal red blood cell donor — vital for trauma emergencies. **AB-Positive (AB+)** is the universal red blood cell recipient. For plasma, **AB** is the universal donor!',
  },
  {
    keywords: ['brain death', 'cardiac death', 'coma', 'difference'],
    response:
      'Brain stem death is the irreversible loss of all brain functions while the heart is kept beating mechanically in ICU; solid organs (heart, liver, lungs, kidneys) can be retrieved during this time. After cardiac death (natural heart stop), corneas, skin, and bone tissues can be retrieved within 6 hours.',
  },
  {
    keywords: ['helpline', 'contact', 'emergency', 'phone', 'toll free'],
    response:
      'The National Organ Donation 24x7 Toll-Free Helpline by NOTTO is **1800-11-4770**. For emergency medical ambulance services in India, dial **108** or **102**.',
  },
]

// AI Chatbot endpoint
router.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Query message is required' })
    }

    const clean = message.toLowerCase()

    // Find best match in knowledge base
    let bestMatch = null
    let maxHits = 0

    for (const item of KNOWLEDGE_BASE) {
      const hits = item.keywords.filter((kw) => clean.includes(kw)).length
      if (hits > maxHits) {
        maxHits = hits
        bestMatch = item
      }
    }

    if (bestMatch && maxHits > 0) {
      return res.json({
        reply: bestMatch.response,
        source: 'LifeLink AI Knowledge Engine (NOTTO / NBTC Standards)',
        confidence: 'High',
      })
    }

    // Default intelligent clinical response
    return res.json({
      reply:
        "Thank you for reaching out! To donate blood in India, you generally need to be **18–65 years old**, weigh at least **45 kg**, have a hemoglobin level above **12.5 g/dL**, and be free of active infections. For organ donation, anyone can pledge via **NOTTO** regardless of age. You can also use our **AI Donor Eligibility Screener** on the homepage to check your complete medical readiness!",
      source: 'LifeLink Clinical AI Assistant',
      confidence: 'General Guidance',
    })
  })
)

// AI Donor Eligibility Pre-Screening endpoint
router.post(
  '/screen-eligibility',
  asyncHandler(async (req, res) => {
    const {
      age,
      weight,
      gender,
      bloodGroup,
      tattooRecent, // 'yes' | 'no' (within 6 months)
      alcohol24h, // 'yes' | 'no'
      smokingRecent, // 'yes' | 'no' (within 2h)
      antibioticsRecent, // 'yes' | 'no' (within 7 days)
      majorSurgery, // 'yes' | 'no' (within 6 months)
      isDiabeticInsulin, // 'yes' | 'no'
      hasHypertensionControlled, // 'yes' | 'no'
      isPregnantOrLactating, // 'yes' | 'no'
      daysSinceLastDonation, // number or null
    } = req.body

    const issues = []
    const advisories = []
    let eligibleToday = true

    // Age Check
    const numAge = Number(age)
    if (numAge < 18) {
      eligibleToday = false
      issues.push('Minimum age for blood donation in India is 18 years.')
    } else if (numAge > 65) {
      eligibleToday = false
      issues.push('Maximum age for voluntary first-time blood donation is 65 years. However, organ donation pledge through NOTTO is fully open!')
    }

    // Weight Check
    const numWeight = Number(weight)
    if (numWeight < 45) {
      eligibleToday = false
      issues.push('Weight is below 45 kg minimum threshold. Donating could cause temporary dizziness or hypotension.')
    }

    // Tattoo / Piercing Check
    if (tattooRecent === 'yes') {
      eligibleToday = false
      issues.push('Tattoo or body piercing within the last 6 months requires a temporary deferral period to prevent transfusion-transmitted infections.')
    }

    // Alcohol Check
    if (alcohol24h === 'yes') {
      eligibleToday = false
      issues.push('Alcohol consumption within 24 hours requires a 24-hour waiting window to ensure full hydration and stable vitals.')
    }

    // Antibiotics / Acute illness Check
    if (antibioticsRecent === 'yes') {
      eligibleToday = false
      issues.push('Active antibiotic therapy requires completing the course and waiting at least 7 symptom-free days.')
    }

    // Major Surgery Check
    if (majorSurgery === 'yes') {
      eligibleToday = false
      issues.push('Major surgery within 6 months requires complete healing and surgeon clearance.')
    }

    // Insulin-dependent diabetes
    if (isDiabeticInsulin === 'yes') {
      eligibleToday = false
      issues.push('Insulin-dependent diabetes is deferred for blood donation to protect donor vascular health. Organ donation pledge remains eligible.')
    }

    // Pregnancy / Lactation
    if (gender === 'female' && isPregnantOrLactating === 'yes') {
      eligibleToday = false
      issues.push('Pregnancy or active lactation within 12 months requires deferral to preserve maternal iron stores.')
    }

    // Interval check
    if (daysSinceLastDonation !== null && daysSinceLastDonation !== undefined) {
      const minInterval = gender === 'female' ? 120 : 90
      if (Number(daysSinceLastDonation) < minInterval) {
        eligibleToday = false
        const remaining = minInterval - Number(daysSinceLastDonation)
        issues.push(`Last donation was ${daysSinceLastDonation} days ago. Mandatory recovery interval is ${minInterval} days (${remaining} days remaining).`)
      }
    }

    // Advisories
    if (smokingRecent === 'yes') {
      advisories.push('Refrain from smoking for at least 2 hours prior to collection.')
    }
    if (hasHypertensionControlled === 'yes') {
      advisories.push('Ensure your blood pressure is checked on-site (Systolic < 140 mmHg, Diastolic < 90 mmHg).')
    }
    advisories.push('Drink 500 mL of water and eat a light meal 2 to 3 hours before donation.')

    const score = eligibleToday ? 100 : Math.max(20, 100 - issues.length * 25)

    res.json({
      eligibleToday,
      score,
      status: eligibleToday
        ? 'Eligible to Donate Blood Today ✅'
        : 'Temporary Deferral / Medical Evaluation Needed ⏳',
      organPledgeEligible: true, // Organ donation pledge is virtually always eligible!
      issues,
      advisories,
      summary: eligibleToday
        ? 'Great news! Based on clinical parameters, you meet the National Blood Transfusion Council criteria.'
        : `You currently have ${issues.length} temporary deferral criterion. Note: You remain 100% eligible to pledge your organs with NOTTO!`,
    })
  })
)

export default router
