from django.urls import path, include
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("siteapi.urls")),  # اگر app شما siteapi است
]
