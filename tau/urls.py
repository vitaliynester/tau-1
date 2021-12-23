from django.contrib import admin
from django.urls import path, include

import lab1_pvv
import lab2_pvv
import lab3_pvv

urlpatterns = [
    path('admin/', admin.site.urls),
    path('lab1_pvv/', include('lab1_pvv.urls')),
    path('lab2_pvv/', include('lab2_pvv.urls')),
    path('lab3_pvv/', include('lab3_pvv.urls')),
]
