import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SOSRequest {
  contacts: { name: string; phone: string }[];
  message: string;
  latitude?: number;
  longitude?: number;
  userName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is authenticated — extract their JWT from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a client with the user's token to verify auth and fetch their contacts
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SOSRequest = await req.json();

    if (!body.contacts || !Array.isArray(body.contacts) || body.contacts.length === 0) {
      return new Response(JSON.stringify({ error: "No contacts provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security: fetch the user's actual contacts from the database rather than
    // trusting the client-provided list. This prevents sending SMS to arbitrary numbers.
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: dbContacts, error: contactsError } = await serviceClient
      .from("trusted_contacts")
      .select("name, phone, receives_sos_alerts")
      .eq("user_id", userData.user.id)
      .eq("receives_sos_alerts", true);

    if (contactsError) {
      return new Response(JSON.stringify({ error: "Could not verify contacts" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dbContacts || dbContacts.length === 0) {
      return new Response(JSON.stringify({ error: "No contacts with SOS alerts enabled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the SMS body with real GPS location
    const userName = body.userName || "A Tinewe user";
    const baseMessage = body.message || "I am using Tinewe and may need assistance. This is an automated safety alert.";

    let locationLine = "";
    if (typeof body.latitude === "number" && typeof body.longitude === "number") {
      const mapsUrl = `https://www.google.com/maps?q=${body.latitude},${body.longitude}`;
      locationLine = `\nLive location: ${mapsUrl}`;
    }

    const smsBody = `TINEWE SOS ALERT\n${userName} may need assistance.\n${baseMessage}${locationLine}`;

    // Twilio credentials from edge function secrets
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!accountSid || !authToken || !twilioFrom) {
      // Twilio not configured — return a clear status so the UI can inform the user
      return new Response(
        JSON.stringify({
          error: "SMS service not configured",
          detail: "Twilio credentials are not set. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER as edge function secrets.",
          contacts: dbContacts.length,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send SMS to each verified contact via Twilio
    const results: { phone: string; success: boolean; error?: string }[] = [];

    for (const contact of dbContacts) {
      // Normalize phone number: strip spaces, ensure leading +
      const cleanPhone = contact.phone.replace(/[\s()-]/g, "");
      const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : "+" + cleanPhone;

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append("To", formattedPhone);
        formData.append("From", twilioFrom);
        formData.append("Body", smsBody);

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (twilioRes.ok) {
          results.push({ phone: contact.phone, success: true });
        } else {
          const errData = await twilioRes.json().catch(() => ({}));
          results.push({
            phone: contact.phone,
            success: false,
            error: errData.message || `HTTP ${twilioRes.status}`,
          });
        }
      } catch (err) {
        results.push({
          phone: contact.phone,
          success: false,
          error: err instanceof Error ? err.message : "Network error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    // Record the SOS event in the activity log
    await serviceClient.from("activity_logs").insert({
      user_id: userData.user.id,
      type: "sos-sent",
      title: "SOS alert sent",
      description: `Emergency SMS sent to ${successCount} of ${results.length} contact(s)${failedCount > 0 ? ` (${failedCount} failed)` : ""}`,
      icon: "siren",
    });

    // Record an in-app notification
    await serviceClient.from("app_notifications").insert({
      user_id: userData.user.id,
      title: "SOS alert sent",
      body: `Emergency SMS sent to ${successCount} of ${results.length} contact(s).${failedCount > 0 ? " Some deliveries failed." : ""}`,
      type: "emergency",
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalContacts: results.length,
        delivered: successCount,
        failed: failedCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        detail: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
