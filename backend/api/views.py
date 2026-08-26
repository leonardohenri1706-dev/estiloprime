from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from core.models import (
    Product,
    HeroSlide,
    GalleryPhoto,
    Look,
    StoreSetting,
    DeliveryZone,
    Order,
    Customer,
    Lead,
    Communication,
)
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    HeroSlideSerializer,
    GalleryPhotoSerializer,
    LookSerializer,
    StoreSettingSerializer,
    DeliveryZoneSerializer,
    OrderCreateSerializer,
    OrderListSerializer,
    CustomerSerializer,
    LeadSerializer,
    CommunicationSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_staff:
            return HeroSlide.objects.all()
        return HeroSlide.objects.filter(is_active=True)


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        if self.request.user.is_staff:
            qs = Product.objects.all()
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer


class GalleryPhotoViewSet(viewsets.ModelViewSet):
    queryset = GalleryPhoto.objects.filter(is_active=True)
    serializer_class = GalleryPhotoSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = GalleryPhoto.objects.filter(is_active=True)
        if self.request.user.is_staff:
            qs = GalleryPhoto.objects.all()
        photo_type = self.request.query_params.get("type")
        if photo_type:
            qs = qs.filter(photo_type=photo_type)
        return qs


class LookViewSet(viewsets.ModelViewSet):
    queryset = Look.objects.all()
    serializer_class = LookSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None


class StoreSettingViewSet(viewsets.ModelViewSet):
    queryset = StoreSetting.objects.all()
    serializer_class = StoreSettingSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        obj, _ = StoreSetting.objects.get_or_create(id=1)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        obj, _ = StoreSetting.objects.get_or_create(id=1)
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    queryset = DeliveryZone.objects.filter(is_active=True)
    serializer_class = DeliveryZoneSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = DeliveryZone.objects.filter(is_active=True)
        if self.request.user.is_staff:
            qs = DeliveryZone.objects.all()
        return qs


class OrderViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.none()

    def get_serializer_class(self):
        if self.action == "list":
            return OrderListSerializer
        return OrderCreateSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        items_data = request.data.pop("items", [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        response_serializer = OrderCreateSerializer(order)
        return Response(
            response_serializer.data, status=status.HTTP_201_CREATED
        )


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["name", "phone", "email", "cpf"]


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Lead.objects.all()
        stage = self.request.query_params.get("stage")
        if stage:
            qs = qs.filter(stage=stage)
        return qs


class CommunicationViewSet(viewsets.ModelViewSet):
    queryset = Communication.objects.all()
    serializer_class = CommunicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Communication.objects.all()
        comm_type = self.request.query_params.get("type")
        if comm_type:
            qs = qs.filter(type=comm_type)
        customer_id = self.request.query_params.get("customer")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        lead_id = self.request.query_params.get("lead")
        if lead_id:
            qs = qs.filter(lead_id=lead_id)
        return qs
