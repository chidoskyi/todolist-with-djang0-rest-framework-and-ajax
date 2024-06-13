from django.urls import path # type: ignore
from . import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('get-todos', views.getTodos),
    path('get-todo/<str:pk>/', views.getTodo),
    path('create-todo/', views.createTodo),
    path('update-todo/<str:pk>/', views.updateTodo),
    path('delete-todo/<str:pk>/', views.deleteTodo),

    #search

    path('completed/<int:id>/', views.complete_task, name='complete-task'),
    path('search/', views.get_todos, name='search'),

    #authentication

    path('register/', views.register, name='register'),
    path('login/', views.MyTokenObtainPairView.as_view(), name='login'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    
    #reactions
    
    # path('reactions/', views.list_reactions, name='list-reactions'),
    # path('reactions/<int:task_id>', views.get_reactions, name='get-reactions'),
    # path('reactions/create/', views.create_reaction, name='create-reaction'),
    # path('reactions/<int:pk>/', views.reaction_detail, name='reaction-detail'),
]


#   
# http://127.0.0.1:8001/api/get-todo/id
# http://127.0.0.1:8001/api/create-todo
# http://127.0.0.1:8001/api/update-todo/id
# http://127.0.0.1:8001/api/delete-todo/id
# http://127.0.0.1:8001/api/completed/id
# http://127.0.0.1:8001/api/search/
# http://127.0.0.1:8001/api/register/
# http://127.0.0.1:8001/api/login/
# http://127.0.0.1:8001/api/logout/
