from django.urls import include, path


urlpatterns = [
    path(
        "inflation/",
        include("portfolio.mini_projects.inflation_purchasing_power.urls"),
    ),
]
