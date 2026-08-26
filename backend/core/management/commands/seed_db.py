from django.core.management.base import BaseCommand
from core.models import (
    StoreSetting,
    DeliveryZone,
    HeroSlide,
    Product,
    ProductImage,
    ProductVariant,
    Look,
    Customer,
    Lead,
    Communication,
)


class Command(BaseCommand):
    help = "Popula o banco de dados com dados iniciais da Estilo Prime"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando seed do banco de dados...\n"))

        self.seed_store_settings()
        self.seed_delivery_zones()
        self.seed_hero_slides()
        self.seed_products()
        self.seed_looks()
        self.seed_customers()
        self.seed_leads()
        self.seed_communications()

        self.stdout.write(self.style.SUCCESS("\nSeed concluido com sucesso!"))

    # ------------------------------------------------------------------
    def seed_store_settings(self):
        self.stdout.write("  [1/8] StoreSettings...")
        StoreSetting.objects.get_or_create(
            id=1,
            defaults={
                "whatsapp_number": "5588999999999",
                "pix_key": "5588999999999",
                "pix_key_type": "CELULAR",
                "pix_name": "Estilo Prime Store",
                "free_delivery_enabled": True,
                "pickup_enabled": True,
            },
        )

    def seed_delivery_zones(self):
        self.stdout.write("  [2/8] DeliveryZones...")
        zones = [
            ("Itaiçaba - CE (Centro)", 0),
            ("Itaiçaba - CE (Fora do Centro)", 5.00),
            ("Canindé - CE", 12.00),
            ("Itapajé - CE", 15.00),
            ("Maracanaú - CE", 25.00),
            ("Fortaleza - CE", 30.00),
        ]
        for location, fee in zones:
            DeliveryZone.objects.get_or_create(
                location=location, defaults={"fee": fee, "is_active": True}
            )

    def seed_hero_slides(self):
        self.stdout.write("  [3/8] HeroSlides...")
        slides = [
            {
                "title": "CAMISETAS OVERSIZED",
                "subtitle": "Boxy Cut",
                "subtitle_class": "tx-serif acc",
                "description": "Algodão penteado pesado com caimento reto e imponente.",
                "cta_text": "Ver Oversized",
                "badge": "[ STREETWEAR ESSENTIALS // 240G/M² ]",
                "piece_text": "Boxy White Tee — R$ 79,90",
                "image_url": "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&w=2400&q=90",
                "order": 0,
            },
            {
                "title": "CAMISAS DE TIME",
                "subtitle": "Retrô Edition",
                "subtitle_class": "tx-serif acc",
                "description": "Jersey retrô com números e detalhes em relevo. Feito para torcer com estilo.",
                "cta_text": "Ver Esporte",
                "badge": "[ GAME DAY ESSENTIALS // RETRÔ ]",
                "piece_text": "Camisa Retrô Nº10 — R$ 119,90",
                "image_url": "https://images.unsplash.com/photo-1759308553457-6f7f0850d9cd?auto=format&fit=crop&w=2400&q=90",
                "order": 1,
            },
            {
                "title": "BERMUDAS DE LINHO",
                "subtitle": "Alfaiataria Leve",
                "subtitle_class": "tx-serif acc",
                "description": "Linho misto com caimento acima do joelho. Leveza e sofisticação no verão.",
                "cta_text": "Ver Bermudas",
                "badge": "[ SUMMER ESSENTIALS // LINHO ]",
                "piece_text": "Bermuda Linho Areia — R$ 79,90",
                "image_url": "https://images.unsplash.com/photo-1562247879-0eac107b7e76?auto=format&fit=crop&w=2400&q=90",
                "order": 2,
            },
            {
                "title": "POLOS TECH",
                "subtitle": "Performance",
                "subtitle_class": "tx-serif acc",
                "description": "Malha estruturada anti-suor com acabamento premium. Do escritório à noite.",
                "cta_text": "Ver Polos",
                "badge": "[ TECH FABRIC // ANTI-SUOR ]",
                "piece_text": "Polo Tech Black Zíper — R$ 89,90",
                "image_url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=2400&q=90",
                "order": 3,
            },
            {
                "title": "CAMISETAS ESSENCIAIS",
                "subtitle": "White Core",
                "subtitle_class": "tx-serif acc",
                "description": "A camiseta branca definitiva. Peso, caimento e presença em uma peça só.",
                "cta_text": "Ver Tees",
                "badge": "[ WHITE CORE // 240G/M² ]",
                "piece_text": "Bone White Heavyweight — R$ 74,90",
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=2400&q=90",
                "order": 4,
            },
            {
                "title": "EDITORIAL",
                "subtitle": "Presença & Caimento",
                "subtitle_class": "tx-serif acc",
                "description": "Cada peça com história. Looks que transcendem estação e tendência.",
                "cta_text": "Ver Lookbook",
                "badge": "[ LOOKBOOK 2026 ]",
                "piece_text": "Smart Casual Editorial",
                "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=2400&q=90",
                "order": 5,
            },
            {
                "title": "POLOS PIQUET",
                "subtitle": "Heritage",
                "subtitle_class": "tx-serif acc",
                "description": "Piquet de gramatura alta, fechamento elegante. O polo que fecha qualquer look.",
                "cta_text": "Ver Polos",
                "badge": "[ HERITAGE COLLECTION ]",
                "piece_text": "Piquet Heritage Rack — R$ 84,90",
                "image_url": "https://images.unsplash.com/photo-1626447852910-316278832a8a?auto=format&fit=crop&w=2400&q=90",
                "order": 6,
            },
            {
                "title": "DENIM BERMUDA",
                "subtitle": "Indigo Wash",
                "subtitle_class": "tx-serif acc",
                "description": "Denim leve lavado, modelagem relaxada. Do dia à noite sem esforço.",
                "cta_text": "Ver Bermudas",
                "badge": "[ DENIM ESSENTIALS ]",
                "piece_text": "Bermuda Denim Indigo — R$ 89,90",
                "image_url": "https://images.unsplash.com/photo-1617951639883-6a10179adb1e?auto=format&fit=crop&w=2400&q=90",
                "order": 7,
            },
        ]
        for data in slides:
            HeroSlide.objects.get_or_create(
                title=data["title"], subtitle=data["subtitle"], defaults=data
            )

    def seed_products(self):
        self.stdout.write("  [4/8] Products + Images + Variants...")
        products = [
            {
                "name": "Polo Tech Black Zíper",
                "slug": "polo-tech-black-ziper",
                "description": "Malha estruturada anti-suor, zíper frontal inoxidável e gola canelada firme.",
                "price": 89.90,
                "old_price": 119.90,
                "category": "POLOS",
                "badge": "BEST SELLER",
                "image_id": "1620799140408-edc6dcb6d633",
                "sizes": {"P": 3, "M": 6, "G": 4, "GG": 2},
            },
            {
                "name": "Polo Navy Blue Classic",
                "slug": "polo-navy-blue-classic",
                "description": "Azul-marinho versátil, punho canelado e botões madrepérola.",
                "price": 79.90,
                "old_price": 99.90,
                "category": "POLOS",
                "badge": "CLÁSSICO",
                "image_id": "1585790641228-36685639c56e",
                "sizes": {"P": 4, "M": 6, "G": 4, "GG": 2},
            },
            {
                "name": "Piquet Heritage Rack",
                "slug": "piquet-heritage-rack",
                "description": "Piquet de gramatura alta no tom perfeito para o escritório e o bar.",
                "price": 84.90,
                "old_price": 109.90,
                "category": "POLOS",
                "badge": "HERITAGE",
                "image_id": "1626447852910-316278832a8a",
                "sizes": {"P": 3, "M": 5, "G": 4, "GG": 2},
            },
            {
                "name": "Camiseta Oversized Vintage White",
                "slug": "camiseta-oversized-vintage-white",
                "description": "Boxy cut, ombro caído e gola grossa 3cm. Algodão penteado 240g/m².",
                "price": 79.90,
                "old_price": 99.90,
                "category": "CAMISETAS",
                "badge": "LANÇAMENTO",
                "image_id": "1574180566232-aaad1b5b8450",
                "sizes": {"P": 5, "M": 8, "G": 7, "GG": 3},
            },
            {
                "name": "Graphic Print Purple Haze",
                "slug": "graphic-print-purple-haze",
                "description": "Estampa gráfica em silk fosco sobre malha pesada 240g/m².",
                "price": 89.90,
                "old_price": 114.90,
                "category": "CAMISETAS",
                "badge": "STREET",
                "image_id": "1626806851009-c98659eb1af0",
                "sizes": {"P": 3, "M": 5, "G": 4, "GG": 2},
            },
            {
                "name": "Bone White Heavyweight Duo",
                "slug": "bone-white-heavyweight-duo",
                "description": "Branco giz pesado, caimento reto — a base branca definitiva.",
                "price": 74.90,
                "old_price": 94.90,
                "category": "CAMISETAS",
                "badge": "CLEAN",
                "image_id": "1521572163474-6864f9cf17ab",
                "sizes": {"P": 4, "M": 6, "G": 5, "GG": 2},
            },
            {
                "name": "Jump Black Essential Tee",
                "slug": "jump-black-essential-tee",
                "description": "Preto profundo 240g/m², gola reforçada que não deforma.",
                "price": 69.90,
                "old_price": 92.90,
                "category": "CAMISETAS",
                "badge": "CORE",
                "image_id": "1618453292507-4959ece6429e",
                "sizes": {"P": 5, "M": 7, "G": 5, "GG": 3},
            },
            {
                "name": "Camisa Retrô Nº10 Home",
                "slug": "camisa-retro-n10-home",
                "description": "Jersey retrô número 10 nas costas, tecido respirável e relevo premium.",
                "price": 119.90,
                "old_price": 149.90,
                "category": "POLOS",
                "badge": "GAME DAY",
                "image_id": "1759308553457-6f7f0850d9cd",
                "sizes": {"P": 3, "M": 6, "G": 4, "GG": 2},
            },
            {
                "name": "Camisa Team Blackout Field",
                "slug": "camisa-team-blackout-field",
                "description": "Preto e azul elétrico, corte atlético para o dia de jogo.",
                "price": 109.90,
                "old_price": 139.90,
                "category": "POLOS",
                "badge": "AWAY KIT",
                "image_id": "1517466787929-bc90951d0974",
                "sizes": {"M": 4, "G": 4, "GG": 2},
            },
            {
                "name": "Camisa Canarinho Street",
                "slug": "camisa-canarinho-street",
                "description": "Amarelo-verde para torcer com estilo dentro e fora do campo.",
                "price": 114.90,
                "old_price": 144.90,
                "category": "POLOS",
                "badge": "SELEÇÃO",
                "image_id": "1745895400964-e8108fbb112b",
                "sizes": {"P": 3, "M": 5, "G": 3, "GG": 1},
            },
            {
                "name": "Camisa Verde Rua 2026",
                "slug": "camisa-verde-rua-2026",
                "description": "Verde intenso com gola esportiva — verão 2026.",
                "price": 104.90,
                "old_price": 134.90,
                "category": "POLOS",
                "badge": "DROP",
                "image_id": "1772450235863-996680ddb732",
                "sizes": {"P": 3, "M": 5, "G": 3},
            },
            {
                "name": "Bermuda Linho Areia Alfaiataria",
                "slug": "bermuda-linho-areia-alfaiataria",
                "description": "Linho misto, corte acima do joelho, cós com cordão de ajuste.",
                "price": 79.90,
                "old_price": 109.90,
                "category": "BERMUDAS",
                "badge": "ALFAIATARIA",
                "image_id": "1562247879-0eac107b7e76",
                "sizes": {"38": 3, "40": 5, "42": 4, "44": 2},
            },
            {
                "name": "Bermuda Surf Plaid",
                "slug": "bermuda-surf-plaid",
                "description": "Xadrez casual de secagem rápida — do mar ao quiosque.",
                "price": 69.90,
                "old_price": 89.90,
                "category": "BERMUDAS",
                "badge": "PRAIA",
                "image_id": "1617953644310-e690da9be982",
                "sizes": {"M": 4, "G": 4, "GG": 2},
            },
            {
                "name": "Bermuda Beach Green Core",
                "slug": "bermuda-beach-green-core",
                "description": "Verde oliva essencial com bolsos faca funcionais.",
                "price": 64.90,
                "old_price": 84.90,
                "category": "BERMUDAS",
                "badge": "CORE",
                "image_id": "1621496503717-095a410e1566",
                "sizes": {"P": 3, "M": 5, "G": 4, "GG": 2},
            },
            {
                "name": "Bermuda Denim Indigo Relax",
                "slug": "bermuda-denim-indigo-relax",
                "description": "Denim leve lavado, modelagem relaxada acima do joelho.",
                "price": 89.90,
                "old_price": 114.90,
                "category": "BERMUDAS",
                "badge": "DENIM",
                "image_id": "1617951639883-6a10179adb1e",
                "sizes": {"38": 3, "40": 4, "42": 2},
            },
            {
                "name": "Boné Dad Hat Minimalist EP",
                "slug": "bone-dad-hat-minimalist-ep",
                "description": "Sarja peletizada, fivela metálica envelhecida e bordado EP.",
                "price": 49.90,
                "old_price": 69.90,
                "category": "ACESSORIOS",
                "badge": "ACESSÓRIO",
                "image_id": "1516826957135-700dedea698c",
                "sizes": {"Único": 10},
            },
            {
                "name": "Trucker Night Studio Snapback",
                "slug": "trucker-night-studio-snapback",
                "description": "Aba reta, tela traseira e patch frontal bordado.",
                "price": 59.90,
                "old_price": 79.90,
                "category": "ACESSORIOS",
                "badge": "STREET",
                "image_id": "1777447458522-79367cd8e5d3",
                "sizes": {"Único": 8},
            },
            {
                "name": "Flat Cap Vintage Walker",
                "slug": "flat-cap-vintage-walker",
                "description": "Boina reta vintage para compor looks de meia-estação.",
                "price": 64.90,
                "old_price": 84.90,
                "category": "ACESSORIOS",
                "badge": "VINTAGE",
                "image_id": "1761494355056-a7fa8bde0365",
                "sizes": {"Único": 5},
            },
        ]
        for data in products:
            sizes = data.pop("sizes")
            image_id = data.pop("image_id")
            badge = data.pop("badge")
            obj, created = Product.objects.get_or_create(
                slug=data["slug"], defaults=data
            )
            if created:
                ProductImage.objects.create(
                    product=obj,
                    image_url=f"https://images.unsplash.com/{image_id}?auto=format&fit=crop&w=800&q=85",
                    is_cover=True,
                    order=0,
                )
                for size, stock in sizes.items():
                    ProductVariant.objects.create(
                        product=obj, size=size, stock=stock
                    )
                self.stdout.write(f"    + {obj.name}")
            else:
                self.stdout.write(f"    = {obj.name} (ja existe)")

    def seed_looks(self):
        self.stdout.write("  [5/8] Looks...")
        looks = [
            {
                "tag": "SMART CASUAL",
                "title": "Retrato Editorial",
                "description": "Presença natural para o dia a dia refinado.",
                "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=85",
                "order": 0,
            },
            {
                "tag": "RESORT WEAR",
                "title": "Blazer + Alfaiataria Leve",
                "description": "Elegância despretensiosa para a noite cearense.",
                "image_url": "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=85",
                "order": 1,
            },
            {
                "tag": "SUMMER SHORTS",
                "title": "Shorts Praia + Tee Branca",
                "description": "Frescor total com caimento alinhado.",
                "image_url": "https://images.unsplash.com/photo-1562247879-0eac107b7e76?auto=format&fit=crop&w=800&q=85",
                "order": 2,
            },
            {
                "tag": "GAME DAY",
                "title": "Jersey Doorway Fit",
                "description": "Número nas costas, atitude na frente.",
                "image_url": "https://images.unsplash.com/photo-1772972321294-f500e4c11e30?auto=format&fit=crop&w=800&q=85",
                "order": 3,
            },
            {
                "tag": "CAP STREET",
                "title": "Baseball Cap Night",
                "description": "Topper firme sob a luz da cidade.",
                "image_url": "https://images.unsplash.com/photo-1777447458522-79367cd8e5d3?auto=format&fit=crop&w=800&q=85",
                "order": 4,
            },
            {
                "tag": "WHITE CORE",
                "title": "Duo de Tees Essentials",
                "description": "A base branca que nunca erra.",
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
                "order": 5,
            },
        ]
        for data in looks:
            Look.objects.get_or_create(
                title=data["title"], defaults=data
            )

    def seed_customers(self):
        self.stdout.write("  [6/8] Customers...")
        customers = [
            {
                "name": "Lucas Ferreira",
                "phone": "5585999111001",
                "email": "lucas.ferreira@email.com",
                "cpf": "012.345.678-90",
                "address": "Rua das Acácias, 142",
                "city": "São Paulo, SP",
                "tags": "VIP,COMPROU_3X",
                "total_orders": 5,
                "total_spent": 689.50,
            },
            {
                "name": "Rafael Mendes",
                "phone": "5585999111002",
                "email": "rafael.mendes@email.com",
                "cpf": "123.456.789-01",
                "address": "Av. Beira Mar, 800",
                "city": "Rio de Janeiro, RJ",
                "tags": "RECORRENTE",
                "total_orders": 3,
                "total_spent": 345.00,
            },
            {
                "name": "Matheus Oliveira",
                "phone": "5585999111003",
                "email": "matheus.oliveira@email.com",
                "cpf": "234.567.890-12",
                "address": "Rua das Laranjeiras, 55",
                "city": "Salvador, BA",
                "tags": "NOVO",
                "total_orders": 1,
                "total_spent": 119.90,
            },
            {
                "name": "Thiago Santos",
                "phone": "5585999111004",
                "email": "thiago.santos@email.com",
                "cpf": "345.678.901-23",
                "address": "Rua Padre Chagas, 22",
                "city": "Porto Alegre, RS",
                "tags": "ATIVO",
                "total_orders": 2,
                "total_spent": 239.80,
            },
            {
                "name": "Bruno Carvalho",
                "phone": "5585999111005",
                "email": "bruno.carvalho@email.com",
                "cpf": "456.789.012-34",
                "address": "Rua Augusta, 1500",
                "city": "São Paulo, SP",
                "tags": "VIP",
                "total_orders": 4,
                "total_spent": 520.00,
            },
            {
                "name": "Pedro Almeida",
                "phone": "5585999111006",
                "email": "pedro.almeida@email.com",
                "cpf": "567.890.123-45",
                "address": "Rua Oscar Freire, 300",
                "city": "Belo Horizonte, MG",
                "tags": "COMPROU_3X",
                "total_orders": 3,
                "total_spent": 399.70,
            },
            {
                "name": "Gabriel Costa",
                "phone": "5585999111007",
                "email": "gabriel.costa@email.com",
                "cpf": "678.901.234-56",
                "address": "Av. Paulista, 1000",
                "city": "São Paulo, SP",
                "tags": "NOVO",
                "total_orders": 1,
                "total_spent": 89.90,
            },
            {
                "name": "Felipe Ribeiro",
                "phone": "5585999111008",
                "email": "felipe.ribeiro@email.com",
                "cpf": "789.012.345-67",
                "address": "Rua das Pedras, 88",
                "city": "Curitiba, PR",
                "tags": "RECORRENTE",
                "total_orders": 6,
                "total_spent": 756.00,
            },
            {
                "name": "Gustavo Lima",
                "phone": "5585999111009",
                "email": "gustavo.lima@email.com",
                "cpf": "890.123.456-78",
                "address": "Rua Padre Anchieta, 200",
                "city": "Goiânia, GO",
                "tags": "ATIVO",
                "total_orders": 2,
                "total_spent": 179.80,
            },
            {
                "name": "Vinícius Souza",
                "phone": "5585999111010",
                "email": "vinicius.souza@email.com",
                "cpf": "901.234.567-89",
                "address": "Rua Dom Pedro II, 45",
                "city": "Recife, PE",
                "tags": "NOVO",
                "total_orders": 1,
                "total_spent": 149.90,
            },
            {
                "name": "André Barbosa",
                "phone": "5585999111011",
                "email": "andre.barbosa@email.com",
                "cpf": "012.345.678-91",
                "address": "Rua XV de Novembro, 110",
                "city": "Natal, RN",
                "tags": "ATIVO",
                "total_orders": 2,
                "total_spent": 224.80,
            },
            {
                "name": "Diego Martins",
                "phone": "5585999111012",
                "email": "diego.martins@email.com",
                "cpf": "123.456.789-02",
                "address": "Rua da Bahia, 700",
                "city": "Belo Horizonte, MG",
                "tags": "COMPROU_3X",
                "total_orders": 3,
                "total_spent": 299.70,
            },
        ]
        for data in customers:
            Customer.objects.get_or_create(
                phone=data["phone"], defaults=data
            )

    def seed_leads(self):
        self.stdout.write("  [7/8] Leads...")
        leads = [
            {"name": "Carlos Eduardo", "phone": "5585999222001", "source": "Instagram", "stage": "LEAD", "value": 0, "notes": "Curioso sobre polos tech"},
            {"name": "Marcos Vinícius", "phone": "5585999222002", "source": "WhatsApp", "stage": "CONTATO", "value": 159.80, "notes": "Perguntou sobre bermudas de linho"},
            {"name": "João Pedro", "phone": "5585999222003", "source": "Indicação", "stage": "PROPOSTA", "value": 239.80, "notes": "Enviou lista de peças desejadas"},
            {"name": "Leonardo Silva", "phone": "5585999222004", "source": "Instagram", "stage": "NEGOCIACAO", "value": 349.70, "notes": "Negociando desconto em combo"},
            {"name": "Henrique Santos", "phone": "5585999222005", "source": "Site", "stage": "FECHADO_GANHO", "value": 459.00, "notes": "Comprou 3 camisetas oversized"},
            {"name": "Paulo Henrique", "phone": "5585999222006", "source": "WhatsApp", "stage": "FECHADO_PERDIDO", "value": 89.90, "notes": "Desistiu — preço alto"},
            {"name": "Ricardo Araújo", "phone": "5585999222007", "source": "Instagram", "stage": "LEAD", "value": 0, "notes": "Curtiu post de polos"},
            {"name": "Eduardo Nascimento", "phone": "5585999222008", "source": "Indicação", "stage": "CONTATO", "value": 199.00, "notes": "Quer bermudas de verão"},
            {"name": "Fernando Gomes", "phone": "5585999222009", "source": "Site", "stage": "PROPOSTA", "value": 299.90, "notes": "Pedido personalizado boné + polo"},
            {"name": "Roberto Dias", "phone": "5585999222010", "source": "WhatsApp", "stage": "NEGOCIACAO", "value": 520.00, "notes": "Compra corporativa — 6 camisas"},
            {"name": "Alexandre Reis", "phone": "5585999222011", "source": "Instagram", "stage": "FECHADO_GANHO", "value": 389.90, "notes": "Comprou look completo"},
            {"name": "Sérgio Moreira", "phone": "5585999222012", "source": "Site", "stage": "FECHADO_PERDIDO", "value": 79.90, "notes": "Não retornou após proposta"},
        ]
        for data in leads:
            Lead.objects.get_or_create(
                phone=data["phone"], defaults=data
            )

    def seed_communications(self):
        self.stdout.write("  [8/8] Communications...")
        customers = list(Customer.objects.all()[:12])
        leads = list(Lead.objects.all()[:12])
        comms = [
            {"customer": customers[0], "type": "WHATSAPP", "direction": "RECEBIDA", "subject": "Disponibilidade Polo Tech", "notes": "Perguntou se tem estoque em P"},
            {"customer": customers[1], "type": "WHATSAPP", "direction": "ENVIADA", "subject": "Envio do pedido #0012", "notes": "Código de rastreio enviado"},
            {"customer": customers[2], "type": "TELEFONE", "direction": "ENVIADA", "subject": "Confirmação de compra", "notes": "Confirmou dados de entrega"},
            {"customer": customers[3], "type": "WHATSAPP", "direction": "RECEBIDA", "subject": "Solicitação de troca", "notes": "Troca de tamanho G para GG"},
            {"customer": customers[4], "type": "INSTAGRAM", "direction": "RECEBIDA", "subject": "Orçamento para evento", "notes": "Vestimenta para casamento"},
            {"customer": customers[5] if len(customers) > 5 else customers[0], "type": "WHATSAPP", "direction": "ENVIADA", "subject": "Promoção de verão", "notes": "Catálogo de bermudas enviado"},
            {"customer": customers[0], "type": "PRESENCIAL", "direction": "ENVIADA", "subject": "Retirada no balcão", "notes": "Cliente retirou pedido #0008"},
            {"customer": customers[1], "type": "WHATSAPP", "direction": "RECEBIDA", "subject": "Novo pedido", "notes": "2 bonés e 1 bermuda"},
            {"lead": leads[0], "type": "INSTAGRAM", "direction": "RECEBIDA", "subject": "Interesse em coleção", "notes": "Mensagem via DM"},
            {"lead": leads[1], "type": "WHATSAPP", "direction": "ENVIADA", "subject": "Retorno sobre proposta", "notes": "Enviou valores e prazos"},
            {"lead": leads[2], "type": "TELEFONE", "direction": "ENVIADA", "subject": "Follow-up semanal", "notes": "Ligou para confirmar interesse"},
            {"lead": leads[3], "type": "WHATSAPP", "direction": "RECEBIDA", "subject": "Contra-proposta", "notes": "Pediu 10% de desconto"},
            {"lead": leads[4], "type": "WHATSAPP", "direction": "ENVIADA", "subject": "Pedido finalizado", "notes": "Agradecimento e pedido confirmado"},
            {"lead": leads[5], "type": "EMAIL", "direction": "ENVIADA", "subject": "Motivo da desistência", "notes": "Pesquisa de satisfação"},
            {"customer": customers[2], "type": "WHATSAPP", "direction": "ENVIADA", "subject": "Avaliação do produto", "notes": "Solicitou review"},
            {"customer": customers[3], "type": "INSTAGRAM", "direction": "RECEBIDA", "subject": "Elogio ao produto", "notes": "Postou story com a polo"},
            {"lead": leads[6], "type": "INSTAGRAM", "direction": "ENVIADA", "subject": "Primeiro contato", "notes": "Mensagem de boas-vindas"},
            {"lead": leads[7], "type": "WHATSAPP", "direction": "RECEBIDA", "subject": "Dúvida sobre grade", "notes": "Tabela de medidas solicitada"},
            {"lead": leads[8], "type": "WHATSAPP", "direction": "ENVIADA", "subject": "Orçamento personalizado", "notes": "Boné bordado sob encomenda"},
            {"lead": leads[9], "type": "TELEFONE", "direction": "ENVIADA", "subject": "Proposta corporativa", "notes": "6 camisas com bordado logo"},
        ]
        for data in comms:
            Communication.objects.get_or_create(
                subject=data["subject"],
                defaults={
                    "customer": data.get("customer"),
                    "lead": data.get("lead"),
                    "type": data["type"],
                    "direction": data["direction"],
                    "notes": data["notes"],
                },
            )
