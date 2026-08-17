'use client';
import { COLORS as C, COMPANY } from '@/lib/constants';
import { fmt, Btn } from './ui';
import { Modal } from './ui';

export default function Invoice({ sale, onClose }) {
  if (!sale) return null;
  const balance = (sale.total || 0) - (sale.paid || 0);

  const printInvoice = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${sale.id}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Times New Roman',serif;padding:40px;max-width:740px;margin:0 auto;color:#1A1A1A}
      .header{border-bottom:4px solid #D4A017;padding-bottom:16px;margin-bottom:20px}
      .brand{color:#1F6F43;font-size:24px;font-weight:bold}
      .sub{color:#666;font-size:13px;margin-top:4px}
      .invoice-title{font-size:28px;font-weight:bold;color:#1F6F43;margin:16px 0 8px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#165C35;color:#fff;padding:10px 12px;text-align:left;font-size:12px}
      td{padding:9px 12px;border-bottom:1px solid #e0e0d8;font-size:13px}
      tr:nth-child(even)td{background:#E8F5EE}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}
      .meta-item{font-size:13px}
      .meta-item strong{color:#165C35}
      .totals{margin-top:16px;border-top:2px solid #1F6F43;padding-top:12px}
      .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:14px}
      .grand-total{font-size:18px;font-weight:bold;color:#1F6F43;border-top:1px solid #ccc;margin-top:8px;padding-top:8px}
      .balance-owing{color:#C0392B;font-weight:bold}
      .balance-clear{color:#1F6F43;font-weight:bold}
      .footer{margin-top:32px;padding-top:12px;border-top:1px solid #ccc;font-size:12px;color:#888;font-style:italic}
      .no-print{margin-top:20px;display:flex;gap:12px}
      @media print{.no-print{display:none}}
    </style></head><body>
    <div class="header">
      <div class="brand">🌿 ${COMPANY.brand}</div>
      <div class="sub">${COMPANY.name} | ${COMPANY.location} | NAFDAC Registered</div>
      <div class="sub">${COMPANY.tagline}</div>
    </div>
    <div class="invoice-title">INVOICE</div>
    <div class="meta">
      <div class="meta-item"><strong>Invoice No:</strong> ${sale.id}</div>
      <div class="meta-item"><strong>Date:</strong> ${sale.date}</div>
      <div class="meta-item"><strong>Customer:</strong> ${sale.customer}</div>
      <div class="meta-item"><strong>Phone:</strong> ${sale.phone || 'N/A'}</div>
      <div class="meta-item"><strong>Payment Method:</strong> ${sale.method || 'N/A'}</div>
      <div class="meta-item"><strong>Delivery Status:</strong> ${sale.delivery || 'N/A'}</div>
    </div>
    <table>
      <tr><th>Product / Service</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr>
      <tr><td>${sale.product}</td><td style="text-align:center">${sale.qty}</td>
      <td>₦${Number(sale.price||0).toLocaleString()}</td>
      <td style="color:#C0392B">-₦${Number(sale.discount||0).toLocaleString()}</td>
      <td style="font-weight:bold">₦${Number(sale.total||0).toLocaleString()}</td></tr>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal:</span><span>₦${Number((sale.qty||1)*(sale.price||0)).toLocaleString()}</span></div>
      <div class="total-row"><span>Discount:</span><span style="color:#C0392B">-₦${Number(sale.discount||0).toLocaleString()}</span></div>
      <div class="total-row grand-total"><span>TOTAL AMOUNT:</span><span>₦${Number(sale.total||0).toLocaleString()}</span></div>
      <div class="total-row"><span>Amount Paid:</span><span class="balance-clear">₦${Number(sale.paid||0).toLocaleString()}</span></div>
      <div class="total-row grand-total"><span>Balance Owing:</span>
        <span class="${balance > 0 ? 'balance-owing' : 'balance-clear'}">${balance > 0 ? '₦'+Number(balance).toLocaleString()+' OUTSTANDING' : 'FULLY PAID ✓'}</span>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for choosing ${COMPANY.brand}. ${COMPANY.tagline}</p>
      <p>For enquiries: ${COMPANY.phone} | ${COMPANY.email}</p>
    </div>
    <div class="no-print">
      <button onclick="window.print()" style="background:#1F6F43;color:white;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold">🖨️ Print Invoice</button>
      <button onclick="window.close()" style="background:#eee;color:#333;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;font-size:14px">Close</button>
    </div>
    </body></html>`);
    w.document.close();
  };

  const shareInvoice = () => {
    const text = `*VEROCENT PURE ESSENCE — INVOICE*\nInvoice No: ${sale.id}\nCustomer: ${sale.customer}\nProduct: ${sale.product}\nTotal: ${fmt(sale.total)}\nPaid: ${fmt(sale.paid)}\nBalance: ${balance > 0 ? fmt(balance)+' OUTSTANDING' : 'FULLY PAID ✓'}\n\n_${COMPANY.tagline}_`;
    if (navigator.share) {
      navigator.share({ title: `Invoice ${sale.id}`, text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Invoice details copied to clipboard — paste into WhatsApp!'));
    }
  };

  return (
    <Modal title={`🧾 Invoice — ${sale.id}`} onClose={onClose}>
      {/* Preview */}
      <div style={{border:`2px solid ${C.green}`,borderRadius:10,padding:20,marginBottom:20}}>
        <div style={{borderBottom:`3px solid ${C.gold}`,paddingBottom:12,marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:800,color:C.green}}>🌿 {COMPANY.brand}</div>
          <div style={{fontSize:11,color:'#666'}}>{COMPANY.name} | {COMPANY.location} | NAFDAC Registered</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {[['Invoice No.',sale.id],['Date',sale.date],['Customer',sale.customer],
            ['Phone',sale.phone||'N/A'],['Payment',sale.method],['Delivery',sale.delivery]].map(([k,v])=>(
            <div key={k}><span style={{fontSize:11,color:'#888',fontWeight:700}}>{k}: </span>
            <span style={{fontSize:13,fontWeight:600}}>{v}</span></div>
          ))}
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:12}}>
          <thead><tr>{['Product','Qty','Unit Price','Discount','Total'].map(h=>(
            <th key={h} style={{background:C.dark,color:'#fff',padding:'8px 10px',textAlign:'left',fontSize:11}}>{h}</th>
          ))}</tr></thead>
          <tbody><tr style={{background:C.lightGreen}}>
            <td style={{padding:'9px 10px',fontSize:13}}>{sale.product}</td>
            <td style={{padding:'9px 10px',textAlign:'center'}}>{sale.qty}</td>
            <td style={{padding:'9px 10px'}}>{fmt(sale.price)}</td>
            <td style={{padding:'9px 10px',color:C.red}}>-{fmt(sale.discount||0)}</td>
            <td style={{padding:'9px 10px',fontWeight:700,color:C.dark}}>{fmt(sale.total)}</td>
          </tr></tbody>
        </table>
        <div style={{borderTop:`2px solid ${C.border}`,paddingTop:10}}>
          {[['Total Amount',fmt(sale.total),C.dark],
            ['Amount Paid',fmt(sale.paid),C.green],
            [balance>0?'Balance Owing':'Payment Status',balance>0?fmt(balance):'FULLY PAID ✓',balance>0?C.red:C.green]
          ].map(([k,v,c],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<2?`1px solid ${C.border}`:'none'}}>
              <span style={{fontSize:i===2?14:13,fontWeight:i===2?800:600}}>{k}</span>
              <span style={{fontSize:i===2?16:13,fontWeight:800,color:c}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Btn onClick={printInvoice} color='green'>🖨️ Print Invoice</Btn>
        <Btn onClick={printInvoice} color='blue'>⬇️ Save as PDF</Btn>
        <Btn onClick={shareInvoice} color='gold'>📤 Share via WhatsApp</Btn>
        <Btn onClick={onClose} color='grey' outline>Close</Btn>
      </div>
    </Modal>
  );
}
