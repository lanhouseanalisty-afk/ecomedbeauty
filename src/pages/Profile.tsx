import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Save, Loader2, KeyRound, Ticket, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { LoyaltyPoints } from "@/components/profile/LoyaltyPoints";
import { ReferralSection } from "@/components/profile/ReferralSection";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  must_change_password: boolean;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data as any);
        setMustChangePassword((data as any).must_change_password === true);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o perfil.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    async function fetchTickets() {
      if (!user) return;
      setLoadingTickets(true);
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("requester_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
    }

    if (user) {
      fetchProfile();
      fetchTickets();
    }
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mustChangePassword) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <ChangePasswordForm onSuccess={() => setMustChangePassword(false)} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Meu Perfil | MedBeauty</title>
        <meta name="description" content="Gerencie suas informações de perfil" />
      </Helmet>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8 text-center sm:text-left">
          Meu Perfil
        </h1>

        <div className="space-y-6">
          {/* Avatar Section */}
          {user && (
            <AvatarUpload
              userId={user.id}
              avatarUrl={profile?.avatar_url || null}
              fullName={profile?.full_name || null}
              onAvatarChange={(url) => setProfile((p) => p ? { ...p, avatar_url: url } : null)}
            />
          )}

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loyalty Points */}
          {user && <LoyaltyPoints userId={user.id} />}

          {/* Referral Section */}
          {user && <ReferralSection userId={user.id} />}

          {/* Order History */}
          {user && <OrderHistory userId={user.id} />}

          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Meus Chamados de Suporte
              </CardTitle>
              <CardDescription>
                Acompanhe o status dos seus pedidos de ajuda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTickets ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm line-clamp-1">{ticket.title}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            #{ticket.ticket_number || ticket.id.slice(0, 8)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${ticket.status === 'open' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              ticket.status === 'closed' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          } border-none text-[10px]`}>
                          {ticket.status === 'open' ? 'Aberto' :
                            ticket.status === 'in_progress' ? 'Em Andamento' :
                              ticket.status === 'resolved' ? 'Resolvido' :
                                ticket.status === 'closed' ? 'Fechado' : 'Pendente'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-primary"
                          onClick={() => navigate('/crm/tech/comunicar-ti')}
                        >
                          Ver Histórico
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Ticket className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Você não possui chamados abertos.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/crm/tech/comunicar-ti')}
                  >
                    Abrir Chamado
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

