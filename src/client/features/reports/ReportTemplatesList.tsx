import { LayoutTemplate, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/client/components/EmptyState";
import { RowActionsMenu } from "@/client/components/RowActionsMenu";
import { DropdownMenuItem } from "@/client/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { formatRelativeTime } from "@/client/lib/relative-time";
import type { ReportTemplate } from "@/types/schemas/report-templates";

export function ReportTemplatesList({
  templates,
  onEdit,
  onDelete,
}: {
  templates: ReportTemplate[];
  onEdit: (template: ReportTemplate) => void;
  onDelete: (template: ReportTemplate) => void;
}) {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={LayoutTemplate}
        title="Henüz şablon yok"
        description="Şablon, bir rapor türü için tekrar kullanılabilir bir özettir: kimin için olduğu, hangi bölümleri içerdiği ve nasıl bir üslupla yazıldığı."
      />
    );
  }

  return (
    <TableCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead>Güncellenme</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <button
                  type="button"
                  className="text-left font-medium hover:underline"
                  onClick={() => onEdit(template)}
                >
                  {template.name}
                </button>
              </TableCell>
              <TableCell className="max-w-[420px] text-muted-foreground">
                {template.description}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatRelativeTime(template.updatedAt)}
              </TableCell>
              <TableCell className="w-10 text-right">
                <RowActionsMenu label={`${template.name} için işlemler`}>
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Pencil />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(template)}
                  >
                    <Trash2 />
                    Sil
                  </DropdownMenuItem>
                </RowActionsMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}
