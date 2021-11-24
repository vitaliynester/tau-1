from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('ajax/', views.lab2_pvv_ajax),
]