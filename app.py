# -*- coding: utf-8 -*-

import os
from flask import Flask, jsonify, render_template
from rate_limiter import limiter
import sqlalchemy

# web app
app = Flask(__name__, static_folder='frontend')

# database engine
engine = sqlalchemy.create_engine(os.getenv('SQL_URI'))


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/error')
def error():
    return render_template('error.html')


@app.route('/events/hourly')
@limiter(200, 'hour')
def events_hourly():
    return query_helper('''
        SELECT date, hour, events
        FROM public.hourly_events
        ORDER BY date, hour
        LIMIT 168;
    ''')


@app.route('/events/daily')
@limiter(5, 'minute')
def events_daily():
    return query_helper('''
        SELECT date, SUM(events) AS events
        FROM public.hourly_events
        GROUP BY date
        ORDER BY date
        LIMIT 7;
    ''')


@app.route('/stats/hourly')
@limiter(100, 'hour')
def stats_hourly():
    return query_helper('''
        SELECT date, hour, impressions, clicks, revenue
        FROM public.hourly_stats
        ORDER BY date, hour
        LIMIT 168;
    ''')


@app.route('/stats/daily')
@limiter(6, 'minute')
def stats_daily():
    return query_helper('''
        SELECT date,
            SUM(impressions) AS impressions,
            SUM(clicks) AS clicks,
            SUM(revenue) AS revenue
        FROM public.hourly_stats
        GROUP BY date
        ORDER BY date
        LIMIT 7;
    ''')


@app.route('/poi')
def poi():
    return query_helper('''
        SELECT *
        FROM public.poi;
    ''')


def query_helper(query):
    with engine.connect() as conn:
        result = conn.execute(query).fetchall()
        return jsonify([dict(row.items()) for row in result])
