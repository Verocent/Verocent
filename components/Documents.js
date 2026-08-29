'use client';
import { useState } from 'react';

const SOPS = [
  {
    id: 'SOP-09',
    title: 'SOP-09 — Production Process',
    category: 'Production',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To define the standard process for manufacturing all Verocent Pure Essence hair care products in a safe, consistent, and NAFDAC-compliant manner.

SCOPE
Applies to all production staff involved in manufacturing Deep Hair Moisturizer, Herbal Hair Cream, Scalp & Hair Oil, Rinse-Out Conditioner, and Natural Shampoo.

RESPONSIBILITIES
- Production Manager: Supervises all production activities and approves each batch
- Production Staff: Follows this SOP for every production run
- QC Inspector: Tests and approves finished products before release
- Founder / CEO: Final authority on all production decisions

PROCEDURE

Step 1 — Pre-Production Check
1. Confirm the production schedule and batch quantity
2. Check that all raw materials are available and QC approved
3. Verify that all equipment is clean and in good working condition
4. Ensure all staff are wearing PPE — gloves, hairnet, apron, closed shoes
5. Record the batch number using format: [PREFIX]-[YYYYMMDD]-[0001]

Step 2 — Raw Material Weighing
1. Weigh all raw materials according to the approved formula
2. Double-check all measurements before combining
3. Record all quantities in the production log
4. Keep ingredients separated until ready to combine

Step 3 — Production / Mixing
1. Heat the oil phase ingredients to the required temperature
2. Heat the water phase ingredients separately
3. Combine phases slowly with continuous stirring
4. Add remaining ingredients after emulsification
5. Stir until a smooth, uniform consistency is achieved
6. Allow to cool to room temperature before filling

Step 4 — Quality Control Check
1. Test pH level — Conditioner: 4.0–5.5 | Shampoo: 5.0–6.5
2. Check viscosity, colour, and odour
3. Record all QC results in the QC log
4. QC Inspector approves or rejects the batch

Step 5 — Filling and Packaging
1. Fill into approved, clean containers
2. Cap and seal immediately after filling
3. Apply correct product label
4. Verify batch number, manufacturing date, and expiry date on label
5. Expiry date = Manufacturing date + 24 months

Step 6 — Batch Release
1. Production Manager reviews completed batch record
2. Founder / CEO gives final approval
3. Finished goods entered into inventory system
4. Batch record filed for NAFDAC traceability

RECORDS
- Production Log (in ERP — Production module)
- QC Log (in ERP — Production → QC Log tab)
- Raw Material Usage (in ERP — Inventory → Raw Materials)
    `
  },
  {
    id: 'SOP-10',
    title: 'SOP-10 — Cleaning & Sanitation',
    category: 'Production',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To ensure the production facility and all equipment are maintained in a clean, hygienic condition to prevent contamination of Verocent Pure Essence products.

SCOPE
Applies to all production staff and the entire manufacturing facility.

PROCEDURE

Daily Cleaning (Before and After Each Production Run)
1. Wipe down all work surfaces with approved sanitiser
2. Clean all mixing equipment thoroughly with hot water and detergent
3. Rinse all equipment with clean water — no soap residue
4. Allow equipment to dry completely before next use
5. Dispose of all waste materials properly
6. Sweep and mop the production floor
7. Clean filling equipment and packaging area

Weekly Cleaning
1. Deep clean all storage areas
2. Clean shelving and racking
3. Check and clean drains
4. Clean ceiling, walls, and vents if needed
5. Record weekly cleaning in the cleaning log

Monthly Cleaning
1. Full facility deep clean
2. Equipment maintenance check
3. Pest control inspection
4. Update fumigation records

RECORDS
- Daily Cleaning Log — signed by Production Manager
- Weekly Cleaning Record
- Monthly Deep Clean Record
- Fumigation Certificate — renewed annually
    `
  },
  {
    id: 'SOP-11',
    title: 'SOP-11 — Quality Control',
    category: 'Quality Control',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To ensure every batch of Verocent Pure Essence products meets the required quality standards before release for sale.

SCOPE
Applies to the QC Inspector and all production batches.

QC TESTS FOR EACH PRODUCT

Deep Hair Moisturizer (VPM)
- Appearance: Smooth, creamy white to off-white
- Odour: Pleasant herbal scent
- pH: 5.5–7.0
- Viscosity: Thick cream consistency

Herbal Hair Cream (VPHC)
- Appearance: Smooth, uniform cream
- Odour: Natural herbal scent
- pH: 5.0–7.0
- Viscosity: Medium-thick cream

Scalp & Hair Oil (VPSO)
- Appearance: Clear to slightly amber oil
- Odour: Natural oil scent
- pH: Not applicable (oil-based)
- Clarity: Clear — no cloudiness or separation

Rinse-Out Conditioner (VPRC)
- Appearance: Smooth, creamy consistency
- Odour: Light pleasant scent
- pH: 4.0–5.5 ← Critical for conditioner
- Viscosity: Pourable cream

Natural Shampoo (VPNS)
- Appearance: Clear to slightly opaque gel
- Odour: Fresh, clean scent
- pH: 5.0–6.5 ← Critical for shampoo
- Foam Test: Good lathering when shaken

PROCEDURE
1. Take sample from each batch before filling
2. Perform all applicable tests
3. Record results in QC Log in ERP
4. If all tests PASS — approve batch for filling
5. If any test FAILS — quarantine batch, inform Production Manager
6. Failed batches must be reviewed by Founder before disposal

PASS / FAIL DECISION
- All tests within specification: PASS — proceed to filling
- Any test outside specification: FAIL — do not fill — investigate
    `
  },
  {
    id: 'SOP-12',
    title: 'SOP-12 — Equipment Maintenance',
    category: 'Production',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To ensure all production equipment is maintained in good working condition to prevent breakdowns and contamination.

EQUIPMENT LIST
1. Industrial mixing equipment
2. Filling machine
3. Weighing scale
4. pH meter
5. Generator
6. Refrigerator / cold storage
7. Packaging equipment

MAINTENANCE SCHEDULE

Daily
- Clean all equipment after use
- Check for visible damage or wear
- Report any issues to Production Manager immediately

Weekly
- Lubricate moving parts as required
- Check calibration of weighing scale
- Check pH meter calibration with buffer solution
- Clean filters and strainers

Monthly
- Full equipment inspection
- Test generator under load
- Check cold storage temperature accuracy
- Record all maintenance in equipment log

Annually
- Professional service for major equipment
- Replace worn parts
- Update equipment list in ERP

REPORTING FAULTS
- Minor fault: Report to Production Manager same day
- Major fault: Report to Founder immediately
- Do NOT use faulty equipment — quarantine it
    `
  },
  {
    id: 'SOP-13',
    title: 'SOP-13 — Product Recall',
    category: 'Compliance',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To provide a clear procedure for recalling any Verocent Pure Essence product that poses a risk to consumers or does not meet quality standards.

WHEN TO INITIATE A RECALL
- NAFDAC directs a recall
- Consumer complaint of adverse reaction
- Internal discovery of quality failure in released batch
- Contamination discovered after release

RECALL PROCEDURE

Step 1 — Alert (Within 1 hour of discovery)
1. Inform Founder / CEO immediately
2. Founder contacts NAFDAC recall department
3. Stop all sales of affected batch immediately

Step 2 — Identify Affected Batch (Within 2 hours)
1. Check batch number in ERP — Production module
2. Identify all units produced in that batch
3. Check sales records — identify all customers who received affected batch
4. Check inventory — quarantine all remaining units

Step 3 — Customer Notification (Within 24 hours)
1. Contact all affected customers by phone and WhatsApp
2. Inform them of the recall — do not cause panic
3. Arrange collection or return of affected products
4. Offer full refund or replacement

Step 4 — NAFDAC Reporting (Within 48 hours)
1. Submit written recall notice to NAFDAC
2. Include: batch number, number of units, reason for recall
3. Document all steps taken

Step 5 — Investigation and Closure
1. Investigate root cause of the quality issue
2. Implement corrective action
3. Update SOPs if needed
4. Submit closure report to NAFDAC

CONTACTS
- NAFDAC Recall Hotline: 0800-162-3322
- Founder: Available 24/7 for recall decisions

RECORDS
- Recall log maintained in ERP — Compliance module
- All recall documents filed for NAFDAC inspection
    `
  },
  {
    id: 'HR-01',
    title: 'HR-01 — Staff Code of Conduct',
    category: 'Human Resources',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To define the standards of behaviour expected from all Verocent Global Limited staff.

CORE VALUES
Every staff member is expected to uphold:
1. INTEGRITY — Be honest in all dealings
2. EXCELLENCE — Do your work to the highest standard
3. RESPECT — Treat colleagues and customers with dignity
4. RESPONSIBILITY — Own your role and your actions
5. LOYALTY — Protect company information and reputation

GENERAL CONDUCT
1. Report to work on time — punctuality is mandatory
2. Wear your uniform and PPE at all times in the production area
3. Maintain personal hygiene — especially in production
4. Never share your ERP login credentials with anyone
5. Do not take photos of production processes without permission
6. Do not share company information with competitors or outsiders

SOCIAL MEDIA
1. Do not post company products, processes, or staff without approval
2. All social media content about Verocent must be approved by the Founder
3. Personal posts must not bring the company into disrepute

DISCIPLINARY ACTIONS
- First offence: Verbal warning
- Second offence: Written warning
- Third offence: Suspension or termination

CONFIDENTIALITY
All staff must keep the following confidential:
- Product formulas and ingredients
- Customer information
- Financial information
- Staff salaries
- Business strategies and plans
    `
  },
  {
    id: 'HR-02',
    title: 'HR-02 — Staff Onboarding Procedure',
    category: 'Human Resources',
    version: '1.0',
    effective: '2024-09-01',
    content: `
PURPOSE
To ensure every new staff member is properly introduced to Verocent Global Limited and prepared for their role.

ONBOARDING CHECKLIST

Before First Day
- [ ] Employment letter issued and signed
- [ ] Staff ID created in ERP
- [ ] ERP login credentials assigned
- [ ] PPE and uniform provided
- [ ] Work schedule confirmed

First Day
- [ ] Welcome meeting with Founder
- [ ] Introduction to all team members
- [ ] Tour of production facility
- [ ] Review of Staff Code of Conduct (HR-01)
- [ ] ERP training — login and module access
- [ ] Review of relevant SOPs for their role

First Week
- [ ] Shadow senior staff member for 3 days
- [ ] Complete all SOP reading and sign acknowledgement
- [ ] Demonstrate understanding of their role
- [ ] First week check-in with Production Manager

First Month
- [ ] Performance review at end of Month 1
- [ ] Confirm permanent assignment or extend probation
- [ ] Update staff record in ERP

ERP ACCESS BY ROLE
- Production Manager: Dashboard, Products, Production, Inventory
- Sales Executive: Dashboard, Products, Sales & Invoicing
- QC Inspector: Dashboard, Production, Inventory
- Social Media Manager: Dashboard, Products
- Accountant: Dashboard, Finance, Reports
    `
  },
];

