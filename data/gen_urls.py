#!/usr/bin/python
import json

d = eval(open('urls.out').read())

print json.dumps(dict(d).items())
