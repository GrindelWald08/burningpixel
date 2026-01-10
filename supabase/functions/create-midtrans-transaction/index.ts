import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTransactionRequest {
  packageId: string;
  packageName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { packageId, packageName, amount, customerName, customerEmail, customerPhone }: CreateTransactionRequest = await req.json();

    // Validate required fields
    if (!packageName || !amount || !customerName || !customerEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user ID from auth header if available
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Create order in database first
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        package_id: packageId || null,
        package_name: packageName,
        amount: amount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Midtrans Snap transaction
    const transactionPayload = {
      transaction_details: {
        order_id: order.id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
        phone: customerPhone || "",
      },
      item_details: [
        {
          id: packageId || "package",
          price: amount,
          quantity: 1,
          name: packageName.substring(0, 50), // Midtrans has 50 char limit
        },
      ],
      callbacks: {
        finish: `${req.headers.get("origin")}/payment/success?order_id=${order.id}`,
        error: `${req.headers.get("origin")}/payment/failed?order_id=${order.id}`,
        pending: `${req.headers.get("origin")}/payment/success?order_id=${order.id}`,
      },
    };

    // Use Sandbox URL for testing, change to production URL when live
    const midtransUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions";
    
    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${btoa(serverKey + ":")}`,
      },
      body: JSON.stringify(transactionPayload),
    });

    if (!midtransResponse.ok) {
      const errorData = await midtransResponse.text();
      console.error("Midtrans API error:", errorData);
      
      // Update order status to failed
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);

      throw new Error("Failed to create Midtrans transaction");
    }

    const midtransResult = await midtransResponse.json();

    // Update order with Midtrans details (reusing xendit columns for compatibility)
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        xendit_invoice_id: midtransResult.token,
        xendit_invoice_url: midtransResult.redirect_url,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        token: midtransResult.token,
        redirectUrl: midtransResult.redirect_url,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in create-midtrans-transaction:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
