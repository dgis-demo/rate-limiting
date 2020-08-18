import asyncio
from threading import Thread
from datetime import datetime as dt
from collections import Counter
from flask import request

storage = dict()


async def clear_storage(time):
    """
    Function for cleaning expired links and counters for each user in the storage
    :param time: Number of seconds for the task
    :return: Nothing
    """
    while True:
        await asyncio.sleep(time)
        for ip in storage:
            expired_links = storage[ip]['expired']
            expired_links.clear()
            storage[ip]['counter'] = Counter()


def clear_storage_thread(loop, time):
    """
    An auxiliary function for using the threading module for the clear_storage function
    :param loop: The loop which is created as 'asyncio.unix_events._UnixSelectorEventLoop' type
    :param time: Number of seconds for delaying of storage cleaning
    :return: Nothing
    """
    asyncio.set_event_loop(loop)
    loop.run_until_complete(clear_storage(time))


def time_parser(url):
    """
    A small parser for url-viewed strings
    :param url: Url-string with data with time and a number of requests
    :return: Dictionary, e.g. {'minute': 34}, where 34 is the current minute for a different url-string
    """
    split = url.split('#')
    return {split[0]: split[1]}


def limiter(limit_count, time_period):
    """
    This function helps to limit the number of API requests
    :param limit_count: Limit of counts (int)
    :param time_period: Time period 'minute' or 'hour' (string)
    :return: View function
    """
    global storage

    def decorator(view_function):
        def wrapper():
            ip = request.remote_addr
            if not storage:
                storage[ip] = dict(counter=Counter(), expired=set())
            counter = storage[ip]['counter']
            expired_links = storage[ip]['expired']
            current_time = dict(hour=dt.now().hour, minute=dt.now().minute)
            request_url_limit = '{}#{}#{}#{}'.format(time_period, current_time[time_period], limit_count, request.url)
            if counter[request_url_limit] < limit_count:
                counter[request_url_limit] += 1
                return view_function()
            else:
                if request_url_limit not in expired_links:
                    expired_links.add(request_url_limit)
                return """<h1>Too Many Requests</h1><hr><p>{} requests per {} is allowed</p>""".format(
                    limit_count, time_period), 429
        wrapper.__name__ = view_function.__name__
        return wrapper
    return decorator


event_loop = asyncio.new_event_loop()
"""Clean storage in a separate thread every single hour (3600 seconds)"""
thread = Thread(target=clear_storage_thread, args=(event_loop, 3600))
thread.start()
