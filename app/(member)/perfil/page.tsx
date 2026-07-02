import EditProfileForm from "@/components/EditProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, bio, email")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <h1 className="font-cinzel text-xl text-vinho-prof">Meu perfil</h1>
      <p className="font-corpo text-sm text-texto-s">{profile?.email}</p>
      <EditProfileForm
        profile={{
          display_name: profile?.display_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          bio: profile?.bio ?? null,
        }}
      />
    </div>
  );
}
