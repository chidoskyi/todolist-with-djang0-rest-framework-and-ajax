from django.urls import path
from . import views
from.views import complete_task


urlpatterns = [
    path('get-todos', views.getTodos),
    path('get-todo/<str:pk>/', views.getTodo),
    path('create-todo/', views.createTodo),
    path('update-todo/<str:pk>/', views.updateTodo),
    path('delete-todo/<str:pk>/', views.deleteTodo),
    path('complete-task/<int:id>/', complete_task, name='complete_task'),
]


#   
# http://127.0.0.1:8001/api/get-todo/
# http://127.0.0.1:8001/api/get-todo/id
# http://127.0.0.1:8001/api/create-todo
# http://127.0.0.1:8001/api/update-todo/id
# http://127.0.0.1:8001/api/delete-todo/id
# http://127.0.0.1:8001/api/complete_task/id
