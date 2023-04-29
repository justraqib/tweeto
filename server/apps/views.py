from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


def test_view(request):
    data = {
        "id": 5,
        "name": "John Doe",
    }
    response = JsonResponse(data)
    response["Access-Control-Allow-Origin"] = "http://0.0.0.0:3000"
    return response


@api_view(['GET'])
def current_user_details(request):
    user = request.user
    if user.is_authenticated:
        return Response({"username": user.username})
    return Response({"error": "Unauthenticated!"})
