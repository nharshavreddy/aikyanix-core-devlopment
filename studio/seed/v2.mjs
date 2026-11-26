// Website content v2, from "Aikyanix_Core_Website_Content.docx" (Version 1.0, November 2026).
// Copy is kept exactly as written in the doc, including its punctuation and [placeholders].
// Used by seed/build.mjs (offline preview) and seed/apply-v2.ts (writes it to Sanity).

const ref = (id) => ({_type: 'reference', _ref: id})
const slug = (s) => ({_type: 'slug', current: s})
const link = (label, target) =>
  target.startsWith('/') || target.includes(':') ? {_type: 'link', label, url: target} : {_type: 'link', label, page: ref(target)}
const text = (...paras) => paras.map((p) => ({_type: 'block', style: 'normal', markDefs: [], children: [{_type: 'span', text: p, marks: []}]}))
const point = (icon, title, body) => ({_type: 'iconItem', icon, title, text: body})
const step = (title, body) => ({_type: 'step', title, text: body})
const qa = (question, answer) => ({_type: 'qa', question, answer})

const CONTACT = 'page-contact'
const PARTNER_FORM = '/contact?type=partner'
const PROJECT_LABEL = 'Illustrative scenario, not a client project.'

// ---------- service pages (shared structure so visitors can compare them) ----------
function service(p) {
  return {
    _id: p.id, _type: 'page', title: p.title, slug: slug(p.slug), parent: ref('page-services'), order: p.order,
    heading: p.heading, lede: p.lede, heroButton: link(p.button, CONTACT),
    summary: p.summary, bestFor: p.bestFor, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
    sections: [
      {_type: 'listBlock', heading: 'Common challenges', items: p.challenges},
      ...(p.whyNow ? [{_type: 'textBlock', heading: 'Why now', body: text(p.whyNow)}] : []),
      {_type: 'listBlock', heading: 'What we do', items: p.whatWeDo},
      {_type: 'listBlock', heading: 'Typical deliverables', items: p.deliverables, columns: true},
      {_type: 'textBlock', heading: 'What changes for your business', body: text(p.outcomes)},
      {_type: 'illustrative', heading: 'What this can look like', label: PROJECT_LABEL, items: [p.example]},
      {_type: 'faq', heading: 'Common questions', items: p.faqs.map(([q, a]) => qa(q, a))},
      {_type: 'cta', heading: p.cta[0], body: p.cta[1], button: link(p.button, CONTACT)},
      ...(p.smallPrint ? [{_type: 'smallPrint', text: p.smallPrint}] : []),
    ],
  }
}

