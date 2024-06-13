import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializer import TaskSerializer,RegisterSerializer, MyTokenObtainPairSerializer,ReactionSerializer
from core.models import Tasks,Reaction
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTodos(request):
    # print(request.META)  # Log headers
    # permission_classes = [IsAuthenticated]  # Adjust permissions as needed
    tasks = Tasks.objects.filter(user=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTodo(request, pk):
    try:
        task = Tasks.objects.get(id=pk, user=request.user)
    except Tasks.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TaskSerializer(task, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createTodo(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def updateTodo(request, pk):
    try:
        task = Tasks.objects.get(id=pk, user=request.user)
    except Tasks.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TaskSerializer(instance=task, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteTodo(request, pk):
    try:
        task = Tasks.objects.get(id=pk, user=request.user)
    except Tasks.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    task.delete()
    return Response({'message': 'Todo deleted successfully'}, status=status.HTTP_204_NO_CONTENT)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tasks_list(request):
    queryset = Tasks.objects.filter(user=request.user)

    # Filtering based on completed field
    completed = request.query_params.get('completed')
    if completed is not None:
        if completed == 'true':
            queryset = queryset.filter(completed=True)
        elif completed == 'false':
            queryset = queryset.filter(completed=False)

    # Search functionality
    search_query = request.query_params.get('search', None)
    if search_query:
        queryset = queryset.filter(title__icontains=search_query)

    serializer = TaskSerializer(queryset, many=True)
    return Response(serializer.data)

@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def complete_task(request, id):
    if request.method == 'PATCH':
        try:
            task = Tasks.objects.get(pk=id, user=request.user)
            data = json.loads(request.body)
            completed = data.get('check', False)  # Get the checkbox state from the JSON body
            task.completed = completed  # Set the completed status
            task.save()
            return JsonResponse({'status': 'success', 'completed': task.completed})
        except Tasks.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Task not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_todos(request):
    query = request.GET.get('search', '')  # Get the search query parameter
    status_filter = request.GET.get('filter', '')  # Get the filter query parameter

    tasks = Tasks.objects.filter(user=request.user)
    
    if query:
        tasks = tasks.filter(title__icontains=query)  # Filter tasks by title

    if status_filter:
        if status_filter == 'completed':
            tasks = tasks.filter(completed=True)
        elif status_filter == 'not_completed':
            tasks = tasks.filter(completed=False)

    tasks_data = [{'id': task.id, 'title': task.title, 'completed': task.completed} for task in tasks]
    return JsonResponse(tasks_data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    try:
        refresh_token = request.data['refresh']
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



