# System Architecture & SRS Diagrams
## LifeLink: AI-Powered Blood & Organ Donation Management System
### Integrated with NOTTO (MoHFW, Government of India)

---

**Document Version:** 1.0.0  
**Associated Document:** [SRS.md](file:///d:/Entri/main%20project/blood-donor-mern/blood-donor-mern/docs/SRS.md)  
**Standard:** IEEE Std 830-1998 Specification Diagrams  
**Architecture:** MERN (MongoDB Atlas, Express.js, React 19, Node.js 24)  

---

## Table of Diagrams
1. [Use Case Diagram (Actors & System Boundary)](#1-system-use-case-diagram)
2. [Level 0 Data Flow Diagram (Context Diagram)](#2-level-0-data-flow-diagram-context-diagram)
3. [Level 1 Data Flow Diagram (Detailed Process Decomposition)](#3-level-1-data-flow-diagram-dfd-level-1)
4. [Full-Stack 3-Tier System Architecture Diagram](#4-full-stack-3-tier-system-architecture-diagram)
5. [Sequence Diagram: AI Donor Eligibility Pre-Screening](#5-sequence-diagram-ai-donor-eligibility-pre-screening)
6. [Sequence Diagram: NOTTO Organ Pledge & Form 7 Card Generation](#6-sequence-diagram-notto-organ-pledge--form-7-card-generation)
7. [Sequence Diagram: LifeLink AI Assistant Query Resolution](#7-sequence-diagram-lifelink-ai-assistant-query-resolution)
8. [Entity-Relationship Diagram (ERD)](#8-entity-relationship-diagram-erd)
9. [State Transition Diagram: Blood Donor Profile Lifecycle](#9-state-transition-diagram-blood-donor-profile-lifecycle)

---

## 1. System Use Case Diagram
Visualizes the primary system actors (Public Recipient, Voluntary Blood Donor, Organ Pledger, and System Administrator) and their functional boundaries.

```mermaid
flowchart LR
    subgraph Actors["System Actors"]
        PR["Public Visitor / Recipient"]
        BD["Registered Blood Donor"]
        OP["Organ Pledger"]
        SA["System Administrator"]
    end

    subgraph Boundary["LifeLink Core System Boundary"]
        UC1["Search Blood Donors (By Group & City)"]
        UC2["Run AI Eligibility Pre-Screening"]
        UC3["Watch Golden Hours Video & Timelines"]
        UC4["Chat with LifeLink AI Assistant"]
        UC5["Register & Manage Donor Profile"]
        UC6["Submit Organ Pledge & Generate Form 7 Card"]
        UC7["Refer to NOTTO National Portal"]
        UC8["Approve / Reject Donor Profiles"]
        UC9["Audit Organ Pledges & Manage Users"]
    end

    PR --> UC1
    PR --> UC2
    PR --> UC3
    PR --> UC4

    BD --> UC1
    BD --> UC2
    BD --> UC4
    BD --> UC5

    OP --> UC3
    OP --> UC6
    OP --> UC7

    SA --> UC8
    SA --> UC9
```

---

## 2. Level 0 Data Flow Diagram (Context Diagram)
Demonstrates the high-level boundary of LifeLink with external entities and data exchanges.

```mermaid
flowchart TD
    Recip["Recipient / Seeker"]
    Donor["Blood / Organ Donor"]
    Admin["System Administrator"]
    NOTTO["NOTTO Registry (MoHFW)"]

    CoreSystem["0.0 LifeLink System (MERN + AI Core)"]

    Recip -->|"Search queries, urgent requests"| CoreSystem
    CoreSystem -->|"Verified donor contacts, viability times"| Recip

    Donor -->|"Vitals, lifestyle data, organ pledge"| CoreSystem
    CoreSystem -->|"Eligibility report, Form 7 Donor Card"| Donor

    CoreSystem -->|"External pledge referral"| NOTTO
    NOTTO -->|"Statutory guidance, 24x7 Helpline"| CoreSystem

    Admin -->|"Moderation actions, block commands"| CoreSystem
    CoreSystem -->|"Aggregated metrics, audit logs"| Admin
```

---

## 3. Level 1 Data Flow Diagram (DFD Level 1)
Decomposes internal processes, data stores, and message queues.

```mermaid
flowchart TD
    subgraph External["External Entities"]
        User["User / Donor"]
        Adm["Administrator"]
        NOTTO_Ext["NOTTO MoHFW Portal"]
    end

    subgraph Processes["Processes"]
        P1["1.0 Authentication & RBAC Engine"]
        P2["2.0 Blood Matching & Search"]
        P3["3.0 NOTTO Organ Pledge & Card Generator"]
        P4["4.0 AI Clinical Pre-Screening Engine"]
        P5["5.0 AI Chatbot NLP Knowledge Engine"]
        P6["6.0 Administrative Governance & Analytics"]
    end

    subgraph Stores["MongoDB Data Stores"]
        D1[("Users Store")]
        D2[("Donors Store")]
        D3[("Organ Pledges Store")]
        D4[("Requests & Donations Store")]
    end

    User -->|"Credentials"| P1
    P1 -->|"Read/Write User"| D1
    P1 -->|"JWT Token"| User

    User -->|"Search Criteria"| P2
    P2 -->|"Query Indexed Donors"| D2
    D2 -->|"Matched Donors"| P2
    P2 -->|"Donor List"| User

    User -->|"Form 7 Pledge Data"| P3
    P3 -->|"Save Pledge"| D3
    P3 -->|"Printable Donor Card"| User
    P3 -.->|"Redirection"| NOTTO_Ext

    User -->|"Vitals & Exposures"| P4
    P4 -->|"0-100% Score & Advice"| User

    User -->|"Medical Query"| P5
    P5 -->|"Clinical Guidance & Voice"| User

    Adm -->|"Approval/Rejection"| P6
    P6 -->|"Update Status"| D2
    P6 -->|"Audit Pledges"| D3
    P6 -->|"Read Stats"| D4
```

---

## 4. Full-Stack 3-Tier System Architecture Diagram
Illustrates the physical architecture across Client, Web Server, AI Services, and Cloud Data Tier.

```mermaid
flowchart TD
    subgraph ClientTier["Presentation Tier (Client / Browser)"]
        UI["React 19 SPA + Vite 7 + Tailwind CSS v4"]
        Speech["Web Speech Synthesis Engine (AI Voiceover)"]
        ChatUI["LifeLink AI Chatbot Floating Component"]
        ScreenerUI["AI Donor Pre-Screening Component"]
        CardCanvas["Dynamic Form 7 Donor Card Canvas"]
    end

    subgraph APITier["Application & API Tier (Node.js 24 + Express 4)"]
        CORS["CORS Middleware (CLIENT_URL allowlist)"]
        DNS["Resilient DNS Resolver (8.8.8.8, 8.8.4.4)"]
        JWT["JWT Security Middleware (protect & authorize)"]
        
        subgraph MicroRoutes["Express Route Controllers"]
            R_Auth["/api/auth (Bcrypt Salt 10)"]
            R_Donors["/api/donors (ABO/Rh Search)"]
            R_Organ["/api/organ-pledges (NOTTO-LL-XXXXX)"]
            R_AI["/api/ai (Chat & Clinical Screener)"]
            R_Admin["/api/admin (Governance Dashboard)"]
        end
    end

    subgraph DataTier["Data Tier & Cloud Storage"]
        MongoAtlas[("MongoDB Atlas Cloud (Multi-Node Replica Set)")]
        subgraph Collections["Collections"]
            ColUsers["users"]
            ColDonors["donors"]
            ColPledges["organpledges"]
            ColDonations["donations"]
            ColRequests["requests"]
        end
    end

    subgraph ExtGov["External Statutory Services"]
        NOTTO_Gov["NOTTO MoHFW Portal (https://notto.mohfw.gov.in)"]
        Helpline["24x7 National Helpline (1800-11-4770)"]
    end

    UI --> CORS
    CORS --> DNS
    DNS --> JWT
    JWT --> MicroRoutes

    R_Auth --> ColUsers
    R_Donors --> ColDonors
    R_Organ --> ColPledges
    R_Admin --> Collections
    MongoAtlas --- Collections

    CardCanvas -.->|Referral Bridge| NOTTO_Gov
    ChatUI -.->|Emergency Support| Helpline
```

---

## 5. Sequence Diagram: AI Donor Eligibility Pre-Screening
Traces the chronological interaction for donor pre-screening under NBTC and NOTTO criteria.

```mermaid
sequenceDiagram
    autonumber
    actor User as Voluntary Donor
    participant UI as React Client (AIDonorScreener)
    participant API as Express Server (/api/ai/screen-eligibility)
    participant Rules as Clinical Rules Engine (NBTC & NOTTO)

    User->>UI: Enters Vitals (Age, Weight, Gender, Blood Group)
    User->>UI: Selects Lifestyle (Tattoo, Alcohol, Antibiotics, Surgery, Insulin)
    User->>UI: Enters Days since last donation
    User->>UI: Clicks "Run AI Eligibility Evaluation"

    UI->>API: POST /api/ai/screen-eligibility {formData}
    API->>Rules: Evaluate Age (18-65) & Weight (>= 45kg)
    API->>Rules: Check 6-month Tattoo/Piercing rule
    API->>Rules: Check 24-hr Alcohol hydration rule
    API->>Rules: Calculate donation interval (90d M / 120d F)
    Rules-->>API: Returns Score (0-100%), Status, Deferrals, Advisories

    API-->>UI: 200 OK JSON {eligibleToday, score, issues, advisories}
    UI->>UI: Render Visual Score Gauge & Clinical Report
    UI->>UI: Display Organ Pledge Eligibility (100% Eligible)
    UI-->>User: Displays "Eligible to Donate" or "Temporary Deferral" with next date
```

---

## 6. Sequence Diagram: NOTTO Organ Pledge & Form 7 Card Generation
Traces the organ pledge registration and instant printable donor card lifecycle.

```mermaid
sequenceDiagram
    autonumber
    actor Pledger as Citizen / Organ Donor
    participant UI as React Client (OrganDonation)
    participant API as Express Server (/api/organ-pledges)
    participant DB as MongoDB (organpledges collection)
    participant NOTTO as Official NOTTO Portal (Govt of India)

    Pledger->>UI: Selects Organs (Heart, Kidneys, Liver, Corneas, etc.)
    Pledger->>UI: Enters Personal Details (Name, Phone, Age, City, State)
    Pledger->>UI: Fills Legal Next-of-Kin details (THOTA Compliance)
    Pledger->>UI: Clicks "Confirm Pledge & Generate Donor Card"

    UI->>API: POST /api/organ-pledges {pledgePayload}
    API->>API: Generate unique pledge reference "NOTTO-LL-XXXXX"
    API->>DB: Save organ pledge document
    DB-->>API: Document saved with ObjectId & Timestamps
    API-->>UI: 201 Created {pledge, nottoUrl}

    UI->>UI: Render Digital Form 7 Donor Card Canvas
    UI-->>Pledger: Displays Live Donor Card with Unique Pledge ID
    Pledger->>UI: Clicks "Print / Save Donor Card" (triggers window.print)
    Pledger->>NOTTO: Clicks "Open NOTTO Official Portal" (redirects to MoHFW registry)
```

---

## 7. Sequence Diagram: LifeLink AI Assistant Query Resolution
Demonstrates natural language medical query resolution, offline fallback, and SpeechSynthesis voice readout.

```mermaid
sequenceDiagram
    autonumber
    actor User as Public Visitor
    participant ChatUI as Floating AIChatbot Widget
    participant API as Express Server (/api/ai/chat)
    participant KB as Clinical Knowledge Base
    participant Speech as Web Speech API (Browser)

    User->>ChatUI: Types or clicks quick prompt ("Can I donate with tattoo?")
    ChatUI->>ChatUI: Render user bubble immediately
    ChatUI->>API: POST /api/ai/chat {message}
    
    alt Server Connected
        API->>KB: Match keywords against NBTC/NOTTO criteria
        KB-->>API: Return verified clinical explanation
        API-->>ChatUI: 200 OK {reply, source, confidence}
    else Network / Offline Fallback
        ChatUI->>ChatUI: Activate local fallback rules engine
    end

    ChatUI->>ChatUI: Render AI response bubble
    opt Voice Toggle Enabled
        ChatUI->>Speech: SpeechSynthesisUtterance(reply)
        Speech-->>User: Audio Voiceover Playback
    end
```

---

## 8. Entity-Relationship Diagram (ERD)
Defines the relational mappings, foreign keys, and indexes among MongoDB collections.

```mermaid
erDiagram
    USER ||--o| DONOR : "registers as"
    USER ||--o{ ORGAN_PLEDGE : "submits"
    USER ||--o{ DONATION : "logs as donor/recipient"
    USER ||--o{ REQUEST : "files emergency requisition"
    DONOR ||--o{ DONATION : "fulfills"

    USER {
        ObjectId _id PK
        string name
        string email UK "Indexed, Lowercase"
        string password "Bcrypt Hashed, select: false"
        string role "donor | admin"
        string phone
        boolean isBlocked "Default: false"
        date createdAt
        date updatedAt
    }

    DONOR {
        ObjectId _id PK
        ObjectId user FK "Unique, ref: User"
        string bloodGroup "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-"
        number age "Min: 18, Max: 65"
        string gender "male | female | other"
        string city "Indexed"
        string state
        boolean available "Default: true"
        string status "pending | approved | rejected"
        date lastDonationDate
        string bio
    }

    ORGAN_PLEDGE {
        ObjectId _id PK
        string pledgeId UK "Indexed (NOTTO-LL-XXXXX)"
        string fullName
        string email "Indexed"
        string phone
        number age "Min: 18, Max: 100"
        string gender
        string bloodGroup
        string city
        string state
        string_array organsPledged "Heart, Kidneys, Liver, Corneas, etc."
        string emergencyContactName "Legal Kin"
        string emergencyContactPhone
        string emergencyContactRelation
        boolean nottoReferralClicked
        ObjectId user FK "Optional"
        date createdAt
    }

    DONATION {
        ObjectId _id PK
        ObjectId donor FK "ref: Donor"
        ObjectId recipient FK "ref: User"
        date donationDate
        string bloodGroup
        string units
        string status
    }

    REQUEST {
        ObjectId _id PK
        ObjectId requester FK "ref: User"
        string patientName
        string bloodGroup
        string hospital
        string city
        string urgency "normal | critical"
        string status "open | fulfilled | closed"
    }
```

---

## 9. State Transition Diagram: Blood Donor Profile Lifecycle
Shows the state machine governing donor approval, public directory visibility, and administrative governance.

```mermaid
stateDiagram-v2
    [*] --> Draft : User registers on platform
    Draft --> PendingApproval : Submits Donor Profile details
    
    state PendingApproval {
        [*] --> AwaitingReview
        AwaitingReview --> AdminInspection : Admin opens verification queue
    }

    PendingApproval --> Approved : Admin validates credentials & approves
    PendingApproval --> Rejected : Admin detects invalid/incomplete medical data
    
    state Approved {
        [*] --> VisibleInDirectory
        VisibleInDirectory --> Available : Available toggle = true
        VisibleInDirectory --> Unavailable : Available toggle = false / Donated recently
    }

    Rejected --> PendingApproval : Donor updates details & re-submits
    Approved --> Blocked : Admin blocks account for violation
    Blocked --> Approved : Admin unblocks account
    
    Approved --> [*] : User deletes account
    Rejected --> [*] : User deletes account
```

---

**Generated For:** LifeLink Healthcare Engineering Documentation  
**Review Status:** Verified & Baselined for Entri Main Project  