export const servicePages = [
  service({
    id: 'page-svc-strategy', slug: 'data-strategy-architecture', order: 1, title: 'Data Strategy & Architecture',
    heading: 'Know where your data stands and what to build next.',
    lede: 'Before investing in a new platform or an AI program, you need a clear picture of what you have, what’s holding you back and which moves will pay off first. We give you that picture and a plan your teams can act on.',
    button: 'Plan your next step',
    summary: 'Assessments, roadmaps and target architecture that connect data investment to business priorities.',
    bestFor: 'leaders planning a modernization, a platform choice or an AI program.',
    seoTitle: 'Data Strategy & Architecture | Aikyanix Core',
    seoDescription: 'Assessments, target architecture and prioritized roadmaps that connect data investment to business priorities.',
    challenges: [
      'Every department has its own reports, tools and definitions.',
      'Platform decisions are driven by vendor pressure rather than requirements.',
      'AI is on the agenda, but nobody can say whether the data is ready.',
      'A roadmap exists, but it isn’t tied to budgets, owners or business priorities.',
    ],
    whatWeDo: [
      'Current-state assessments covering data sources, platforms, processes, skills and governance',
      'Target architecture for warehouse, lake or lakehouse designs, integration patterns and the semantic layer',
      'Platform and tool evaluation against your requirements, budget and team capability',
      'AI and analytics readiness reviews',
      'Prioritized, phased roadmaps with dependencies and effort ranges',
      'Architecture advisory while delivery is underway',
    ],
    deliverables: ['Current-state assessment report', 'Target architecture blueprint', 'Platform evaluation summary', 'Prioritized roadmap and quick-win list', 'Executive summary for decision makers'],
    outcomes: 'Investment decisions rest on evidence. Your first projects are the ones most likely to show value, and your architecture can take on new tools without starting over.',
    example: 'A mid-sized manufacturer runs its reporting from an on-premise warehouse and a collection of spreadsheets. An assessment maps its sources and pain points, compares two cloud platform options and produces a phased plan that starts with finance reporting.',
    faqs: [
      ['How long does an assessment take?', 'It depends on scope. Focused assessments are usually measured in weeks, not months, and we agree the scope and end date before we start.'],
      ['Do you only recommend platforms you implement?', 'No. We recommend what fits your situation, and sometimes that means improving what you already have.'],
      ['What do you need from our team?', 'A few conversations with business and technical owners, plus access to documentation and the relevant systems. We keep the demand on your people light.'],
    ],
    cta: ['Not sure where to start?', 'Tell us where things stand today. We’ll suggest a sensible first step, even if it’s a small one.'],
  }),
  service({
    id: 'page-svc-engineering', slug: 'data-engineering-integration', order: 2, title: 'Data Engineering & Integration',
    heading: 'Pipelines you don’t have to worry about.',
    lede: 'Reliable data starts with how it moves. We build and improve the pipelines and integrations that carry data from your applications into reporting and AI, with the testing and monitoring that keep it dependable.',
    button: 'Talk to a data engineer',
    summary: 'Pipelines, integrations and orchestration that move data reliably between the systems you depend on.',
    bestFor: 'teams dealing with fragile loads, manual extracts or disconnected systems.',
    seoTitle: 'Data Engineering & Integration | Aikyanix Core',
    seoDescription: 'Reliable batch and streaming pipelines, integrations and orchestration that connect your systems and cut manual work.',
    challenges: [
      'Loads fail overnight and nobody notices until a report is wrong.',
      'Analysts maintain manual extracts and spreadsheet joins.',
      'Every new data source takes months to bring in.',
      'Business rules are buried in scripts that only one person understands.',
    ],
    whatWeDo: [
      'Batch and streaming pipeline design and development',
      'Integration with ERP, CRM, operational databases, files and APIs',
      'Change data capture and incremental loading',
      'Transformation and data modeling in layered, testable patterns',
      'Orchestration, scheduling, alerting and failure recovery',
      'Refactoring and stabilizing existing pipelines',
    ],
    deliverables: ['Pipeline architecture and development standards', 'Production pipelines with documented logic', 'Automated data tests', 'Monitoring and alerting setup', 'Runbooks and handover sessions'],
    outcomes: 'Data arrives on time and complete. Manual effort drops, new sources come online faster, and people stop second-guessing the numbers.',
    example: 'A services company replaces twelve manual exports with scheduled pipelines from its CRM and billing systems. Alerts tell the data team about failures before business users notice them.',
    faqs: [
      ['Can you work with our existing tools?', 'Yes. We build on your current stack where it’s sound and suggest changes only where they solve a real problem.'],
      ['Will our team be able to maintain the pipelines?', 'That’s a design goal from day one. We follow clear standards, document the logic and run handover sessions.'],
    ],
    cta: ['Tired of fixing the same pipeline?', 'Tell us what’s breaking or what needs connecting. We’ll take a look and suggest a practical way forward.'],
  }),
  service({
    id: 'page-svc-platforms', slug: 'data-platforms-cloud-modernization', order: 3, title: 'Data Platforms & Cloud Modernization',
    heading: 'A data platform that fits how your business works now.',
    lede: 'Legacy warehouses and on-premise systems get harder to maintain and slower to change. We design, build and migrate to modern data warehouses, data lakes and lakehouse platforms in the cloud, without putting the reporting your business depends on at risk.',
    button: 'Discuss a modernization',
    summary: 'Design, build and migration of data warehouses, data lakes and lakehouse platforms in the cloud.',
    bestFor: 'organizations outgrowing legacy platforms or consolidating several of them.',
    seoTitle: 'Data Platforms & Cloud Migration | Aikyanix Core',
    seoDescription: 'Design, build and migration of data warehouses, data lakes and lakehouse platforms, without disrupting the business.',
    challenges: [
      'Queries are slow and storage costs keep climbing.',
      'The platform can’t handle new data types or volumes.',
      'Several overlapping warehouses hold slightly different versions of the truth.',
      'A vendor support deadline is forcing a decision.',
    ],
    whatWeDo: [
      'Platform selection and architecture for warehouse, lake and lakehouse designs',
      'New builds on modern cloud data platforms',
      'Migration planning: inventory, dependency mapping, sequencing and cutover',
      'Migration of data, transformation logic and reports, with reconciliation at each stage',
      'Legacy modernization, including SAP BW to SAP Datasphere',
      'Performance and cost tuning after migration',
    ],
    deliverables: ['Target platform design', 'Migration plan and wave schedule', 'Migrated and validated data and pipelines', 'Reconciliation reports', 'Decommissioning plan for the old platform', 'Operating guide'],
    outcomes: 'Faster analytics, more predictable costs, room to grow and one platform to govern instead of several. Your teams keep working while the change happens.',
    example: 'A retailer moves an on-premise SQL warehouse to a cloud platform in three waves. Old and new systems run side by side, and the numbers are reconciled before each report is switched over.',
    faqs: [
      ['Will our reports keep working during the migration?', 'That’s what we plan for: phased waves, parallel running and reconciliation before each cutover.'],
      ['Should we lift and shift, or redesign?', 'Usually a mix of both. We’ll show you where a redesign pays off and where a direct move is the sensible choice.'],
    ],
    cta: ['Planning a move or a rebuild?', 'Share where your platform is today and where it needs to be. We’ll help you work out a safe path between the two.'],
  }),
  service({
    id: 'page-svc-analytics', slug: 'analytics-bi-planning', order: 4, title: 'Analytics, BI & Planning',
    heading: 'Reporting people trust and actually use.',
    lede: 'Dashboards only matter if they answer real questions with numbers people believe. We build reporting, semantic models and planning solutions around the decisions your teams make.',
    button: 'Improve your reporting',
    summary: 'Dashboards, reporting, semantic models and planning solutions built around real decisions.',
    bestFor: 'businesses whose reports are slow, inconsistent or ignored.',
    seoTitle: 'Analytics, BI & Planning Services | Aikyanix Core',
    seoDescription: 'Dashboards, semantic models and planning solutions built on shared definitions that people trust and use.',
    challenges: [
      'Two reports show different figures for the same metric.',
      'Month-end reporting takes days of manual work.',
      'Dashboards exist, but few people open them.',
      'Planning and forecasting live in disconnected spreadsheets.',
    ],
    whatWeDo: [
      'KPI and metric definition with business owners',
      'Semantic models that give everyone the same definitions',
      'Executive and operational dashboards',
      'Self-service analytics setup and enablement',
      'Planning, budgeting and forecasting solutions, including SAP Analytics Cloud',
      'Rationalization and migration of existing reports',
    ],
    deliverables: ['Metric catalog', 'Semantic model', 'Dashboard suite', 'Planning models', 'User guides and training sessions'],
    outcomes: 'One set of trusted numbers, faster reporting cycles, less manual preparation and planning that’s connected to actual performance.',
    example: 'An operations leadership team replaces a 40-tab weekly workbook with a governed dashboard built on shared metric definitions and refreshed automatically each morning.',
    faqs: [
      ['Which BI tools do you work with?', 'SAP Analytics Cloud and [other BI and reporting tools]. If your current tool fits, we work with it.'],
      ['Can you help people adopt the reports?', 'Yes. We involve users early, design around the decisions they make and include training.'],
    ],
    cta: ['Want reporting people rely on?', 'Tell us which reports cause the most friction today. We’ll suggest where to start.'],
  }),
  service({
    id: 'page-svc-ai', slug: 'ai-machine-learning', order: 5, title: 'AI & Machine Learning',
    heading: 'AI that rests on data you can trust.',
    lede: 'Most AI efforts stall because of the data, not the model. We help you choose use cases worth pursuing, prepare the data foundations they need and build solutions that run reliably in production.',
    button: 'Explore an AI use case',
    summary: 'AI readiness, use-case selection and production-ready machine learning built on trustworthy data.',
    bestFor: 'organizations ready to move AI from idea or pilot to a working solution.',
    seoTitle: 'AI & Machine Learning Services | Aikyanix Core',
    seoDescription: 'AI readiness, use-case prioritization and production machine learning built on trustworthy data foundations.',
    challenges: [
      'AI pilots never make it past the demo.',
      'Use cases are chosen for novelty rather than value.',
      'Training data is incomplete, inconsistent or hard to reach.',
      'No one owns models once they’re live.',
    ],
    whatWeDo: [
      'AI readiness assessments covering data, governance, skills and infrastructure',
      'Use-case identification and prioritization by value and feasibility',
      'Data preparation and feature engineering pipelines',
      'Machine learning for forecasting, classification and anomaly detection',
      'Generative AI assistants and workflows that use your own governed data',
      'Deployment, monitoring and retraining processes',
    ],
    deliverables: ['Readiness assessment', 'Prioritized use-case shortlist', 'Data preparation pipelines', 'Working model or proof of concept', 'Deployment and monitoring setup', 'Documentation and handover'],
    outcomes: 'AI investment goes to use cases with a realistic path to value, built on data foundations that support the next use case as well.',
    example: 'A distributor tests a demand forecasting model on two product lines. It first fixes gaps in its historical sales data, then compares forecast accuracy against its current manual method before deciding whether to scale.',
    faqs: [
      ['We’re not sure our data is ready. Where do we start?', 'With a readiness assessment. It shows what you can use now and what needs work first.'],
      ['Do we need a new platform before we start with AI?', 'Often not. Many first use cases can start on the platform you already have. If something needs to change, we’ll explain why.'],
    ],
    cta: ['Have an AI idea worth testing?', 'Tell us the problem you want to solve. We’ll help you judge whether the data can support it and what a sensible first step looks like.'],
  }),
  service({
    id: 'page-svc-governance', slug: 'data-governance-quality-support', order: 6, title: 'Data Governance, Quality & Support',
    heading: 'Keep your data accurate, secure and running well.',
    lede: 'Building a platform is the start. Keeping it trustworthy takes clear ownership, quality checks, sensible access rules and someone watching performance. We set these up and can stay on to support them.',
    button: 'Strengthen your data foundation',
    summary: 'Governance, quality controls, performance tuning and ongoing support for what’s already running.',
    bestFor: 'teams that need their data platform accurate, secure and dependable day to day.',
    seoTitle: 'Data Governance & Quality | Aikyanix Core',
    seoDescription: 'Practical governance, data quality monitoring, performance tuning and ongoing support for your data platform.',
    challenges: [
      'No one is sure who owns a dataset or a definition.',
      'Data quality problems surface in executive meetings.',
      'Access is either too open or too slow to grant.',
      'Platform costs and query times creep upward.',
      'The people who built the platform have moved on.',
    ],
    whatWeDo: [
      'Practical governance models: ownership, definitions and access policies',
      'Data catalog, lineage and access control setup',
      'Automated data quality rules and monitoring',
      'Performance and cost optimization',
      'Ongoing support: monitoring, incident response, fixes and small enhancements',
      'Documentation and runbooks',
    ],
    deliverables: ['Governance framework', 'Access model', 'Data quality rules and dashboards', 'Optimization report', 'Support plan with agreed response expectations'],
    outcomes: 'Fewer data surprises, faster and safer access, controlled costs and a platform that stays healthy long after go-live.',
    example: 'A healthcare services company sets up ownership and quality checks for its patient-volume data, so reporting issues are caught in the pipeline rather than in the board pack.',
    faqs: [
      ['Does governance have to be a big, slow program?', 'No. We start with the data that matters most and expand from there.'],
      ['Can you support a platform you didn’t build?', 'Yes. We begin with a short review so we understand what we’re taking on.'],
    ],
    cta: ['Need your data to stay dependable?', 'Tell us what’s running today and where it worries you. We’ll suggest practical first steps.'],
  }),
  service({
    id: 'page-svc-sap', slug: 'sap-data-analytics', order: 7, title: 'SAP Data & Analytics',
    heading: 'SAP data and analytics, connected to the rest of your business.',
    lede: 'SAP systems hold much of an organization’s most important data. We help you model it, report on it, plan with it and modernize the platforms around it, and we connect it with the rest of your data landscape.',
    button: 'Talk about your SAP landscape',
    summary: 'Deep experience with SAP Datasphere, SAP Analytics Cloud and SAP BW modernization, connected to the rest of your data landscape.',
    seoTitle: 'SAP Datasphere & SAP Analytics Cloud | Aikyanix Core',
    seoDescription: 'SAP Datasphere, SAP Analytics Cloud and SAP BW modernization, connected to the rest of your data landscape.',
    challenges: [
      'SAP BW environments that are costly to maintain and hard to change.',
      'SAP and non-SAP data analyzed separately, with manual reconciliation in between.',
      'Reporting and planning split across SAP tools and spreadsheets.',
      'Uncertainty about when and how to modernize.',
    ],
    whyNow: 'SAP has announced that mainstream maintenance for SAP BW 7.5 runs until the end of 2027, with optional extended maintenance until the end of 2030. Many organizations are deciding now how to modernize without disrupting the reporting and planning they rely on.',
    whatWeDo: [
      'SAP Datasphere modeling, integration and data products',
      'SAP Analytics Cloud reporting, dashboards and planning',
      'SAP BW assessments and phased modernization to SAP Datasphere',
      'Integration of SAP and non-SAP data',
      'Performance tuning and support for existing SAP analytics environments',
    ],
    deliverables: ['Landscape assessment', 'Target design', 'Migration wave plan', 'SAP Datasphere models', 'SAP Analytics Cloud stories and planning models', 'Handover documentation'],
    outcomes: 'A clear modernization path, reporting and planning that keep running through the change, and SAP data that works alongside the rest of your business data.',
    example: 'A finance team on an aging SAP BW environment plans a phased move to SAP Datasphere. Existing reports keep running during the transition, and planning moves into SAP Analytics Cloud once the new models are validated.',
    faqs: [
      ['Do we need to move off SAP BW right away?', 'Not necessarily. We help you weigh timing, risk and cost, and plan a phased path that suits your situation.'],
      ['Can you combine SAP data with data from other systems?', 'Yes. Bringing SAP and non-SAP data together for reporting and analysis is a core part of this work.'],
    ],
    cta: ['Planning your next step with SAP?', 'Tell us about your current landscape and what you’re trying to achieve. We’ll help you map a practical way forward.'],
    // Doc: keep this trademark line at the bottom of the page.
    smallPrint: 'SAP, SAP Datasphere, SAP Analytics Cloud and SAP BW are trademarks or registered trademarks of SAP SE or its affiliates.',
  }),
]

