import math
from datetime import datetime, timedelta
from dateutil import rrule
from random import randint
import json


def generate_heartrate_data ():
    date_end = datetime.today()
    date_start = date_end - timedelta(days=20)

    dates = []
    for day in rrule.rrule(rrule.DAILY, dtstart=date_start,
                           until=date_end):
        dates.append(day.strftime('%Y-%m-%d %H:%M:%S'))
    result = []
    for day in dates:
        value_dict = {
            'type': 'Heartrate',
            'unit': 'bpm',
            'timestamp': day,
            'deviceID': '123456789abc',
            'values': {
                'val': 60 + randint(0, 90)
            }
        }
        result.append(value_dict)
    return result


if __name__ == "__main__":
    js = generate_heartrate_data()
    with open('test_data.json', 'w') as outfile:
        json.dump(js, outfile)
