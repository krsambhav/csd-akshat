from difflib import get_close_matches
from meds import medArr
w='etoposide'
for med in list(set(get_close_matches(w, ['Etoposide']))):
    print(med)

