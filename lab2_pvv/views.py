import json

from django.http import JsonResponse
from django.shortcuts import render

from lab2_pvv.services.calculator import Calculator


def index(request):
    return render(request, 'lab2_pvv/index.html')


def lab2_pvv_ajax(request):
    if request.method == 'POST':
        data = json.loads(request.body)['data']
        try:
            calculator = Calculator(data)
            response = calculator.calculate()
            return JsonResponse(response, safe=False, content_type='application/json')
        except Exception as e:
            return JsonResponse({"msg": str(e)}, safe=False, content_type='application/json')
