# -*- coding: utf-8 -*-
"""
"""

from flask import render_template, Flask
import requests
from bs4 import BeautifulSoup
import json


URL = "https://www.nytimes.com/puzzles/spelling-bee"
app = Flask(__name__)


def get_data():
    resp = requests.get(URL)
    soup = BeautifulSoup(str(resp.content), "html.parser")
    for s in soup.find_all("script"):
        if s.text.startswith("window.gameData"):
            j = s.text.split(" = ")[-1]
    d = json.loads(j)["today"]

    # j = '{"expiration": 1685602800, "displayWeekday": "Wednesday", "displayDate": "May 31, 2023", "printDate": "2023-05-31", "centerLetter": "t", "outerLetters": ["g", "h", "o", "r", "u", "w"], "validLetters": ["t", "g", "h", "o", "r", "u", "w"], "pangrams": ["outgrowth", "wrought"], "answers": ["outgrowth", "wrought", "goth", "gout", "grotto", "grout", "growth", "hoot", "hurt", "ought", "outgo", "outgrow", "outro", "outthought", "root", "rotgut", "rotor", "rout", "thorough", "thou", "though", "thought", "through", "throughout", "throw", "thug", "toot", "tooth", "toro", "tort", "tough", "tour", "tout", "trot", "troth", "trough", "trout", "truth", "tutor", "tutu", "woot", "wort", "worth", "wroth"], "id": 18789, "freeExpiration": 0, "editor": "Sam Ezersky"}'
    # d = json.loads(j)

    d["centerLetter"] = d["centerLetter"].upper()
    d["outerLetters"] = " ".join(d["outerLetters"]).upper()
    d["answers"] = " ".join(d["answers"])
    d["pangrams"] = " ".join(d["pangrams"])
    return d


@app.route("/")
def sbee():
    data = get_data()
    return render_template("index.html", data=data)
