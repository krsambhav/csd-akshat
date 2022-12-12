import doctest
import os, io
import pandas as pd
from flask import Flask, jsonify, request
from flask import send_file
from flask_cors import CORS, cross_origin
import json, base64
import time
import pandas as pd    
from difflib import get_close_matches
from meds import medArr
from model import returnOCR



app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def word2vec(word):
    from collections import Counter
    from math import sqrt

    # count the characters in word
    cw = Counter(word)
    # precomputes a set of the different characters
    sw = set(cw)
    # precomputes the "length" of the word vector
    lw = sqrt(sum(c*c for c in cw.values()))

    # return a tuple
    return cw, sw, lw

def cosdis(v1, v2):
    # which characters are common to the two words?
    common = v1[1].intersection(v2[1])
    # by definition of cosine distance we have
    return sum(v1[0][ch]*v2[0][ch] for ch in common)/v1[2]/v2[2]


def lcs(X, Y):
	# find the length of the strings
	m = len(X)
	n = len(Y)

	# declaring the array for storing the dp values
	L = [[None]*(n + 1) for i in range(m + 1)]

	"""Following steps build L[m + 1][n + 1] in bottom up fashion
	Note: L[i][j] contains length of LCS of X[0..i-1]
	and Y[0..j-1]"""
	for i in range(m + 1):
		for j in range(n + 1):
			if i == 0 or j == 0 :
				L[i][j] = 0
			elif X[i-1] == Y[j-1]:
				L[i][j] = L[i-1][j-1]+1
			else:
				L[i][j] = max(L[i-1][j], L[i][j-1])

	# L[m][n] contains the length of LCS of X[0..n-1] & Y[0..m-1]
	return L[m][n]

@app.route('/', methods = ['GET', 'POST'])
@cross_origin()
def run():
	return 'online'

@app.route('/setimg', methods=['POST'])
def set_image():
	s = json.loads(request.data)['base64']
	s = s[s.index(',')+1:]
	with open ('../data/Sample2.jpg', 'wb') as fh:
		fh.write(base64.b64decode(s))
	return 'OK'


@app.route('/ocr')
@cross_origin()
def ocr():
	category = request.args.get('type')
	# print(medArr[category])
	# print(category)
	docText = returnOCR()
	cpy=docText
	if '\n' in docText:
		docText = docText[docText.index('\n')+1:]
	docText = docText.replace(' ', '\n')
	docArr = docText.split('\n')
	newDocArr = []
	for _ in docArr:
		if len(_) > 4:
			newDocArr.append(_)
	docArr = cpy.split('\n')
	foundMedsArr = []
	print('docArr', docArr)
	print('newDocArr', newDocArr)
	

	ma = 0
	ans = ''

	for word in newDocArr:
		w = word.lower()
		ma = 0
		ans = ''
		print(w)
		print(list(set(get_close_matches('ETOPOSIDE', ['Etoposide']))))
		for med in list(set(get_close_matches(w, medArr[category]))):
			print(med)
			cs = lcs(w, med)
			tempW = word2vec(w)
			tempMed = word2vec(med)
			cs = cosdis(tempW, tempMed)
			if cs > ma:
				ma = cs
				ans = med
		if ma != 0:
			foundMedsArr.append(ans)
		
	return jsonify(docArr, foundMedsArr)

if __name__ == '__main__':
	app.run(debug = True)


	