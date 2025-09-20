
import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function ReceiptPage({ params }:{ params:{ orderId: string } }){
  const sb = supabaseAdmin();
  const { data: order } = await sb.from('orders').select('*').eq('id', params.orderId).single();
  const { data: customer } = order ? await sb.from('customers').select('*').eq('id', order.customer_id).single() : { data: null };

  return (
    <div className="max-w-2xl mx-auto p-6 card">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold"><span className="text-brand">RP Studios</span> — Receipt</div>
        <div className="text-sm">Printed: {new Date().toLocaleString()}</div>
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <K label="Account #">{customer?.account_no || '—'}</K>
        <K label="Order ID">{order?.id || '—'}</K>
        <K label="Customer">{customer?.business_name || '—'}</K>
        <K label="Email">{customer?.email || '—'}</K>
      </div>
      <div className="mt-4">
        <div className="font-medium mb-1">Totals</div>
        <div className="text-sm">Estimated MRC: ${order?.estimated_mrc?.toFixed?.(2) ?? order?.estimated_mrc}</div>
        <div className="text-sm">Setup Fee: ${order?.setup_fee?.toFixed?.(2) ?? order?.setup_fee}</div>
        <div className="text-sm">Status: {order?.status}</div>
      </div>
      <div className="text-xs text-gray-500 mt-6 text-center">
        Built by <span className="text-brand font-medium">RP Studios</span>
      </div>
    </div>
  );
}

function K({label, children}:{label:string; children:any}){
  return (
    <div className="border rounded-md p-3 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