const CATEGORIES = ['All', 'Production', 'Quality Control', 'Compliance', 'Human Resources'];

function Badge({ label, color='green' }) {
  const map = {
    green:{b:'#E8F5EE',t:'#165C35'}, blue:{b:'#EBF5FB',t:'#1A56DB'},
    gold:{b:'#FDF6E3',t:'#7D4E00'}, red:{b:'#FADBD8',t:'#C0392B'},
    navy:{b:'#E8ECF0',t:'#1B2631'},
  };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,
    padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function catColor(cat) {
  if(cat==='Production') return 'green';
  if(cat==='Quality Control') return 'blue';
  if(cat==='Compliance') return 'gold';
  if(cat==='Human Resources') return 'navy';
  return 'green';
}

export default function Documents({ currentUser }) {
  const [category,   setCategory]   = useState('All');
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [acknowledged, setAcknowledged] = useState({});

  const filtered = SOPS.filter(s => {
    const matchCat    = category==='All' || s.category===category;
    const matchSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAcknowledge = async (sopId) => {
    setAcknowledged(prev=>({...prev,[sopId]:true}));
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('audit_logs').insert({
        user_email:  currentUser?.email,
        user_name:   currentUser?.full_name,
        action:      'READ',
        module:      'Documents',
        description: `${currentUser?.full_name} acknowledged ${sopId}`,
        device:      navigator.userAgent.includes('Mobile')?'Mobile':'Desktop',
        status:      'Success',
      }).catch(()=>{});
    } catch(e){}
    alert(`✅ ${sopId} acknowledged! This has been recorded in the audit log.`);
  };

  const printSOP = (sop) => {
    const w = window.open('','_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${sop.id}</title>
    <style>
      body{font-family:'Times New Roman',serif;padding:40px;max-width:800px;margin:0 auto}
      h1{color:#1F6F43;border-bottom:3px solid #D4A017;padding-bottom:10px}
      h2{color:#165C35;margin-top:20px}
      pre{white-space:pre-wrap;font-family:'Times New Roman',serif;font-size:14px;line-height:1.6}
      .meta{color:#888;font-size:13px;margin-bottom:20px}
      .footer{margin-top:40px;padding-top:12px;border-top:1px solid #ccc;font-size:12px;color:#888}
      @media print{button{display:none}}
    </style></head><body>
    <h1>🌿 VEROCENT GLOBAL LIMITED</h1>
    <h2>${sop.title}</h2>
    <div class="meta">
      Version: ${sop.version} | Effective: ${sop.effective} | Category: ${sop.category}
    </div>
    <pre>${sop.content}</pre>
    <div class="footer">
      Pure Care with Verocent — Nature's Touch for Healthy Hair<br/>
      Verocent Global Limited | Kaduna, Nigeria | NAFDAC Registered
    </div>
    <br/>
    <button onclick="window.print()" 
      style="background:#1F6F43;color:white;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;font-size:14px">
      🖨️ Print SOP
    </button>
    </body></html>`);
    w.document.close();
  };

  return (
    <div>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1B2631,#165C35)',
        borderRadius:14,padding:'20px 24px',marginBottom:20,
        display:'flex',justifyContent:'space-between',
        alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{color:'#D4A017',fontWeight:800,fontSize:18,
            fontFamily:'sans-serif'}}>📋 Documents & SOPs</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,
            fontFamily:'sans-serif',marginTop:4}}>
            Standard Operating Procedures and Company Documents
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,
          fontFamily:'sans-serif',textAlign:'right'}}>
          {SOPS.length} documents available<br/>
          {Object.keys(acknowledged).length} acknowledged
        </div>
      </div>

      {/* Info box */}
      <div style={{background:'#E8F5EE',border:'1px solid #1F6F43',
        borderRadius:8,padding:'12px 16px',marginBottom:16,
        fontSize:13,fontFamily:'sans-serif',color:'#165C35'}}>
        📌 All staff must read and acknowledge their relevant SOPs.
        Click <strong>✅ Acknowledge</strong> after reading each document.
        This is recorded in the Audit Log for NAFDAC compliance.
      </div>

      {/* Search and filter */}
      <div style={{background:'#fff',borderRadius:12,
        border:'1px solid #C9C9C0',padding:'16px 20px',marginBottom:16}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder='🔍 Search documents...'
            style={{flex:2,minWidth:200,border:'1px solid #C9C9C0',
              borderRadius:6,padding:'8px 12px',fontSize:13,
              fontFamily:'sans-serif',boxSizing:'border-box'}}/>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {CATEGORIES.map(cat=>(
              <button key={cat} onClick={()=>setCategory(cat)}
                style={{padding:'6px 14px',borderRadius:20,
                  border:`2px solid ${category===cat?'#1F6F43':'#C9C9C0'}`,
                  background:category===cat?'#E8F5EE':'#fff',
                  fontSize:12,fontWeight:700,cursor:'pointer',
                  fontFamily:'sans-serif',
                  color:category===cat?'#165C35':'#1A1A1A'}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',
        gridTemplateColumns:selected?'1fr 1.5fr':'1fr',
        gap:20,alignItems:'start'}}>

        {/* Document list */}
        <div>
          {filtered.map(sop=>(
            <div key={sop.id}
              onClick={()=>setSelected(sop)}
              style={{
                background:selected?.id===sop.id?'#E8F5EE':'#fff',
                border:`2px solid ${selected?.id===sop.id?'#1F6F43':'#C9C9C0'}`,
                borderRadius:12,padding:'16px 18px',marginBottom:12,
                cursor:'pointer',transition:'all 0.15s',
              }}>
              <div style={{display:'flex',justifyContent:'space-between',
                alignItems:'flex-start',gap:8,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <code style={{background:'#FDF6E3',color:'#7D4E00',
                      padding:'2px 8px',borderRadius:4,fontSize:12,
                      fontWeight:700}}>{sop.id}</code>
                    <Badge label={sop.category} color={catColor(sop.category)}/>
                    {acknowledged[sop.id]&&<Badge label='✅ Acknowledged' color='green'/>}
                  </div>
                  <div style={{fontWeight:700,fontSize:13,color:'#165C35',
                    fontFamily:'sans-serif',marginBottom:4}}>{sop.title}</div>
                  <div style={{fontSize:11,color:'#888',fontFamily:'sans-serif'}}>
                    Version {sop.version} | Effective: {sop.effective}
                  </div>
                </div>
                <div style={{fontSize:20}}>
                  {selected?.id===sop.id?'📖':'📄'}
                </div>
              </div>
            </div>
          ))}

          {filtered.length===0&&(
            <div style={{padding:40,textAlign:'center',
              color:'#888',fontFamily:'sans-serif'}}>
              <div style={{fontSize:30,marginBottom:8}}>📋</div>
              No documents match your search.
            </div>
          )}
        </div>

        {/* Document viewer */}
        {selected&&(
          <div style={{background:'#fff',borderRadius:14,
            border:'1px solid #C9C9C0',overflow:'hidden',
            position:'sticky',top:20}}>
            {/* Header */}
            <div style={{background:'#1F6F43',padding:'14px 20px',
              display:'flex',justifyContent:'space-between',
              alignItems:'center',flexWrap:'wrap',gap:8}}>
              <div>
                <div style={{color:'#D4A017',fontWeight:800,fontSize:13,
                  fontFamily:'sans-serif'}}>{selected.id}</div>
                <div style={{color:'#fff',fontWeight:700,fontSize:14,
                  fontFamily:'sans-serif'}}>{selected.title}</div>
              </div>
              <button onClick={()=>setSelected(null)}
                style={{background:'none',border:'none',color:'#fff',
                  fontSize:24,cursor:'pointer',lineHeight:1}}>×</button>
            </div>

            {/* Meta */}
            <div style={{padding:'12px 20px',background:'#FDF6E3',
              borderBottom:'1px solid #C9C9C0',
              display:'flex',gap:16,flexWrap:'wrap'}}>
              {[
                ['Category',selected.category],
                ['Version',selected.version],
                ['Effective',selected.effective],
              ].map(([k,v])=>(
                <div key={k} style={{fontFamily:'sans-serif',fontSize:12}}>
                  <span style={{color:'#888'}}>{k}: </span>
                  <strong style={{color:'#165C35'}}>{v}</strong>
                </div>
              ))}
            </div>

            {/* Content */}
            <div style={{padding:20,maxHeight:500,overflowY:'auto'}}>
              <pre style={{
                whiteSpace:'pre-wrap',fontFamily:'Arial,sans-serif',
                fontSize:13,lineHeight:1.7,color:'#1A1A1A',
              }}>
                {selected.content.trim()}
              </pre>
            </div>

            {/* Actions */}
            <div style={{padding:'16px 20px',borderTop:'1px solid #C9C9C0',
              display:'flex',gap:10,flexWrap:'wrap',background:'#F9F9F7'}}>
              <button onClick={()=>handleAcknowledge(selected.id)}
                disabled={acknowledged[selected.id]}
                style={{
                  background:acknowledged[selected.id]?'#aaa':'#1F6F43',
                  color:'#fff',border:'none',borderRadius:8,
                  padding:'10px 18px',fontWeight:700,fontSize:13,
                  cursor:acknowledged[selected.id]?'not-allowed':'pointer',
                  fontFamily:'sans-serif',
                }}>
                {acknowledged[selected.id]?'✅ Acknowledged':'✅ I Have Read This SOP'}
              </button>
              <button onClick={()=>printSOP(selected)}
                style={{background:'#1A56DB',color:'#fff',border:'none',
                  borderRadius:8,padding:'10px 18px',fontWeight:700,
                  fontSize:13,cursor:'pointer',fontFamily:'sans-serif'}}>
                🖨️ Print SOP
              </button>
              <button onClick={()=>setSelected(null)}
                style={{background:'transparent',color:'#888',
                  border:'2px solid #C9C9C0',borderRadius:8,
                  padding:'10px 18px',fontWeight:700,fontSize:13,
                  cursor:'pointer',fontFamily:'sans-serif'}}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}