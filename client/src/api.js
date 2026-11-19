const BASE = import.meta.env.VITE_API_URL || '/api'

export const getToken = () => localStorage.getItem('token')

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const NOTTO_OFFICIAL_URL = 'https://notto.mohfw.gov.in/donor-pledge'
export const NOTTO_HELPLINE = '1800-11-4770'

export const ORGANS_LIST = [
  'All Organs & Tissues',
  'Heart',
  'Kidneys',
  'Liver',
  'Lungs',
  'Pancreas',
  'Intestines',
  'Corneas (Eyes)',
  'Skin & Tissues',
  'Heart Valves & Bone',
]

export const ORGAN_TIME_WINDOWS = [
  {
    id: 'heart',
    name: 'Heart',
    category: 'Solid Organ',
    windowHours: '4 – 6 Hours',
    urgency: 'Critical',
    temperature: '4°C Cold Storage',
    livesSaved: 1,
    description: 'Requires rapid retrieval and transplant. Once preserved, the heart must beat inside the recipient within 4-6 hours.',
    icon: 'heart',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'lungs',
    name: 'Lungs',
    category: 'Solid Organ',
    windowHours: '4 – 6 Hours',
    urgency: 'Critical',
    temperature: '4°C to 8°C Hypothermic Preservation',
    livesSaved: 2,
    description: 'High sensitivity to ischemia. Can be transplanted as a pair or single lung to save patients with end-stage lung disease.',
    icon: 'lungs',
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'liver',
    name: 'Liver',
    category: 'Solid Organ',
    windowHours: '8 – 12 Hours (Up to 15h)',
    urgency: 'High',
    temperature: '2°C to 4°C Belzer UW Solution',
    livesSaved: 2,
    description: 'Can often be split into two grafts: saving an adult and an infant recipient simultaneously. Highly regenerative.',
    icon: 'liver',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'kidneys',
    name: 'Kidneys',
    category: 'Solid Organ',
    windowHours: '24 – 36 Hours (Up to 48h)',
    urgency: 'High',
    temperature: '4°C Cold Static or Machine Perfusion',
    livesSaved: 2,
    description: 'Longest preservation window of solid organs. One deceased donor provides 2 kidneys, liberating two patients from dialysis.',
    icon: 'kidneys',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    category: 'Solid Organ',
    windowHours: '12 – 18 Hours',
    urgency: 'Moderate-High',
    temperature: '4°C UW Solution',
    livesSaved: 1,
    description: 'Frequently transplanted alongside a kidney for Type 1 diabetic patients with chronic renal failure.',
    icon: 'pancreas',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'intestines',
    name: 'Intestines',
    category: 'Solid Organ',
    windowHours: '6 – 8 Hours',
    urgency: 'Critical',
    temperature: '4°C Perfusion Solution',
    livesSaved: 1,
    description: 'Transplanted for irreversible intestinal failure. Highly vascular and time-sensitive.',
    icon: 'intestines',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'corneas',
    name: 'Corneas (Eyes)',
    category: 'Tissue',
    windowHours: 'Retrieve within 6 hrs (Preserved 14 Days)',
    urgency: 'Retrieved Post-Cardiac Death',
    temperature: '2°C to 8°C MK or Optisol Medium',
    livesSaved: 2,
    description: 'Can be retrieved after natural heart death. A single donor restores vision to 2 individuals suffering from corneal blindness.',
    icon: 'eye',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    id: 'skin-tissues',
    name: 'Skin & Heart Valves',
    category: 'Tissue',
    windowHours: 'Retrieve within 12–24 hrs (Stored 5 Years)',
    urgency: 'Cryopreserved',
    temperature: '-80°C to -196°C Liquid Nitrogen',
    livesSaved: 'Heals 50+ patients',
    description: 'Skin graphs save acid attack and severe burn victims; heart valves save pediatric congenital heart defect patients.',
    icon: 'tissue',
    color: 'from-violet-500 to-fuchsia-600',
  },
  {
    id: 'blood-rbc',
    name: 'Red Blood Cells (RBC)',
    category: 'Blood Component',
    windowHours: 'Shelf Life: 35 – 42 Days',
    urgency: 'Emergency & Trauma',
    temperature: '2°C to 6°C Monitored Refrigerator',
    livesSaved: 1,
    description: 'Carries oxygen throughout the body. Essential for surgeries, road traffic trauma, anemia, and childbirth emergencies.',
    icon: 'drop',
    color: 'from-red-600 to-red-700',
  },
  {
    id: 'platelets',
    name: 'Platelets',
    category: 'Blood Component',
    windowHours: 'Shelf Life: 5 Days Only!',
    urgency: 'Highest Blood Need',
    temperature: '20°C to 24°C with continuous agitation',
    livesSaved: 1,
    description: 'Halts critical bleeding in cancer, leukemia, chemotherapy, and dengue patients. Extremely perishable.',
    icon: 'drop-pulse',
    color: 'from-pink-500 to-rose-600',
  },
]
