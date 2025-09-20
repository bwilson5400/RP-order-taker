
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { formatAccountNo } from '@/lib/account';

export async function POST(req: NextRequest){
  const payload = await req.json().catch(()=>null);

  const sb = supabaseAdmin();

  // Lookup customer by email from payload.data (placeholder fields)
  const email = (payload?.data?.email || '').toLowerCase() || 'customer@example.com';
  const phone = payload?.data?.phone || null;

  let customer = null as any;

  if (email) {
    const { data } = await sb.from('customers').select('*').ilike('email', email).limit(1);
    customer = data?.[0] || null;
  }
  if (!customer && phone) {
    const { data } = await sb.from('customers').select('*').eq('phone', phone).limit(1);
    customer = data?.[0] || null;
  }

  if (!customer) {
    // Generate account number
    const { data: seqData } = await sb.rpc('nextval', { seq: 'customer_account_seq' } as any);
    const seq = typeof seqData === 'number' ? seqData : Math.floor(Math.random()*99999)+1;
    const account_no = formatAccountNo(seq, new Date());

    const ins = await sb.from('customers').insert({
      account_no,
      business_name: payload?.data?.business_name || 'Webhook Customer',
      contact_name: payload?.data?.contact_name || '',
      email,
      phone,
      status: 'active',
      external_ids: { square_payment_id: payload?.data?.id || 'demo' },
    }).select('*').single();
    customer = ins.data;
  }

  // Create a paid order stub (attach to customer)
  const orderIns = await sb.from('orders').insert({
    customer_id: customer.id,
    plan_id: 'pro',
    promo_codes: [],
    waive_setup: false,
    status: 'paid',
    estimated_mrc: 99,
    setup_fee: 99,
  }).select('*').single();

  // Create payment record
  await sb.from('payments').insert({
    order_id: orderIns.data?.id,
    provider: 'square',
    intent_id: payload?.data?.payment_id || 'demo-intent',
    status: 'succeeded',
    amount: 99,
    receipt_url: payload?.data?.receipt_url || null,
  });

  // Optionally: POST to Website Builder webhook with { customer, order }
  // const url = process.env.WEBSITE_BUILDER_WEBHOOK_URL;
  // if (url) await fetch(url, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ customer, order: orderIns.data }) });

  return NextResponse.json({ ok: true, account_no: customer.account_no, order_id: orderIns.data?.id });
}
