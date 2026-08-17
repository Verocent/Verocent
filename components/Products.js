'use client';
import { useState } from 'react';
import { db } from '@/lib/supabase';
import { Card, Table, Badge, Btn, Input, Select, Modal, AlertBox, Grid, exportCSV, fmt } from './ui';

const blank = { name:'', code:'', prefix:'', size:'', cost:'', price:'', stock:'0', reorder:'20', status:'Active' };

export default function Products({ products, setProducts }) {
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form,  setForm]  = useState({});
  const [saving,setSaving]= useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const openAdd  = ()  => { setForm({...blank}); setModal('add'); };
  const openEdit = (p) => { setForm({...p,cost:String(p.cost),price:String(p.price)}); setModal('edit'); };

  const save = async () => {
    if (!form.name || !form.price) return alert('Product Name and Selling Price are required.');
    setSaving(true);
    const payload = { ...form, cost:Number(form.cost)||0, price:Number(form.price)||0,
                      stock:Number(form.stock)||0, reorder:Number(form.reorder)||20 };
    try {
      if (modal === 'add') {
        const row = await db.addProduct(payload);
        setProducts(prev => [...prev, row||{...payload,id:Date.now()}]);
      } else {
        await db.updateProduct(form.id, payload);
        setProducts(prev => prev.map(p => p.id===form.id ? {...payload,id:form.id} : p));
      }
      setModal(null);
    } catch(e) { alert('Error saving: '+e.message); }
    setSaving(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await db.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch(e) { alert('Error: '+e.message); }
  };

  const margin = (cost,price) => price>0 ? (((price-cost)/price)*100).toFixed(0)+'%' : '—';

  return (
    <div>
      <Card title='Product Catalogue — All 5 Products' icon='🧴'
        actions={[
          <Btn key='a' small color='gold'  onClick={openAdd}>+ Add Product</Btn>,
          <Btn key='e' small color='blue'  onClick={()=>exportCSV(products,'verocent-products.csv')}>⬇️ Export CSV</Btn>,
        ]}>
        <AlertBox type='info'>
          All 5 NAFDAC-registered products listed. Use <strong>+ Add Product</strong> whenever you register a new product with NAFDAC.
        </AlertBox>
        <Table
          headers={['Product Name','Code','Prefix','Size','Cost Price','Sell Price','In Stock','Reorder At','Margin','Status','Actions']}
          rows={products.map(p=>[
            <span style={{fontWeight:700,color:'#165C35'}}>{p.name}</span>,
            <code style={{fontSize:11,background:'#FDF6E3',padding:'2px 6px',borderRadius:4}}>{p.code}</code>,
            <Badge label={p.prefix} color='gold'/>,
            p.size||'—', fmt(p.cost), fmt(p.price),
            <Badge label={`${p.stock} units`} color={p.stock<=0?'red':p.stock<=p.reorder?'red':p.stock<=p.reorder*1.5?'amber':'green'}/>,
            p.reorder,
            <span style={{color:'#165C35',fontWeight:700}}>{margin(p.cost,p.price)}</span>,
            <Badge label={p.status} color={p.status==='Active'?'green':'amber'}/>,
            <div style={{display:'flex',gap:6}}>
              <Btn small color='blue' onClick={()=>openEdit(p)}>Edit</Btn>
              <Btn small color='red'  onClick={()=>del(p.id,p.name)}>Del</Btn>
            </div>,
          ])}
        />
      </Card>

      {modal && (
        <Modal title={modal==='add'?'Add New Product':'Edit Product'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Product Name' value={form.name} onChange={v=>f('name',v)} required/>
            <Input label='Product Code' value={form.code} onChange={v=>f('code',v)} placeholder='e.g. VPE-DHM'/>
            <Input label='Batch Prefix' value={form.prefix} onChange={v=>f('prefix',v)} placeholder='e.g. VPM'/>
            <Input label='Pack Size'    value={form.size}   onChange={v=>f('size',v)}   placeholder='e.g. 250g'/>
            <Input label='Cost Price (₦)' type='number' value={form.cost}  onChange={v=>f('cost',v)} required/>
            <Input label='Sell Price (₦)' type='number' value={form.price} onChange={v=>f('price',v)} required/>
            <Input label='Current Stock (units)' type='number' value={form.stock}  onChange={v=>f('stock',v)}/>
            <Input label='Reorder Point (units)' type='number' value={form.reorder} onChange={v=>f('reorder',v)}/>
            <Select label='Status' value={form.status} onChange={v=>f('status',v)} options={['Active','Inactive','Discontinued']}/>
          </Grid>
          {form.cost&&form.price&&(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
              💰 Profit per unit: <strong style={{color:'#165C35'}}>{fmt(Number(form.price)-Number(form.cost))}</strong>
              {' '}| Margin: <strong style={{color:'#165C35'}}>{margin(Number(form.cost),Number(form.price))}</strong>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={save} color='green' disabled={saving}>{saving?'Saving…':'Save Product'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
