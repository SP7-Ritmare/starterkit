from django.db import models

# override search function
from geonode.search import search
from geonode.search.search import _build_kw_only_query

from django.db.models import Q
import operator

def  _build_map_layer_text_query2(q, query, query_keywords=False):
    '''Build an OR query on title and abstract from provided search text.
    if query_keywords is provided, include a query on the keywords attribute if
    specified.
    return a Q object
    '''
    # title or abstract contains entire phrase
    subquery = [Q(title__icontains=query.query),Q(abstract__icontains=query.query),Q(supplemental_information__icontains=query.query)]
    # tile or abstract contains pieces of entire phrase
    if len(query.split_query) > 1:
        subquery.extend([Q(title__icontains=kw) for kw in query.split_query])
        subquery.extend([Q(abstract__icontains=kw) for kw in query.split_query])
        subquery.extend([Q(supplemental_information__icontains=kw) for kw in query.split_query])
    # or keywords match any pieces of entire phrase
    if query_keywords and query.split_query:
        subquery.append(_build_kw_only_query(query.split_query))
    # if any OR phrases exists, build them
    if subquery:
        q = q.filter(reduce( operator.or_, subquery))
    return q


search._build_map_layer_text_query = _build_map_layer_text_query2


