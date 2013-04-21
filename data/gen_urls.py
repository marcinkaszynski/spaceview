#!/usr/bin/python
import json

data = eval(open('vger1.out').read())

print json.dumps(dict([(y, url) for (y, h, tgt, url) in data]).items())
