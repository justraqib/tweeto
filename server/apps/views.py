from django.http import JsonResponse

def test_view(request):
    data = {
        "id": 5,
        "name": "John Doe",
    }
    response = JsonResponse(data)
    response["Access-Control-Allow-Origin"] = "http://0.0.0.0:3000"
    return response
