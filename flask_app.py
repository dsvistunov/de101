import json

import pycountry
from bson import json_util
from flask import Flask, jsonify, render_template
from pymongo import MongoClient

from de101.grabber import Grabber

app = Flask(__name__)
app.client = MongoClient('localhost', 27017)
app.db = app.client.DE101

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/api/fb/<page_id>", methods=['GET'])
def fb_page_get(page_id):
    #My solution to the second task of the second week
    # fb_page = app.db.fb_page.find_one({"page_id": page_id})
    # if fb_page:
    #     # Serialize result to json
    #     fb_page_json = json.dumps(fb_page, default=json_util.default)
    #     # Convert JSON to the Python dict
    #     return jsonify(**{"data": json.loads(fb_page_json)})
    # else:
    #     return jsonify(**{"error": {"message": "Page does not exist."}}), 404

    # Find record by page_id parameter
    fb_page = app.db.fb_page.find_one({"page_id": page_id})
    if not fb_page:
        return jsonify(**{"error": {"message": "Page not exist."}}), 404
    funs_by_region = {}
    # .iteritems return (key, value) pairs from dict
    for alpha2, count in fb_page['funs_by_regin']['value'].items():
        funs_by_region[int(pycountry.countries.get(alpha_2=alpha2).numeric)] = count
        # funs_by_region[pycountry.countries.get(alpha_2=alpha2).name] = count
    fb_page['funs_by_regin']['value'] = funs_by_region
    # Serialize result to json
    fb_page_json = json.dumps(fb_page, default=json_util.default)
    # Convert JSON to the Python dict
    return jsonify(**{"data": json.loads(fb_page_json)})



@app.route('/api/fb/<page_id>', methods=['POST'])
def fb_page_post(page_id):
    grabber = Grabber(page_id)
    try:
        funs_by_regin = grabber.get_page_fans_by_country()
        posts = grabber.get_last_10_posts()
    except facebook.GraphAPIError:
        return jsonify(**{'status': 'fail'})

    fb_page_data = {
        'page_id': page_id,
        'posts': posts,
        'funs_by_regin': funs_by_regin
    }

    app.db.fb_page.update({'page_id': page_id}, fb_page_data, upsert=True)
    return jsonify(**{'status': 'ok'})


@app.route('/api/fb/sorted_posts/<metric>/<page_id>', methods=['GET'])
def fb_get_sorted_posts(metric, page_id):
    if metric not in ['comments', 'likes', 'shares']:
        return jsonify(**{'error': {'massege': 'Invalid metric name'}})
    metric = 'posts.' + metric
    pipeline = [
        {'$match': {'page_id': page_id}},
        {'$unwind': '$posts'},
        {'$sort': {metric: -1}},
        {'$project': {'_id': False, 'posts': {'post_id': 1, 'comments': 1, 'likes': 1, 'shares': 1, 'time': 1}}}
    ]
    sorted_posts = app.db.fb_page.aggregate(pipeline)
    return jsonify(**{'data': list(sorted_posts)})


@app.route("/api/fb/sum_posts/<metric>/<page_id>", methods=['GET'])
def fb_get_sum_posts(metric, page_id):
    if metric not in ['comments', 'likes', 'shares']:
        return jsonify(**{'error': {'message': 'Invalid metric name'}})
    metric = '$posts.' + metric
    pipeline = [
        # Filters the documents to pass only the documents that match the specified condition(s)
        {'$match': {'page_id': page_id}},
        # Deconstructs an array field from the input documents to an output document for each element
        {'$unwind': '$posts'},
        # Groups documents by some specified expression
        {'$group': {'_id': page_id, 'sum': {'$sum': metric}}}

        # {"$group": {"_id": "$famous", "count": {"$sum": 1}}}

    ]
    sum_posts = app.db.fb_page.aggregate(pipeline)
    return jsonify(**{"data": list(sum_posts)})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
