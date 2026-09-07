#!/usr/bin/env python3
"""Resolve the topic list to canonical Wikipedia URLs and write data/topics.json.

- The displayed title is set to the *canonical* Wikipedia article title returned
  by the API (after following redirects), so names match the articles exactly.
- Topics are listed within each section in a deliberate logical order
  (chronological for history; thematic sub-clusters elsewhere).
- Missing pages and disambiguation pages are flagged for manual review.
"""
import urllib.request, urllib.parse, json, time, os

UA = "personal-website-topics/1.0 (alaric.hunz@gmail.com)"

# Query-title overrides (rarely needed now that inputs use precise titles).
OVERRIDE = {}

# (group name, [titles in logical display order]).
GROUPS = [
 ("History", [
   "House of Wisdom",
   "Destruction under the Mongol Empire",
   "Matteo Ricci",
   "Age of Enlightenment",
   "American Civil War",
   "Abraham Lincoln's second inaugural address",
   "Taiwan under Japanese rule",
   "Tokugawa Iesato",
   "World War I",
   "Second Sino-Japanese War",
   "World War II",
   "Europe first",
   "Pacific War",
   "Philippines campaign (1944–1945)",
   "German submarine U-977",
   "German submarine U-530",
   "Chinese Civil War",
   "Cold War",
   "Korean War",
   "Vietnam War",
   "Shoichi Yokoi",
   "Teruo Nakamura",
   "Hiroo Onoda",
 ]),
 ("Economics & Finance", [
   "Economics",
   "Econometrics",
   "Austrian School",
   "Chicago school of economics",
   "Keynesian economics",
   "Monetarism",
   "Communism",
   "Henry George",
   "George Stigler",
   "John D. Rockefeller",
   "Warren Buffett",
   "Peter Lynch",
   "John Bogle",
   "Index fund",
   "Fidelity Magellan Fund",
   "Aladdin (BlackRock)",
   "Commodity market",
   "Intermarket sweep order",
   "Straight-through processing",
   "Freddie Mac",
   "Gnomes of Zurich",
   "United States non-interventionism",
   "Positive non-interventionism",
   "Congestion pricing",
   "Economic inequality",
   "Gender pay gap",
   "Economic consequences of population decline",
   "Pensions in Chile",
   "Blood diamond",
   "Miracle of Chile",
   "Economy of Hong Kong",
   "Economy of Switzerland",
   "The Economist",
 ]),
 ("Philosophy & Religion", [
   "Socrates",
   "Aristotle",
   "Stoicism",
   "Epictetus",
   "Meditations",
   "Friedrich Nietzsche",
   "Meaning of life",
   "Fine-tuned universe",
   "The Unreasonable Effectiveness of Mathematics in the Natural Sciences",
   "Bhagavad Gita",
   "Book of Job",
   "The Sheep and the Goats",
   "Thorn in the flesh",
   "Predestination",
   "Capital punishment in the Bible",
   "Christian pacifism",
   "Protestant work ethic",
   "Wealth and religion",
   "Homeless Jesus",
   "John Vianney",
   "Carlo Acutis",
   "Catholic Church in South Korea",
   "Christianity in Korea",
 ]),
 ("Literature", [
   "Frankenstein",
   "Moby-Dick",
   "Fyodor Dostoevsky",
   "The Brothers Karamazov",
   "The Secret Life of Walter Mitty",
   "The Alchemist (novel)",
 ]),
 ("Engineering & Computer Science", [
   "Engineering",
   "History of engineering",
   "Computer science",
   "Data structure",
   "Hash table",
   "Breadth-first search",
   "Neural network (machine learning)",
   "Instruction pipelining",
   "Mobile computing",
   "Rubber duck debugging",
   "Apple Vision Pro",
   "Multi-directional Impact Protection System",
 ]),
 ("Culture", [
   "History of tea in Japan",
   "Japanese tea ceremony",
   "Gongfu tea",
   "Longjing tea",
   "Sweet tea",
   "Tea pet",
   "Tokoname ware",
   "Ichijū-sansai",
   "Japanese cheesecake",
   "Bonsai",
   "Japanese dry garden",
   "Japanese Garden (Houston)",
   "National Cherry Blossom Festival",
   "Baseball in Japan",
 ]),
 ("Music", [
   "Led Zeppelin",
   "Rush (band)",
   "Pink Floyd",
   "Any Colour You Like",
   "Daft Punk",
   "Fado",
   "Japanese jazz",
   "Jazz kissa",
   "Meikyoku kissa",
   "Village Vanguard",
 ]),
 ("Geography", [
   "California",
   "Washington (state)",
   "Colorado",
   "New Hampshire",
   "North Carolina",
   "Tennessee",
   "Texas",
   "Austin, Texas",
   "Climate change in Texas",
   "Canada",
   "Argentina",
   "Switzerland",
   "Germany",
   "Florence",
   "Tavira",
   "Cycling in the Netherlands",
   "Deadman's Island (Kent)",
   "Japan",
   "Osaka",
   "Shōdoshima",
   "Taiwan",
   "Taiwanese Mandarin",
   "Singapore",
   "Malaysia",
 ]),
 ("Miscellaneous", [
   "Jensen Huang",
   "Horacio Pagani (auto executive)",
   "Jeanne Calment",
   "Emanuel Bronner",
   "Castile soap",
   "Vegan soap",
   "Dr. Bronner's Magic Soaps",
   "Adventist Health Studies",
   "Singapore math",
   "National Geographic",
   "University of Notre Dame",
   "Mission Revival architecture",
   "Running boom of the 1970s",
   "Athletics at the 1904 Summer Olympics – Men's marathon",
   "Time Cube",
 ]),
]

def resolve(title):
    q = OVERRIDE.get(title, title)
    url = ("https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1"
           "&prop=info|pageprops&inprop=url&titles=" + urllib.parse.quote(q))
    for _ in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.load(r)
            page = next(iter(data["query"]["pages"].values()))
            if "missing" in page:
                return None, "MISSING"
            if page.get("pageprops", {}).get("disambiguation") is not None:
                return page.get("fullurl"), "DISAMBIG"
            return page["fullurl"], page["title"]  # canonical title
        except Exception:
            time.sleep(1.5)
    return None, "ERROR"

groups_out = []
flags = []
for name, titles in GROUPS:
    topics = []
    for t in titles:
        link, status = resolve(t)
        if status in ("MISSING", "DISAMBIG", "ERROR"):
            flags.append((name, t, status, link))
            display = t
        else:
            display = status  # canonical Wikipedia title
        topics.append({"title": display, "url": link})
        time.sleep(0.25)
    groups_out.append({"name": name, "topics": topics})

os.makedirs("data", exist_ok=True)
json.dump({"groups": groups_out}, open("data/topics.json", "w"), indent=2, ensure_ascii=False)

total = sum(len(g["topics"]) for g in groups_out)
print(f"wrote data/topics.json — {total} topics in {len(groups_out)} groups")
print("groups:", [(g["name"], len(g["topics"])) for g in groups_out])
print("\nFLAGGED (review these):")
for name, t, status, link in flags:
    print(f"  [{status}] {t}  ({name})  {link or ''}")
if not flags:
    print("  none — all resolved cleanly")
