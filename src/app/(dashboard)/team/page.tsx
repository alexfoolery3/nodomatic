import { isDbConfigured } from "@/lib/env";
import { requireUser } from "@/lib/auth-guards";
import { listUsers } from "@/modules/prospector/data/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteUserForm } from "./invite-user-form";
import { UserRoleSelect } from "./user-role-select";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team" };

export default async function TeamPage() {
  if (!isDbConfigured) return null;
  const me = await requireUser();
  if (me.role !== "admin") {
    return <p className="text-sm text-neutral-600">Accesso riservato agli amministratori.</p>;
  }

  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-neutral-500">Gestione utenti interni e ruoli (PRD §2).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invita un membro</CardTitle>
          <CardDescription>
            Crea un account interno con una password iniziale, da comunicare alla persona.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteUserForm />
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-40">Ruolo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-neutral-600">{u.email}</TableCell>
                <TableCell>
                  <UserRoleSelect userId={u.id} value={u.role} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
