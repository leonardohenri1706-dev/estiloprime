import { z } from "zod";

export const CATEGORIES = ["POLOS", "CAMISETAS", "BERMUDAS", "CONJUNTOS", "ACESSORIOS"] as const;
export type CategoryEnum = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = ["PENDING", "PREPARING", "DELIVERED", "CANCELLED"] as const;
export type OrderStatusEnum = (typeof ORDER_STATUSES)[number];

export const SIZES = ["P", "M", "G", "GG"] as const;

export const variantSchema = z.object({
  size: z.enum(SIZES),
  stock: z.coerce.number().int().min(0).max(999),
});
export type VariantInput = z.infer<typeof variantSchema>;

export const productSchema = z.object({
  name: z.string().min(3, "Nome muito curto").max(80),
  description: z.string().max(600).optional().or(z.literal("")),
  price: z.coerce.number().positive("Preço deve ser positivo").max(9999),
  oldPrice: z.coerce.number().nonnegative().max(9999).optional(),
  category: z.enum(CATEGORIES),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url("URL inválida")).min(1, "Adicione ao menos 1 foto"),
  variants: z.array(variantSchema).length(4, "Grade P/M/G/GG obrigatória"),
});
export type ProductInput = z.infer<typeof productSchema>;

export const stockUpdateSchema = z.object({
  productId: z.string().min(1),
  size: z.enum(SIZES),
  value: z.coerce.number().int().min(0).max(999),
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export const pixKeyTypeSchema = z.enum(["CELULAR", "CPF", "CNPJ", "ALEATORIA"]);

export const settingsSchema = z.object({
  whatsappNumber: z.string().min(10, "WhatsApp inválido").max(16),
  pixKey: z.string().max(40).optional().or(z.literal("")),
  pixKeyType: pixKeyTypeSchema.optional(),
  pixName: z.string().max(60).optional().or(z.literal("")),
  freeDeliveryEnabled: z.boolean().default(true),
  pickupEnabled: z.boolean().default(true),
  paymentCashEnabled: z.boolean().default(true),
  paymentPixEnabled: z.boolean().default(true),
  paymentCardEnabled: z.boolean().default(false),
  pixQrCode: z.string().optional().or(z.literal("")),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const deliveryZoneSchema = z.object({
  location: z.string().min(2).max(40),
  fee: z.coerce.number().min(0).max(500),
  isActive: z.boolean().default(true),
});
export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "Senha muito curta"),
});

export const ORDER_STATUS_META: Record<
  OrderStatusEnum,
  { label: string; dot: string; chip: string; ring: string }
> = {
  PENDING: {
    label: "Aguardando",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    ring: "ring-amber-500/30",
  },
  PREPARING: {
    label: "Em separação",
    dot: "bg-sky-400",
    chip: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    ring: "ring-sky-500/30",
  },
  DELIVERED: {
    label: "Entregue",
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    ring: "ring-emerald-500/30",
  },
  CANCELLED: {
    label: "Cancelado",
    dot: "bg-stone-500",
    chip: "bg-stone-500/10 text-stone-400 border-stone-500/30",
    ring: "ring-stone-500/30",
  },
};

export const CATEGORY_LABEL: Record<CategoryEnum, string> = {
  POLOS: "Polos Tech",
  CAMISETAS: "Camisetas Oversized",
  BERMUDAS: "Bermudas",
  CONJUNTOS: "Conjuntos",
  ACESSORIOS: "Acessórios",
};

/* ---------------- CRM schemas ---------------- */

export const LEAD_STAGES = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO"] as const;
export type LeadStageEnum = (typeof LEAD_STAGES)[number];

export const COMMUNICATION_TYPES = ["WHATSAPP", "TELEFONE", "PRESENCIAL", "EMAIL", "INSTAGRAM"] as const;
export type CommTypeEnum = (typeof COMMUNICATION_TYPES)[number];

export const COMMUNICATION_DIRECTIONS = ["ENVIADA", "RECEBIDA"] as const;
export type CommDirectionEnum = (typeof COMMUNICATION_DIRECTIONS)[number];

export const customerSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
  phone: z.string().min(10, "Telefone inválido").max(16),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().max(14).optional().or(z.literal("")),
  address: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(40).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const leadSchema = z.object({
  customerId: z.string().optional().nullable(),
  name: z.string().min(2, "Nome muito curto").max(80),
  phone: z.string().min(10, "Telefone inválido").max(16),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  source: z.string().min(2, "Fonte obrigatória").max(30),
  stage: z.enum(LEAD_STAGES),
  value: z.coerce.number().min(0, "Valor deve ser positivo"),
  notes: z.string().max(500).optional().or(z.literal("")),
});
export type LeadInput = z.infer<typeof leadSchema>;

export const communicationSchema = z.object({
  customerId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  type: z.enum(COMMUNICATION_TYPES),
  direction: z.enum(COMMUNICATION_DIRECTIONS),
  subject: z.string().min(1, "Assunto obrigatório").max(100),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type CommunicationInput = z.infer<typeof communicationSchema>;

export const LEAD_STAGE_META: Record<
  LeadStageEnum,
  { label: string; color: string; bg: string; border: string }
> = {
  LEAD: { label: "Lead", color: "text-stone-300", bg: "bg-stone-500/10", border: "border-stone-500/30" },
  CONTATO: { label: "Contato", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  PROPOSTA: { label: "Proposta", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  NEGOCIACAO: { label: "Negociação", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  FECHADO_GANHO: { label: "Ganho", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  FECHADO_PERDIDO: { label: "Perdido", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
};

export const COMM_TYPE_META: Record<
  CommTypeEnum,
  { label: string; icon: string }
> = {
  WHATSAPP: { label: "WhatsApp", icon: "MessageCircle" },
  TELEFONE: { label: "Telefone", icon: "Phone" },
  PRESENCIAL: { label: "Presencial", icon: "Store" },
  EMAIL: { label: "E-mail", icon: "Mail" },
  INSTAGRAM: { label: "Instagram", icon: "Instagram" },
};
