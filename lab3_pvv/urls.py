from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('ajax/', views.lab3_pvv_ajax),
]
