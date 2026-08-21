'use client';
import { useState } from 'react';
import { db } from '@/lib/supabase';
import { RM_CATEGORIES } from '@/lib/constants';
import { Card, Table, Badge, Btn, Input, Select, Modal, AlertBox, KPI, Grid, exportCSV, fmt, daysTo } from './ui';

const blankRM  = { name:'', category:'', supplier:'', qty:'0', unit:'kg', cost:'', expiry:'', location:'', status:'Accepted', reorder:'10' };
const blankSup = { name:'', contact:'', phone:'', email:'', materials:'', lead_time:'', rating:'5', compliance:'Compliant', location:'' };

export default function Inventory({ rawMaterials, setRawMaterials, products, setProducts, suppliers, setSuppliers }) {
  const [tab,    setTab]    = useState('raw');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [rmMove, setRmMove] = useState(null); // {id, type:'receive'|'use', qty:''}
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  // ── RAW MATERIALS ──────────────────────────────
  const saveRM = async () => {
    if (!form.name) return alert('Material name is required.');
    setSaving(true);
    const payload = {...form, qty:Number(form.qty)||0, cost:Number(form.cost)||0, reorder:Number(form.reorder)||10};
    try {
      if (modal==='add-rm') {
        const row = await db.addRawMaterial(payload);
        setRawMaterials(prev=>[...prev, row||{...payload,id:Date.now()}]);
      } else {
        await db.updateRawMaterial(form.id, payload);
        setRawMaterials(prev=>prev.map(r=>r.id===form.id?{...payload,id:form.id}:r));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const delRM = async (id,name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    await db.deleteRawMaterial(id).catch(()=>{});
    setRawMaterials(prev=>prev.filter(r=>r.id!==id));
  };

  const handleMove = async () => {
    const q = Number(rmMove.qty);
    if (!q || q<=0) return alert('Enter a valid quantity.');
    const rm   = rawMaterials.find(r=>r.id===rmMove.id);
    const newQty = rmMove.type==='receive' ? (rm.qty||0)+q : Math.max(0,(rm.qty||0)-q);
    try {
      await db.updateRawMaterial(rmMove.id, {...rm, qty:newQty});
      setRawMaterials(prev=>prev.map(r=>r.id===rmMove.id?{...r,qty:newQty}:r));
    } catch(e){ alert('Error: '+e.message); }
    setRmMove(null);
  };

  // ── FINISHED GOODS ─────────────────────────────
    // ── FINISHED GOODS EDIT & DELETE ──────────────────
  const saveFG = async () => {
    if (!form.name || !form.price) return alert('Product name and price are required.');
    setSaving(true);
    const payload = {
      ...form,
      cost: Number(form.cost)||0,
      price: Number(form.price)||0,
      stock: Number(form.stock)||0,
      reorder: Number(form.reorder)||20,
    };
    try {
      await db.updateProduct(form.id, payload);
      setProducts(prev => prev.map(p => p.id===form.id ? {...payload, id:form.id} : p));
      setModal(null);
    } catch(e) { alert('Error: '+e.message); }
    setSaving(false);
  };

  const delFG = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await db.deleteProduct(id).catch(()=>{});
    setProducts(prev => prev.filter(p => p.id !== id));
  };
  const adjustStock = async (p, type) => {
    const q = Number(prompt(`Enter quantity to ${type==='add'?'add to':'remove from'} ${p.name} stock:`));
    if (!q || q<=0) return;
    const newStock = type==='add' ? (p.stock||0)+q : Math.max(0,(p.stock||0)-q);
    try {
      await db.updateProduct(p.id, {...p, stock:newStock});
      setProducts(prev=>prev.map(x=>x.id===p.id?{...x,stock:newStock}:x));
    } catch(e){ alert('Error: '+e.message); }
  };

  // ── SUPPLIERS ──────────────────────────────────
  const saveSup = async () => {
    if (!form.name) return alert('Supplier name required.');
    setSaving(true);
    try {
      if (modal==='add-sup') {
        const row = await db.addSupplier(form);
        setSuppliers(prev=>[...prev, row||{...form,id:Date.now()}]);
      } else {
        await db.updateSupplier(form.id, form);
        setSuppliers(prev=>prev.map(s=>s.id===form.id?{...form,id:form.id}:s));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const delSup = async (id,name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    await db.deleteSupplier(id).catch(()=>{});
    setSuppliers(prev=>prev.filter(s=>s.id!==id));
  };

  const tabs = [['raw','🌿 Raw Materials'],['finished','📦 Finished Goods'],['suppliers','🤝 Suppliers']];

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {tabs.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
              background:tab===k?'#1F6F43':'#eee',color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── RAW MATERIALS ── */}
      {tab==='raw' && (
        <Card title='Raw Materials Inventory' icon='🌿'
          actions={[
            <Btn key='a' small color='gold' onClick={()=>{setForm({...blankRM});setModal('add-rm');}}>+ Add Material</Btn>,
            <Btn key='e' small color='blue' onClick={()=>exportCSV(rawMaterials,'raw-materials.csv')}>⬇️ Export</Btn>,
          ]}>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            <KPI label='Total RM Value'    value={fmt(rawMaterials.reduce((s,r)=>s+(r.qty||0)*(r.cost||0),0))} color='#165C35' bg='#E8F5EE'/>
            <KPI label='Materials in Stock' value={rawMaterials.length} color='#165C35' bg='#E8F5EE'/>
            <KPI label='Low / Reorder'     value={rawMaterials.filter(r=>(r.qty||0)<=(r.reorder||10)).length} color='#C0392B' bg='#FADBD8'/>
            <KPI label='Expiring (90 days)'value={rawMaterials.filter(r=>r.expiry&&daysTo(r.expiry)<=90).length} color='#E67E22' bg='#FEF9E7'/>
          </div>
          <Table
            headers={['Material','Category','Supplier','Qty','Unit','Unit Cost','Total Value','Expiry','Location','QC','Alert','Actions']}
            rows={rawMaterials.map(r=>{
              const d = r.expiry ? daysTo(r.expiry) : 999;
              return [
                <span style={{fontWeight:700,color:'#165C35'}}>{r.name}</span>,
                r.category, r.supplier,
                <span style={{fontWeight:700,color:(r.qty||0)<=(r.reorder||10)?'#C0392B':'#1A1A1A'}}>{r.qty}</span>,
                r.unit, fmt(r.cost),
                <span style={{fontWeight:700,color:'#165C35'}}>{fmt((r.qty||0)*(r.cost||0))}</span>,
                r.expiry||'—',
                r.location||'—',
                <Badge label={r.status} color={r.status==='Accepted'?'green':'red'}/>,
                d<=30?<Badge label='🚨 EXPIRING' color='red'/>:(r.qty||0)<=(r.reorder||10)?<Badge label='⚠️ REORDER' color='red'/>:<Badge label='✅ OK' color='green'/>,
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  <Btn small color='green' onClick={()=>setRmMove({id:r.id,type:'receive',qty:''})}>+ Receive</Btn>
                  <Btn small color='amber' onClick={()=>setRmMove({id:r.id,type:'use',qty:''})}>- Use</Btn>
                  <Btn small color='blue'  onClick={()=>{setForm({...r,qty:String(r.qty),cost:String(r.cost)});setModal('edit-rm');}}>Edit</Btn>
                  <Btn small color='red'   onClick={()=>delRM(r.id,r.name)}>Del</Btn>
                </div>,
              ];
            })}
          />
        </Card>
      )}

      {/* ── FINISHED GOODS ── */}
            {/* ── FINISHED GOODS ── */}
      {tab==='finished' && (
        <Card title='Finished Goods Inventory' icon='📦'
          actions={[
            <Btn key='e' small color='blue' onClick={()=>exportCSV(products,'finished-goods.csv')}>⬇️ Export</Btn>,
          ]}>
          <Table
            headers={['Product','Size','Cost Price','Sell Price','In Stock','Stock Value','Reorder At','Status','Actions']}
            rows={products.map(p=>[
              <span style={{fontWeight:700,color:'#165C35'}}>{p.name}</span>,
              p.size||'—', fmt(p.cost), fmt(p.price),
              <span style={{fontWeight:800,fontSize:15,color:p.stock<=p.reorder?'#C0392B':'#165C35'}}>{p.stock} units</span>,
              <span style={{fontWeight:700,color:'#165C35'}}>{fmt((p.stock||0)*(p.price||0))}</span>,
              p.reorder,
              p.stock<=0?<Badge label='🚨 OUT' color='red'/>:p.stock<=p.reorder?<Badge label='⚠️ LOW' color='amber'/>:<Badge label='✅ OK' color='green'/>,
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                <Btn small color='green' onClick={()=>adjustStock(p,'add')}>+ Add Stock</Btn>
                <Btn small color='amber' onClick={()=>adjustStock(p,'remove')}>- Remove</Btn>
                <Btn small color='blue'  onClick={()=>{setForm({...p,cost:String(p.cost),price:String(p.price),stock:String(p.stock),reorder:String(p.reorder)});setModal('edit-fg');}}>✏️ Edit</Btn>
                <Btn small color='red'   onClick={()=>delFG(p.id,p.name)}>🗑 Del</Btn>
              </div>,
            ])}
          />
        </Card>
      )}

      {/* ── SUPPLIERS ── */}
      {tab==='suppliers' && (
        <Card title='Supplier Register' icon='🤝'
          actions={[
            <Btn key='a' small color='gold' onClick={()=>{setForm({...blankSup});setModal('add-sup');}}>+ Add Supplier</Btn>,
            <Btn key='e' small color='blue' onClick={()=>exportCSV(suppliers,'suppliers.csv')}>⬇️ Export</Btn>,
          ]}>
          <Table
            headers={['Name','Contact','Phone','Email','Materials Supplied','Lead Time','Rating','Location','Compliance','Actions']}
            rows={suppliers.map(s=>[
              <span style={{fontWeight:700,color:'#165C35'}}>{s.name}</span>,
              s.contact, s.phone, s.email||'—', s.materials, s.lead_time||s.leadTime||'—',
              '⭐'.repeat(Number(s.rating)||0),
              s.location||'—',
              <Badge label={s.compliance} color={s.compliance==='Compliant'?'green':'red'}/>,
              <div style={{display:'flex',gap:6}}>
                <Btn small color='blue' onClick={()=>{setForm({...s});setModal('edit-sup');}}>Edit</Btn>
                <Btn small color='red'  onClick={()=>delSup(s.id,s.name)}>Del</Btn>
              </div>,
            ])}
          />
        </Card>
      )}

      {/* Receive / Use Modal */}
      {rmMove && (() => {
        const rm = rawMaterials.find(r=>r.id===rmMove.id);
        return (
          <Modal title={rmMove.type==='receive'?'📥 Receive Raw Material':'📤 Record Material Used'} onClose={()=>setRmMove(null)}>
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:14}}>
              <strong>{rm?.name}</strong> — Current stock: <strong>{rm?.qty} {rm?.unit}</strong>
            </div>
            <Input label={rmMove.type==='receive'?'Quantity Received':'Quantity Used'} type='number'
              value={rmMove.qty} onChange={v=>setRmMove(p=>({...p,qty:v}))}/>
            {rmMove.qty&&Number(rmMove.qty)>0&&(
              <div style={{background:'#E8F5EE',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
                New stock will be: <strong style={{color:'#165C35'}}>
                  {rmMove.type==='receive'?(rm?.qty||0)+Number(rmMove.qty):Math.max(0,(rm?.qty||0)-Number(rmMove.qty))} {rm?.unit}
                </strong>
              </div>
            )}
            <div style={{display:'flex',gap:10}}>
              <Btn onClick={handleMove} color={rmMove.type==='receive'?'green':'amber'}>{rmMove.type==='receive'?'Confirm Receipt':'Confirm Usage'}</Btn>
              <Btn onClick={()=>setRmMove(null)} color='grey' outline>Cancel</Btn>
            </div>
          </Modal>
        );
      })()}

      {/* Add/Edit Raw Material */}
      {(modal==='add-rm'||modal==='edit-rm')&&(
        <Modal title={modal==='add-rm'?'Add Raw Material':'Edit Raw Material'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Material Name' value={form.name} onChange={v=>f('name',v)} required/>
            <Select label='Category' value={form.category} onChange={v=>f('category',v)} options={RM_CATEGORIES}/>
            <Input label='Supplier' value={form.supplier} onChange={v=>f('supplier',v)}/>
            <Select label='Unit' value={form.unit} onChange={v=>f('unit',v)} options={['kg','g','L','ml','pcs','bottles','bags']}/>
            <Input label='Quantity' type='number' value={form.qty} onChange={v=>f('qty',v)}/>
            <Input label='Unit Cost (₦)' type='number' value={form.cost} onChange={v=>f('cost',v)}/>
            <Input label='Expiry Date' type='date' value={form.expiry} onChange={v=>f('expiry',v)}/>
            <Input label='Storage Location' value={form.location} onChange={v=>f('location',v)} placeholder='e.g. Store Room A'/>
            <Input label='Reorder Point' type='number' value={form.reorder} onChange={v=>f('reorder',v)}/>
            <Select label='QC Status' value={form.status} onChange={v=>f('status',v)} options={['Accepted','Rejected','Pending']}/>
          </Grid>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={saveRM} color='green' disabled={saving}>{saving?'Saving…':'Save Material'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

            {/* Edit Finished Good Modal */}
      {modal==='edit-fg'&&(
        <Modal title='✏️ Edit Finished Good' onClose={()=>setModal(null)}>
          <div style={{background:'#EBF5FB',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,fontFamily:'sans-serif',color:'#1A56DB'}}>
            ✏️ Editing: <strong>{form.name}</strong> — all changes save to both Inventory and Products.
          </div>
          <Grid cols={2}>
            <Input label='Product Name *' value={form.name} onChange={v=>setForm(p=>({...p,name:v}))}/>
            <Input label='Product Code'   value={form.code} onChange={v=>setForm(p=>({...p,code:v}))}/>
            <Input label='Batch Prefix'   value={form.prefix} onChange={v=>setForm(p=>({...p,prefix:v}))}/>
            <Input label='Pack Size'      value={form.size}   onChange={v=>setForm(p=>({...p,size:v}))} placeholder='e.g. 250g'/>
            <Input label='Cost Price (₦)' type='number' value={form.cost}    onChange={v=>setForm(p=>({...p,cost:v}))}/>
            <Input label='Sell Price (₦)' type='number' value={form.price}   onChange={v=>setForm(p=>({...p,price:v}))}/>
            <Input label='Current Stock'  type='number' value={form.stock}   onChange={v=>setForm(p=>({...p,stock:v}))}/>
            <Input label='Reorder Point'  type='number' value={form.reorder} onChange={v=>setForm(p=>({...p,reorder:v}))}/>
            <Select label='Status' value={form.status} onChange={v=>setForm(p=>({...p,status:v}))} options={['Active','Inactive','Discontinued']}/>
          </Grid>
          {form.cost&&form.price&&(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,fontFamily:'sans-serif'}}>
              Profit/unit: <strong style={{color:'#165C35'}}>{fmt(Number(form.price)-Number(form.cost))}</strong>
              {' '}| Margin: <strong style={{color:'#165C35'}}>{Number(form.price)>0?(((Number(form.price)-Number(form.cost))/Number(form.price))*100).toFixed(1)+'%':'—'}</strong>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveFG} color='green' disabled={saving}>{saving?'Saving…':'Save Changes'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
      {/* Add/Edit Supplier */}
      {(modal==='add-sup'||modal==='edit-sup')&&(
        <Modal title={modal==='add-sup'?'Add Supplier':'Edit Supplier'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Supplier Name' value={form.name} onChange={v=>f('name',v)} required/>
            <Input label='Contact Person' value={form.contact} onChange={v=>f('contact',v)}/>
            <Input label='Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Input label='Email' value={form.email} onChange={v=>f('email',v)}/>
            <Input label='Materials Supplied' value={form.materials} onChange={v=>f('materials',v)}/>
            <Input label='Lead Time' value={form.lead_time} onChange={v=>f('lead_time',v)} placeholder='e.g. 3 days'/>
            <Select label='Rating' value={form.rating} onChange={v=>f('rating',v)} options={['1','2','3','4','5']}/>
            <Input label='Location (City)' value={form.location} onChange={v=>f('location',v)}/>
            <Select label='Compliance' value={form.compliance} onChange={v=>f('compliance',v)} options={['Compliant','Non-Compliant','Pending Review']}/>
          </Grid>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={saveSup} color='green' disabled={saving}>{saving?'Saving…':'Save Supplier'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