const svcLink = (i) => servicePages[i]._id

// ---------- main pages ----------
export const mainPages = [
  {
    _id: 'page-home', _type: 'page', title: 'Home', slug: slug('home'), layout: 'landing',
    seoTitle: 'Data, Analytics & AI Consulting | Aikyanix Core',
    seoDescription: 'Experienced data consultants and engineers who design, build and support pipelines, platforms, reporting and AI foundations for organizations and consulting partners.',
    sections: [
      {
        _type: 'hero', eyebrow: 'Data, analytics and AI consulting',
        heading: 'Data and AI delivery, owned end to end.', highlight: 'owned end to end.',
        lede: 'Aikyanix Core brings together experienced data consultants and engineers who design, build and support the pipelines, platforms, reporting and AI foundations your business runs on. We work directly with organizations and as a delivery partner to consulting firms, and we stay accountable until the work holds up in production.',
        actions: [link('Discuss your project', CONTACT), link('Partner with us', 'page-partner')],
      },
      {
        _type: 'cards', heading: 'Two ways to work with us', style: 'post',
        items: [
          {_type: 'card', title: 'For organizations', text: 'You need advice, specialist skills, a platform built or modernized, or more hands on a project that’s already underway. We can lead the work or join your team.', link: link('How we work with clients', 'page-services')},
          {_type: 'card', title: 'For consulting and delivery partners', text: 'You’ve won the work and need dependable data, analytics or AI delivery behind it. We take on defined scope or embed in your team, and you decide how client communication runs.', link: link('Partner options', 'page-partner')},
        ],
      },
      {
        _type: 'iconGrid', heading: 'What we’re usually called in to fix', style: 'tiles',
        items: [
          point('chart', 'Reports that don’t agree.', 'Finance and operations bring different numbers to the same meeting.'),
          point('clock', 'Pipelines that fail quietly.', 'Overnight loads break and someone finds out from an unhappy stakeholder.'),
          point('flow', 'Systems that don’t connect.', 'ERP, CRM and operational data live apart, with manual joins in between.'),
          point('doc', 'Too much manual effort.', 'Analysts spend the week exporting and cleaning data instead of analyzing it.'),
          point('database', 'A platform that’s aging out.', 'Legacy warehouses and on-premise tools get harder and costlier to maintain.'),
          point('spark', 'AI plans waiting on data.', 'The use cases are clear, but the data can’t support them yet.'),
        ],
      },
      {
        _type: 'cards', heading: 'What we do', style: 'post',
        intro: 'Six areas of work that cover the data lifecycle, from first assessment to ongoing support. Most engagements draw on two or three.',
        items: [
          ['Data Strategy & Architecture', 'Know where you stand and what to build next.', 0],
          ['Data Engineering & Integration', 'Reliable pipelines that connect your systems.', 1],
          ['Data Platforms & Cloud Modernization', 'Warehouses, lakes and lakehouses that fit your scale.', 2],
          ['Analytics, BI & Planning', 'Reporting people trust and actually use.', 3],
          ['AI & Machine Learning', 'Use cases built on data that’s ready for them.', 4],
          ['Data Governance, Quality & Support', 'Keep data accurate, secure and running well.', 5],
        ].map(([title, body, i]) => ({_type: 'card', title, text: body, link: link('', svcLink(i))})),
        link: link('View all services', 'page-services'),
      },
      {
        _type: 'process', heading: 'Technology changes. Our discipline doesn’t.',
        intro: 'Data platforms change every year, and not every new capability belongs in your environment. We approach new technology the way experienced engineers should: with curiosity, and with a test.',
        steps: [
          step('Start with your environment.', 'We learn your systems, constraints and team before recommending anything.'),
          step('Weigh the options honestly.', 'We compare suitable approaches on fit, cost and maintainability, including the option of changing nothing.'),
          step('Prove it small.', 'A focused proof of concept answers the important questions before a large commitment.'),
          step('Build into what exists.', 'Useful solutions are integrated with your current systems, security and processes.'),
          step('Leave it maintainable.', 'Documentation and knowledge transfer are part of the work, not an afterthought.'),
        ],
        note: 'When something is new to us, we say so, learn it properly and test it before it reaches production.',
      },
      {
        _type: 'band', tone: 'dark', heading: 'Deep roots in SAP data and analytics',
        body: 'Much of our team’s experience sits in SAP data and analytics: modeling and integration in SAP Datasphere, reporting and planning in SAP Analytics Cloud, and modernizing SAP BW environments. We also work across cloud data platforms and the BI tools your teams already use, and we connect SAP data with the rest of your business. The platform follows the problem.',
        link: link('SAP data and analytics', svcLink(6)),
        smallPrint: 'Technologies named on this site reflect our team’s hands-on experience and do not indicate an official vendor partnership unless stated.',
      },
      {
        _type: 'iconGrid', heading: 'Why work with Aikyanix Core', style: 'columns',
        items: [
          point('users', 'Experienced people on the work.', 'The people who scope your project stay involved in delivering it.'),
          point('shield', 'Ownership, not hand-offs.', 'We take responsibility for agreed outcomes, raise problems early and finish what we start.'),
          point('check', 'Direct communication.', 'You speak with the people doing the work, and status updates are plain: done, blocked, next.'),
          point('target', 'Practical judgment.', 'We recommend what fits your situation, budget and team, even when that’s the simpler option.'),
          point('layers', 'Complementary skills.', 'Strategy, engineering, analytics and AI sit in one team, so work doesn’t stall at the seams.'),
        ],
      },
      {
        _type: 'band', tone: 'sand', eyebrow: 'For consulting firms', heading: 'A delivery partner for consulting firms',
        body: 'Consultancies, systems integrators and service providers bring us in when a project needs specialist data skills or more delivery capacity than their bench allows. We take on clearly defined work or join your team, follow your delivery standards and respect your client relationship.',
        button: link('Discuss a partner opportunity', 'page-partner'),
      },
      {
        _type: 'illustrative', heading: 'What this work can look like', label: 'Illustrative scenarios, not client case studies.',
        items: [
          'A distributor brings sales and inventory data from three systems into one governed cloud platform, and replaces a weekly spreadsheet process with scheduled, monitored pipelines.',
          'A finance team on an aging SAP BW environment plans a phased move to SAP Datasphere and keeps existing reports running during the transition.',
          'A consulting firm wins a reporting modernization program and adds two Aikyanix Core consultants, who work under its project lead to rebuild the reporting layer and planning models.',
        ],
      },
      {
        _type: 'cta', heading: 'Tell us what you’re working on.',
        body: 'Share a few details about your project or partnership need. We’ll reply within [X] business days with next steps, or an honest view if we’re not the right fit.',
        button: link('Start a conversation', CONTACT),
      },
    ],
  },
  {
    _id: 'page-about', _type: 'page', title: 'About', slug: slug('about'), order: 3,
    heading: 'Experienced people, working as one team.',
    lede: 'Aikyanix Core was formed by data professionals who had spent years delivering analytics, data engineering and platform work in enterprise environments. They wanted to do that work closer to the client, with clear ownership and no layers between the people asking the questions and the people building the answers.',
    seoTitle: 'About Us | Aikyanix Core',
    seoDescription: 'Meet the team behind Aikyanix Core: experienced data and AI professionals working as one team, with clear ownership and direct communication.',
    sections: [
      {_type: 'textBlock', heading: 'Why we started', body: text('Across our careers we saw what makes data projects succeed. It’s rarely the tool. It’s people who understand both the business question and the technical detail, who raise problems early, and who stay with the work until it’s dependable. We built a company around those habits, so clients and partners get them by default rather than by luck.')},
      {_type: 'textBlock', heading: 'What our name means', withLogo: true, body: text('Aikyanix comes from aikya, a Sanskrit word meaning oneness, unity and harmony. It describes us in two ways. Inside the company, it is people with different specialties working as one team. In our work, it is the job itself: bringing disconnected systems, data and teams together into something the business can rely on.')},
      {_type: 'textBlock', heading: 'The experience we bring', body: text('Our people have built their experience in data warehousing, SAP data and analytics, cloud data platforms, data integration, enterprise reporting and planning, and machine learning. They gained it in earlier roles with consulting firms, enterprises and delivery teams, before Aikyanix Core was formed. We bring that judgment to every engagement, along with a steady investment in learning newer platforms and AI tools as they mature.')},
      {
        _type: 'iconGrid', heading: 'How we work', style: 'tiles',
        items: [
          point('target', 'Own the outcome.', 'If we agree to deliver it, we’re accountable for it working.'),
          point('check', 'Say what we know, and what we don’t.', 'Clear estimates, honest risks, no surprises.'),
          point('layers', 'Fit the solution to the problem.', 'Technology choices follow business needs and delivery requirements.'),
          point('doc', 'Build for whoever inherits it.', 'Documented, tested and handed over properly.'),
          point('users', 'Keep it direct.', 'Short communication paths and decisions made by people who understand the work.'),
        ],
      },
      {_type: 'textBlock', heading: 'Where we’re headed', body: text('We’re building Aikyanix Core to grow through repeat work and referrals: clients who come back and partners who bring us into their next project. We’re based in the United States and plan to support clients in more regions as we grow.')},
      {_type: 'people', heading: 'Our people', intro: '[Leadership profiles to be supplied: photo, name, role, areas of focus, short bio and LinkedIn link]', items: []},
      {_type: 'textBlock', heading: 'Join us', body: text('We’re always glad to hear from experienced data engineers, analysts and architects. Write to us at [careers email address].')},
      {_type: 'cta', heading: 'Let’s talk', body: 'Whether you’re planning a project or looking for a delivery partner, we’d like to hear what you’re working on.', button: link('Start a conversation', CONTACT)},
    ],
  },
  {
    _id: 'page-services', _type: 'page', title: 'Services', slug: slug('services'), order: 1,
    heading: 'Data, analytics and AI services',
    lede: 'We cover the full data lifecycle: deciding what to build, building it, and keeping it reliable. Start with one area or combine several. Either way, the same experienced team carries the work through.',
    seoTitle: 'Data, Analytics & AI Services | Aikyanix Core',
    seoDescription: 'Strategy, engineering, platform modernization, analytics, AI and governance services that cover the full data lifecycle.',
    sections: [
      {_type: 'pageIndex', style: 'cards'},
      {
        _type: 'band', tone: 'dark', heading: 'Platform focus: SAP data and analytics',
        body: 'Deep experience with SAP Datasphere, SAP Analytics Cloud and SAP BW modernization, connected to the rest of your data landscape.',
        link: link('Explore SAP data and analytics', svcLink(6)),
      },
      {
        _type: 'badges', heading: 'Technologies we work with',
        items: ['SAP Datasphere', 'SAP Analytics Cloud', 'SAP BW', '[Cloud data platforms]', '[BI and reporting tools]', '[Other tools]'],
        smallPrint: 'Technologies listed reflect our team’s hands-on experience and do not indicate an official vendor partnership unless stated.',
      },
      {
        _type: 'iconGrid', heading: 'How engagements are shaped', style: 'tiles',
        items: [
          point('spark', 'Advisory.','Focused assessments and recommendations with a clear end point.'),
          point('target', 'Project delivery.', 'We own a defined scope from design to production.'),
          point('users', 'Team extension.', 'Our specialists join your team and work to your priorities.'),
          point('shield', 'Ongoing support.', 'Monitoring, fixes and improvements after go-live.'),
        ],
      },
      {_type: 'cta', heading: 'Not sure which service fits?', body: 'Tell us about the problem. We’ll point you to the right starting point.', button: link('Discuss your project', CONTACT)},
    ],
  },
  ...servicePages,
  {
    _id: 'page-partner', _type: 'page', title: 'Partner With Us', slug: slug('partner-with-us'), order: 2,
    eyebrow: 'For consulting firms and systems integrators',
    heading: 'A dependable delivery partner for consulting firms.',
    lede: 'You’ve won the work, or you’re about to. Aikyanix Core gives consultancies, systems integrators and service providers experienced data, analytics and AI specialists who deliver to your standards and protect your client relationship.',
    heroButton: link('Discuss a partner opportunity', PARTNER_FORM),
    seoTitle: 'Delivery Partner for Consulting Firms | Aikyanix Core',
    seoDescription: 'Subcontracting and delivery support for consultancies and systems integrators: defined-scope delivery or embedded data and AI specialists.',
    sections: [
      {_type: 'listBlock', heading: 'Who we work with', items: [
        'Consulting firms that need specialist data skills for a client program',
        'Systems integrators that need extra delivery capacity at short notice',
        'Technology service providers adding data and analytics to their offering',
        'Advisory firms that need a hands-on implementation team',
      ]},
      {_type: 'cards', heading: 'Ways we can work together', style: 'post', items: [
        {_type: 'card', title: 'Defined-scope delivery', text: 'We take responsibility for an agreed piece of work, such as a pipeline build, a migration wave or a reporting layer, with clear acceptance criteria and regular reporting to your project lead.'},
        {_type: 'card', title: 'Embedded specialists', text: 'Our consultants join your delivery team, follow your methods and tools, and work to your priorities.'},
      ]},
      {_type: 'listBlock', heading: 'Other options we can discuss', intro: 'Subject to agreement for each engagement.', items: [
        'Delivery under your brand, with client communication routed through you',
        'A dedicated team for a longer program',
        'Ongoing support for solutions after go-live',
      ]},
      {_type: 'listBlock', heading: 'How we protect your client relationship', items: [
        'You decide how we appear to the client and who communicates with them.',
        'We work under your contract terms, confidentiality agreements and non-solicitation clauses.',
        'We follow your delivery standards, tools and reporting rhythm.',
        'We raise risks with you first, early and in writing.',
      ]},
      {_type: 'process', heading: 'How a partnership starts', steps: [
        step('Share the opportunity.', 'Scope, timeline, skills needed and how you want us involved.'),
        step('We assess fit.', 'We confirm what we can deliver, who would do it and any risks we see.'),
        step('Agree terms.', 'Roles, communication rules, acceptance criteria and commercial model.'),
        step('Deliver and report.', 'Regular status updates to your lead, with handover built in.'),
      ]},
      {_type: 'listBlock', heading: 'Skills we bring', columns: true, items: [
        'Data strategy and architecture',
        'Data engineering and integration',
        'Cloud data platforms and migration',
        'BI, reporting and planning, including SAP Analytics Cloud',
        'SAP Datasphere and SAP BW modernization',
        'AI and machine learning',
        'Data governance and quality',
      ]},
      {_type: 'listBlock', heading: 'What helps us respond quickly', intro: 'When you get in touch, it helps to share:', columns: true, items: [
        'The project outcome and main deliverables',
        'The technical environment',
        'Timeline and start date',
        'Roles and skills needed',
        'Client-facing expectations',
        'Commercial model (fixed scope or time and materials)',
      ]},
      {_type: 'faq', heading: 'Common questions', items: [
        qa('Can you help with a proposal before the work is won?', 'Yes. We can help shape the technical approach and estimates so your proposal is grounded in delivery reality.'),
        qa('Will you contact our client directly?', 'Only in the way you agree. Your client relationship stays yours.'),
        qa('How quickly can you start?', 'It depends on the skills and timeline involved. Tell us your start date and we’ll be clear about what’s realistic.'),
        qa('Do you work on fixed-scope or time-and-materials terms?', 'Either, depending on the work. We’ll agree the model that suits the project before we start.'),
      ]},
      {_type: 'cta', heading: 'Have an opportunity in mind?', body: 'Share the scope, timeline and skills you need. We’ll come back with a clear view of what we can take on.', button: link('Discuss a partner opportunity', PARTNER_FORM)},
    ],
  },
  {
    _id: 'page-contact', _type: 'page', title: 'Contact', slug: slug('contact'), order: 4,
    heading: 'Start a conversation.',
    lede: 'Tell us what you’re working on. Whether you’re planning a project or looking for a delivery partner, we’ll reply within [X] business days.',
    seoTitle: 'Contact Us | Aikyanix Core',
    seoDescription: 'Tell us about your data, analytics or AI project, or a partnership opportunity. We’ll reply with next steps.',
    sections: [{
      _type: 'contact',
      intro: 'Share a few details and we’ll come back with next steps. There’s no obligation, and if we’re not the right fit, we’ll tell you.',
      directHeading: 'Other ways to reach us',
      success: 'Thanks, your message is with us. Someone from our team will reply within [X] business days. If it’s urgent, email us at [email address].',
      error: 'Something went wrong and your message wasn’t sent. Please try again, or email us at [email address].',
      consent: 'I agree to Aikyanix Core storing my details to respond to this enquiry, as described in the Privacy Policy.',
    }],
  },
  {
    _id: 'page-privacy', _type: 'page', title: 'Privacy Policy', slug: slug('privacy-policy'), order: 10, eyebrow: 'Legal',
    sections: [{_type: 'textBlock', body: text('[Privacy Policy text to be supplied]')}],
  },
  {
    _id: 'page-terms', _type: 'page', title: 'Terms of Use', slug: slug('terms-of-use'), order: 11, eyebrow: 'Legal',
    sections: [{_type: 'textBlock', body: text('[Terms of Use text to be supplied]')}],
  },
]

