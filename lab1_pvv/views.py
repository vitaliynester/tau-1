import json

from django.http import JsonResponse
from django.shortcuts import render

from lab1_pvv.services.calculator import Calculator


def index(request):
    return render(request, 'lab1_pvv/index.html')


def lab1_pvv_ajax(request):
    if request.method == 'POST':
        data = json.loads(request.body)['data']
        try:
            calculator = Calculator(data)
            plain_opt, hybrid_opt = calculator.make_optimization()
            response = {}
            response['wholesale_price'] = {}
            response['cost_price'] = {}
            response['profit'] = {}
            response['compromise'] = {}

            response['wholesale_price']['f'] = plain_opt['wholesale_price']['f']
            response['wholesale_price']['x'] = plain_opt['wholesale_price']['x'].tolist()

            response['cost_price']['f'] = plain_opt['cost_price']['f']
            response['cost_price']['x'] = plain_opt['cost_price']['x'].tolist()

            response['profit']['f'] = plain_opt['profit']['f']
            response['profit']['x'] = plain_opt['profit']['x'].tolist()

            response['compromise']['f'] = hybrid_opt['f']
            response['compromise']['x'] = hybrid_opt['x'].tolist()

            return JsonResponse(response, safe=False, content_type='application/json')
        except Exception as e:
            return JsonResponse({"msg": str(e)}, safe=False, content_type='application/json')