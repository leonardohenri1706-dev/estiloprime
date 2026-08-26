from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("hero-slides", views.HeroSlideViewSet, basename="heroslide")
router.register("products", views.ProductViewSet, basename="product")
router.register("gallery", views.GalleryPhotoViewSet, basename="galleryphoto")
router.register("looks", views.LookViewSet, basename="look")
router.register("settings", views.StoreSettingViewSet, basename="storesetting")
router.register("delivery-zones", views.DeliveryZoneViewSet, basename="deliveryzone")
router.register("orders", views.OrderViewSet, basename="order")
router.register("customers", views.CustomerViewSet, basename="customer")
router.register("leads", views.LeadViewSet, basename="lead")
router.register("communications", views.CommunicationViewSet, basename="communication")

urlpatterns = [
    path("", include(router.urls)),
]