// ---------- site settings (fields this content owns) ----------
export const settings = {
  siteName: 'Aikyanix Core',
  logoSmall: 'Core',
  legalName: 'Aikyanix Core LLC',
  tagline: 'Data, analytics and AI consulting and delivery.',
  defaultDescription: 'Aikyanix Core is a data, analytics and AI consulting and delivery company. Our experienced team designs, builds and supports data platforms, pipelines, reporting and AI foundations for organizations and consulting partners.',
  homePage: ref('page-home'),
  nav: [link('Services', 'page-services'), link('Partner With Us', 'page-partner'), link('About', 'page-about'), link('Contact', CONTACT)],
  headerCta: link('Start a conversation', CONTACT),
  emails: ['[Email address]'],
  phone: '[Phone number]',
  office: '[Business address]',
  linkedin: '[LinkedIn page]',
  contactServices: [
    'Strategy & architecture', 'Data engineering & integration', 'Platforms & modernization', 'Analytics, BI & planning',
    'AI & machine learning', 'Governance, quality & support', 'SAP data & analytics', 'Not sure yet',
  ],
  companyLinks: [link('About', 'page-about'), link('Partner With Us', 'page-partner'), link('Contact', CONTACT)],
  footerLinks: [link('Privacy Policy', 'page-privacy'), link('Terms of Use', 'page-terms')],
  footerSmallPrint: 'Product names and trademarks mentioned on this site belong to their respective owners and are used for identification only.',
  notFoundHeading: 'We can’t find that page.',
  notFoundBody: 'It may have moved, or the link may be out of date.',
  currency: 'INR',
  redirects: [
    ['/privacy', '/privacy-policy'],
    ['/terms', '/terms-of-use'],
    ['/services/data-platforms', '/services/data-platforms-cloud-modernization'],
    ['/services/analytics-and-planning', '/services/analytics-bi-planning'],
    ['/services/warehouse-modernization', '/services/sap-data-analytics'],
    ['/about/leadership', '/about'],
    ['/careers', '/about'],
    ['/case-studies', '/'],
    ['/insights', '/'],
    ['/insights/*', '/'],
    ['/shop', '/'],
    ['/shop/*', '/'],
    ['/products/*', '/'],
  ].map(([from, to]) => ({_type: 'redirect', from, to})),
}
// Fields removed from settings by v2 (not in the doc).
export const settingsUnset = ['floatingCta', 'footerNote', 'shopPage']

export const keepPageIds = mainPages.map((p) => p._id)
