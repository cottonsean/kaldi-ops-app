import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import TechDashboard from '../../../components/Ops/TechDashboard';
import { Technician } from '../../mockDB';

export const dynamic = 'force-dynamic';

export default async function TechDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Map Supabase record to Technician interface
  const tech: Technician = {
    id: profile.slug,
    name: profile.name,
    companyName: profile.company,
    photoUrl: profile.headshot_url,
    bio: '', // Bio currently not in Supabase schema but easy to add later
    credentials: profile.credentials as string[],
    references: profile.references as any[]
  };

  return <TechDashboard tech={tech} />;
}
