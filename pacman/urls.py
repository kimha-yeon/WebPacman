from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("show_ranking/", views.show_ranking, name="show_ranking"),
    path("start_game/", views.start_game, name="start_game"),
    path("add_ranking/<int:score>/", views.add_ranking, name="add_ranking"),
]