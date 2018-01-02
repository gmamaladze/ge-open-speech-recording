from flask import Flask
from flask import abort
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import send_from_directory
from flask import jsonify
import random
import datetime

from google.cloud import storage

from werkzeug.utils import secure_filename

import os
import uuid

app = Flask(__name__)

# Configure this environment variable via app.yaml
CLOUD_STORAGE_BUCKET = os.environ['CLOUD_STORAGE_BUCKET']
# [end config]


from google.appengine.ext import ndb


class Sound(ndb.Model):
    label_ge = ndb.StringProperty()
    label_translit = ndb.StringProperty()
    google_transcript = ndb.StringProperty()
    google_confidence = ndb.FloatProperty()
    vote = ndb.IntegerProperty(default=0)
    rnd_pos = ndb.IntegerProperty(default=0)


@app.route("/review")
def review():
    try:
        return render_template("review.html")
    except Exception, e:
        print(e)

@app.route("/review_thanks")
def review_thanks():
    try:
        return render_template("review_thanks.html")
    except Exception, e:
        print(e)


@app.route('/get_to_vote')
def get_to_vote():
    start_rnd_pos = random.randint(1, 100000)
    try:
        query = Sound.query(Sound.rnd_pos >= start_rnd_pos, Sound.vote.IN([-2, -1, 0, 1, 2])).order(Sound.rnd_pos)
        # query = Sound.query().order()
        entities = query.fetch(1)
    except Exception, ex:
        print(ex)
        raise ex
    result = {}
    for e in entities:
        print(e)
        key = e.key.id()
        print(key)
        ogg_blob_name = 'ogg/' + key + ".ogg"
        try:
            gcs = storage.Client()
            bucket = gcs.get_bucket(CLOUD_STORAGE_BUCKET)
            blob = storage.Blob(ogg_blob_name, bucket)
        except Exception, ex:
            print(ex)
            raise ex

        if not blob:
            abort(404)

        url = blob.generate_signed_url(
            expiration=datetime.timedelta(minutes=5),
            method='GET')
        result["url"] = url
        result["label"] = e.label_ge
        result["key"] = key
        print(result)
        return jsonify(result)


@app.route('/vote', methods=['POST'])
def do_vote():
    key = request.args.get('key')
    vote = request.args.get('vote')
    sound = Sound.get_by_id(key)
    if vote == "YES":
        sound.vote += 1
    if vote == "NO":
        sound.vote -= 1
    sound.put()
    make_response("ok")

# CSRF protection, see http://flask.pocoo.org/snippets/3/.


@app.before_request
def csrf_protect():
    if request.method == "POST":
        token = session['_csrf_token']
        if not token or token != request.args.get('_csrf_token'):
            abort(403)


def generate_csrf_token():
    if '_csrf_token' not in session:
        session['_csrf_token'] = uuid.uuid4().hex
    return session['_csrf_token']


app.jinja_env.globals['csrf_token'] = generate_csrf_token
app.secret_key = os.environ['SESSION_SECRET_KEY']

if __name__ == "__main__":
    app.run(debug=True)
