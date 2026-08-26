from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ("POLOS", "Polos"),
        ("CAMISETAS", "Camisetas"),
        ("BERMUDAS", "Bermudas"),
        ("CONJUNTOS", "Conjuntos"),
        ("ACESSORIOS", "Acessórios"),
    ]
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="products/%Y/%m/", blank=True)
    image_url = models.URLField(
        blank=True, help_text="Fallback URL (e.g. Unsplash)"
    )
    is_cover = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def get_display_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, related_name="variants", on_delete=models.CASCADE
    )
    size = models.CharField(max_length=10)
    stock = models.IntegerField(default=0)

    class Meta:
        ordering = ["size"]

    def __str__(self):
        return f"{self.product.name} — {self.size}"


class HeroSlide(models.Model):
    title = models.CharField(
        max_length=200, help_text="Main title, e.g. CAMISETAS OVERSIZED"
    )
    subtitle = models.CharField(
        max_length=200, help_text="Accent subtitle, e.g. Boxy Cut"
    )
    subtitle_class = models.CharField(
        max_length=50,
        default="tx-serif acc",
        help_text="CSS class for subtitle",
    )
    description = models.TextField()
    cta_text = models.CharField(max_length=50, default="Ver Catálogo")
    cta_link = models.CharField(max_length=200, default="#catalogo")
    badge = models.CharField(
        max_length=150,
        blank=True,
        help_text="e.g. [ STREETWEAR ESSENTIALS // 240G/M² ]",
    )
    piece_text = models.CharField(
        max_length=200,
        blank=True,
        help_text="e.g. Boxy White Tee — R$ 79,90",
    )
    image = models.ImageField(upload_to="hero/%Y/%m/", blank=True)
    image_url = models.URLField(
        blank=True, help_text="Fallback Unsplash URL"
    )
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.title} — {self.subtitle}"

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class GalleryPhoto(models.Model):
    TYPE_CHOICES = [
        ("EDITORIAL", "Editorial"),
        ("LOOKBOOK", "Lookbook"),
        ("PRODUTO", "Produto"),
        ("BANNER", "Banner"),
    ]
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="gallery/%Y/%m/")
    description = models.TextField(blank=True)
    tags = models.CharField(
        max_length=300, blank=True, help_text="Comma-separated tags"
    )
    photo_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default="EDITORIAL"
    )
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Look(models.Model):
    tag = models.CharField(max_length=50)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    image = models.ImageField(upload_to="looks/%Y/%m/", blank=True)
    image_url = models.URLField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class StoreSetting(models.Model):
    whatsapp_number = models.CharField(
        max_length=16, default="5588999999999"
    )
    pix_key = models.CharField(max_length=40, blank=True)
    pix_key_type = models.CharField(
        max_length=10, blank=True, default="CELULAR"
    )
    pix_name = models.CharField(max_length=60, blank=True)
    free_delivery_enabled = models.BooleanField(default=True)
    pickup_enabled = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Store Setting"
        verbose_name_plural = "Store Settings"

    def __str__(self):
        return "Configurações da Loja"


class DeliveryZone(models.Model):
    location = models.CharField(max_length=40)
    fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.location


class Order(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Aguardando"),
        ("PREPARING", "Em separação"),
        ("DELIVERED", "Entregue"),
        ("CANCELLED", "Cancelado"),
    ]
    order_number = models.CharField(max_length=20, unique=True)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=16)
    delivery_type = models.CharField(max_length=40)
    delivery_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default="PENDING"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, related_name="items", on_delete=models.CASCADE
    )
    product_name = models.CharField(max_length=100)
    size = models.CharField(max_length=10)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class Customer(models.Model):
    name = models.CharField(max_length=80)
    phone = models.CharField(max_length=16, unique=True)
    email = models.EmailField(blank=True)
    cpf = models.CharField(max_length=14, blank=True)
    address = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=40, blank=True)
    notes = models.TextField(blank=True)
    tags = models.CharField(max_length=300, blank=True)
    total_orders = models.IntegerField(default=0)
    total_spent = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    last_order_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Lead(models.Model):
    STAGE_CHOICES = [
        ("LEAD", "Lead"),
        ("CONTATO", "Contato"),
        ("PROPOSTA", "Proposta"),
        ("NEGOCIACAO", "Negociação"),
        ("FECHADO_GANHO", "Ganho"),
        ("FECHADO_PERDIDO", "Perdido"),
    ]
    customer = models.ForeignKey(
        Customer, null=True, blank=True, on_delete=models.SET_NULL
    )
    name = models.CharField(max_length=80)
    phone = models.CharField(max_length=16)
    email = models.EmailField(blank=True)
    source = models.CharField(max_length=30)
    stage = models.CharField(
        max_length=20, choices=STAGE_CHOICES, default="LEAD"
    )
    value = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.stage}"


class Communication(models.Model):
    TYPE_CHOICES = [
        ("WHATSAPP", "WhatsApp"),
        ("TELEFONE", "Telefone"),
        ("PRESENCIAL", "Presencial"),
        ("EMAIL", "E-mail"),
        ("INSTAGRAM", "Instagram"),
    ]
    DIRECTION_CHOICES = [
        ("ENVIADA", "Enviada"),
        ("RECEBIDA", "Recebida"),
    ]
    customer = models.ForeignKey(
        Customer, null=True, blank=True, on_delete=models.SET_NULL
    )
    lead = models.ForeignKey(
        Lead, null=True, blank=True, on_delete=models.SET_NULL
    )
    order = models.ForeignKey(
        Order, null=True, blank=True, on_delete=models.SET_NULL
    )
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    subject = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} — {self.subject}"
