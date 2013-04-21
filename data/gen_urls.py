#!/usr/bin/python
import json

def convert(f_in, f_out):
    data = eval(open(f_in).read())
    open(f_out, 'w').write(json.dumps(dict([(y, url) for (y, h, tgt, url) in data]).items()))

convert('vger1.out', '../html/urls_vger1.json')
convert('vger2.out', '../html/urls_vger2.json')

