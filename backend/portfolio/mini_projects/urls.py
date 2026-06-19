from django.urls import include, path


urlpatterns = [
    path(
        "inflation/",
        include("portfolio.mini_projects.inflation_purchasing_power.urls"),
    ),
    path(
        "interest-inflation/",
        include("portfolio.mini_projects.interest_inflation_visualizer.urls"),
    ),
]
