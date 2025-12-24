import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is authenticated and is a founder
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is founder
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || roleData.role !== 'founder') {
      console.log('Access denied. User is not founder:', user.id);
      return new Response(
        JSON.stringify({ error: 'Access denied. Founder role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...payload } = await req.json();
    console.log(`Processing user management action: ${action}`);

    let responseData;

    switch (action) {
      case 'list-users':
        responseData = await listUsers(supabaseClient);
        break;
      case 'update-role':
        responseData = await updateUserRole(supabaseClient, payload);
        break;
      case 'toggle-active':
        responseData = await toggleUserActive(supabaseClient, payload);
        break;
      case 'create-user':
        responseData = await createUser(supabaseAdmin, supabaseClient, payload);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Valid actions: list-users, update-role, toggle-active, create-user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`${action} completed successfully`);
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function listUsers(supabase: any) {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id, user_id, full_name, phone, is_active, created_at,
      user_roles (role)
    `)
    .order('created_at', { ascending: false });

  if (profileError) throw profileError;

  return {
    users: profiles?.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      phone: p.phone,
      is_active: p.is_active,
      role: p.user_roles?.[0]?.role || 'worker',
      created_at: p.created_at,
    })) || [],
    total: profiles?.length || 0,
  };
}

async function updateUserRole(supabase: any, { user_id, new_role }: { user_id: string; new_role: string }) {
  if (!user_id || !new_role) {
    throw new Error('user_id and new_role are required');
  }

  const validRoles = ['founder', 'manager', 'worker', 'customer'];
  if (!validRoles.includes(new_role)) {
    throw new Error(`Invalid role. Valid roles: ${validRoles.join(', ')}`);
  }

  // Update or insert role
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id, role: new_role }, { onConflict: 'user_id, role' });

  if (error) throw error;

  console.log(`Updated role for user ${user_id} to ${new_role}`);

  return {
    success: true,
    message: `User role updated to ${new_role}`,
    user_id,
    new_role,
  };
}

async function toggleUserActive(supabase: any, { user_id, is_active }: { user_id: string; is_active: boolean }) {
  if (!user_id || is_active === undefined) {
    throw new Error('user_id and is_active are required');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('user_id', user_id);

  if (error) throw error;

  console.log(`User ${user_id} is now ${is_active ? 'active' : 'inactive'}`);

  return {
    success: true,
    message: `User ${is_active ? 'activated' : 'deactivated'}`,
    user_id,
    is_active,
  };
}

async function createUser(
  supabaseAdmin: any,
  supabaseClient: any,
  { email, password, full_name, phone, role }: { 
    email: string; 
    password: string; 
    full_name: string; 
    phone?: string; 
    role: string;
  }
) {
  if (!email || !password || !full_name || !role) {
    throw new Error('email, password, full_name, and role are required');
  }

  const validRoles = ['manager', 'worker'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role for new user. Valid roles: ${validRoles.join(', ')}`);
  }

  // Create user with admin client
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createError) throw createError;

  // Update profile with phone
  if (phone && newUser.user) {
    await supabaseAdmin
      .from('profiles')
      .update({ phone })
      .eq('user_id', newUser.user.id);
  }

  // Update role (trigger creates default worker role)
  if (role !== 'worker' && newUser.user) {
    await supabaseAdmin
      .from('user_roles')
      .update({ role })
      .eq('user_id', newUser.user.id);
  }

  console.log(`Created new user: ${email} with role: ${role}`);

  return {
    success: true,
    message: `User created successfully`,
    user: {
      id: newUser.user?.id,
      email: newUser.user?.email,
      full_name,
      role,
    },
  };
}
